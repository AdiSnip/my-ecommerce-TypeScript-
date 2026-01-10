import { Request, Response } from 'express';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';
import { uploadOnCloudinary } from '../utils/uploadCloudinary';
import { generateAccessAndRefreshTokens } from '../utils/generateToken';
import Otp from '../models/otp.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { sendEmail } from '../utils/mailService';

// Cookie options
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: '/'
};

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const registration = asyncHandler(async (req: Request, res: Response) => {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
        throw new ApiError(400, "Name, email, and password are required");
    }

    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "An account with this email already exists");
    }

    let profilePictureUrl = "";
    if (req.file) {
        const uploadResult = await uploadOnCloudinary(req.file.path);
        if (uploadResult) {
            profilePictureUrl = uploadResult.secure_url;
        } else {
            throw new ApiError(500, "Failed to process profile picture");
        }
    }

    const newUser = await User.create({
        email,
        name,
        password,
        profilePicture: profilePictureUrl || undefined
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(newUser._id.toString());

    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    return res
        .status(201)
        .cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 })
        .cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 })
        .json(new ApiResponse(201, { user: userResponse }, "User registered successfully"));
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id.toString());

    const loggedInUser = user.toObject();
    delete loggedInUser.password;
    delete loggedInUser.refreshToken;

    return res
        .status(200)
        .cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 })
        .cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 })
        .json(new ApiResponse(200, { user: loggedInUser, accessToken }, "User logged in successfully"));
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout the user
 * @access  Private
 */
export const logout = asyncHandler(async (req: any, res: Response) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(204).json(new ApiResponse(204, {}, "Already logged out"));
    }

    await User.updateOne(
        { _id: req.user._id },
        { $set: { refreshToken: "" } }
    );

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return res.status(200).json(new ApiResponse(200, {}, "Logout successful"));
});

/**
 * @route   POST /api/v1/auth/send-otp
 * @desc    Send OTP for email verification
 * @access  Public
 */
export const sendEmailVerification = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) throw new ApiError(400, "Email is required");

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");

    const existingOtp = await Otp.findOne({ email });
    const now = new Date();

    if (existingOtp) {
        const timeDiff = (now.getTime() - existingOtp.lastSentAt.getTime()) / 1000;
        if (timeDiff < 60) {
            throw new ApiError(429, `Please wait ${Math.ceil(60 - timeDiff)} seconds before requesting again.`);
        }

        if (existingOtp.count >= 5) {
            throw new ApiError(429, "Too many requests. Please try again in 5 minutes.");
        }
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000);

    await Otp.findOneAndUpdate(
        { email },
        {
            otp: generatedOtp,
            lastSentAt: now,
            $inc: { count: 1 },
            createdAt: now
        },
        { upsert: true, new: true }
    );

    const emailHtml = `
        <div style="max-width: 500px; margin: auto; border: 1px solid #eee; padding: 20px; font-family: sans-serif;">
            <h2 style="color: #333; text-align: center;">Verification Code</h2>
            <p>Use the following code to complete your request. This code is valid for <b>5 minutes</b>.</p>
            <div style="background: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
                ${generatedOtp}
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
                If you did not request this code, please ignore this email or secure your account.
            </p>
        </div>
    `;

    await sendEmail(email, 'Your Verification Code', emailHtml);

    return res.status(200).json(new ApiResponse(200, {}, "OTP sent successfully. Check your inbox."));
});

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify OTP and return password reset token
 * @access  Public
 */
export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
        throw new ApiError(404, "OTP expired or not found. Please request a new one.");
    }

    if (otpRecord.otp !== Number(otp)) {
        throw new ApiError(400, "Invalid verification code.");
    }

    const resetToken = jwt.sign(
        { email: email },
        process.env.RESET_TOKEN_SECRET as string,
        { expiresIn: '15m' }
    );

    await Otp.deleteOne({ _id: otpRecord._id });

    return res.status(200).json(new ApiResponse(200, { resetToken }, "OTP verified successfully."));
});

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using reset token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { newPassword, confirmPassword } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, "Unauthorized. Reset token missing.");
    }

    const token = authHeader.split(' ')[1];

    let decoded: any;
    try {
        decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET as string);
    } catch (err) {
        console.error("Reset Token Verification Error:", err);
        throw new ApiError(401, "Reset token expired or invalid.");
    }

    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "Passwords do not match");
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) throw new ApiError(404, "User no longer exists");

    user.password = newPassword;
    user.refreshToken = undefined;
    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password updated successfully. Please login."));
});
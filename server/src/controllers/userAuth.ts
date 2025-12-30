import { Request, Response } from 'express';
import User from '../models/userSchema.model';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { IUser } from '../types/userSchema.type';
import { uploadOnCloudinary } from '../utils/uploadCloudinary';
import { generateAccessAndRefreshTokens } from '../utils/generateToken';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'iampro9236@gmail.com',
        pass: process.env.NODEMAILER_APP_PASSWORD as string
    }
});


/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user, upload avatar to Cloudinary, and issue cookies
 * @access  Public
 */
export const registration = async (req: Request, res: Response) => {
    try {
        const { email, name, password } = req.body;

        // 1. Validate required text fields
        if (![email, name, password].every((field) => field?.trim())) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // 2. Prevent duplicate account creation
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "An account with this email already exists" });
        }

        /**
         * 3. Handle Optional Profile Picture
         * If Multer finds a file, we upload it to Cloudinary.
         * If not, we simply proceed with a null or default value.
         */
        let profilePictureUrl = ""; // Default empty or your preferred default avatar link

        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult) {
                profilePictureUrl = uploadResult.secure_url;
            } else {
                // If the file exists but upload fails, alert the user
                return res.status(500).json({ message: "Failed to process profile picture" });
            }
        }

        // 4. Database Persistence
        // Pre-save hooks in UserSchema should handle password hashing
        const newUser = await User.create({
            email: email as string,
            name: name as string,
            password: password as string,
            profilePicture: profilePictureUrl || undefined
        });

        // 5. Authentication Token Generation
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(newUser._id.toString());

        // 6. Clean Response Data
        const userResponse = newUser.toObject();
        delete userResponse.password;
        delete userResponse.refreshToken;

        // Secure cookie settings for JWT storage
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const,
        };

        return res
            .status(201)
            .cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 }) // 1 Day
            .cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 }) // 30 Days
            .json({
                message: "User registered successfully",
                user: userResponse
            });

    } catch (error) {
        console.error("Registration Logic Failure:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user, generate tokens, and set secure cookies
 * @access  Public
 */
export const login = async (req: Request, res: Response) => {
    try {
        // 1. Destructure and validate input
        if (!req.body) {
            return res.status(400).json({
                message: "Request body is missing. Please ensure you are sending data and 'Content-Type' is set correctly (e.g., application/json)."
            });
        }
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // 2. Find user by email
        // We do not check password here yet; we only verify if the user exists
        const user = await User.findOne({ email });

        if (!user) {
            // Note: Use generic "Invalid credentials" to prevent email enumeration attacks
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 3. Verify password using the instance method defined in UserSchema
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 4. Generate Tokens (this also saves the new refresh token to the database)
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id.toString());

        // 5. Prepare User data for response
        // Convert Mongoose Document to plain JS object to delete sensitive fields
        const loggedInUser = user.toObject();
        delete loggedInUser.password;
        delete loggedInUser.refreshToken;

        // 6. Define Security-focused Cookie Options
        const cookieOptions = {
            httpOnly: true, // Mitigates XSS: Cookie cannot be accessed via document.cookie
            secure: process.env.NODE_ENV === "production", // Mitigates Sniffing: Only sent over HTTPS
            sameSite: "strict" as const, // Mitigates CSRF: Browser won't send cookie on cross-site requests
        };

        // 7. Send Response
        return res
            .status(200)
            .cookie("accessToken", accessToken, {
                ...cookieOptions,
                maxAge: 24 * 60 * 60 * 1000 // 1 Day
            })
            .cookie("refreshToken", refreshToken, {
                ...cookieOptions,
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 Days
            })
            .json({
                message: "User logged in successfully",
                user: loggedInUser,
                accessToken // Optionally send access token in JSON if frontend needs it for headers
            });

    } catch (error) {
        // Detailed logging for server-side debugging
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * @route   GET /api/v1/auth/fetchUser
 * @desc    Get the current authenticated user's profile data
 * @access  Private (Requires verifyJWT middleware)
 */
export const fetchUser = async (req: any, res: Response) => {
    try {
        /**
         * Authentication Check:
         * req.user is populated by the verifyJWT middleware after 
         * successfully decoding the Access Token and fetching the 
         * user from the database.
         */
        const user = req.user;

        // Verify if user data exists to prevent sending empty responses
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User context not found"
            });
        }

        // Return the user data (already filtered for sensitive fields in the middleware)
        return res.status(200).json({
            success: true,
            user: user
        });

    } catch (error) {
        /**
         * Error Handling:
         * Any unexpected server errors during the response phase are caught here.
         * JWT/Auth errors are handled upstream in the middleware.
         */
        console.error("Fetch User Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

/**
 * @route   PATCH /api/v1/auth/update
 * @desc    Update user profile details and/or profile picture
 * @access  Private
 */
export const updateProfile = async (req: any, res: Response) => {
    try {
        let { name, contactNumber, address } = req.body;

        if (!name && !contactNumber && !address && !req.file) {
            return res.status(400).json({ message: "No valid fields provided for update" });
        }

        if (!address && req.body['address[city]']) {
            address = {
                city: req.body['address[city]']
            };
        }
        // 1. Prepare an empty object for filtered updates
        // This prevents users from updating fields like 'role' or 'email' via this route
        const updateData: any = {};

        if (name) updateData.name = name;
        if (contactNumber) updateData.contactNumber = contactNumber;
        if (address) updateData.address = address;

        // 2. Handle Profile Picture Upload
        if (req.file) {
            const cloudResponse = await uploadOnCloudinary(req.file.path);
            if (cloudResponse) {
                updateData.profilePicture = cloudResponse.secure_url;
            }
        }

        // 3. Validation: Ensure there is actually something to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No valid fields provided for update" });
        }

        // 4. Update the Database
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            {
                new: true,           // Return the document AFTER update
                runValidators: true  // Ensure updates follow Schema rules
            }
        ).select("-password -refreshToken");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * @route   POST /api/v1/auth/sendEmailVerification
 * @desc    Send email verification link to the user
 * @access  Public
 */
export const sendEmailVerification = async (req: Request, res: Response) => {
    //resend code needs verification of domain so use it later
    // try {
    //     const resend = new Resend(process.env.RESEND_API_KEY);
    //     const { email } = req.body;

    //     const user = await User.findOne({ email });

    //     if (!user) {
    //         return res.status(404).json({ message: "User not found" });
    //     }

    //     const Token = jwt.sign({ id: user._id }, process.env.EMAIL_TOKEN_SECRET as string, { expiresIn: 10*60*1000 });

    //     const newPasswordPageUrl = `http://localhost:3000/verify-email/${Token}`;

    //     const { data, error } = await resend.emails.send({
    //         from: 'MyEcommerce <MyEcommerce@resend.dev>',
    //         to: [email],
    //         subject: 'Reset your password',
    //         html: `
    //             <h1>Password Reset</h1>
    //             <p>Click the link below to reset your password. This link expires in 1 hour.</p>
    //             <a href="${newPasswordPageUrl}">Reset Password</a>
    //         `,
    //     });
    //     if (error) {
    //         return res.status(400).json({ error });
    //     }
    //     return res.status(200).json({ message: "Email sent successfully" });
    // } catch (error) {
    //     console.error("Send Email Error:", error);
    //     return res.status(500).json({ message: "Internal Server Error" });
    // }
    //using nodemailer as alternative


    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const Token = jwt.sign({ id: user._id }, process.env.EMAIL_TOKEN_SECRET as string, { expiresIn: '10m' });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const newPasswordPageUrl = `${frontendUrl}/verify-email/${Token}`;

        const mailOptions = {
            from: '"Support Team" <iampro9236@gmail.com>',
            to: email,
            subject: 'Reset your password',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h1>Password Reset</h1>
                    <p>You requested a password reset. Click the button below to continue. <b>This link expires in 10 minutes.</b></p>
                    <a href="${newPasswordPageUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p>If the button doesn't work, copy and paste this link: ${newPasswordPageUrl}</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Send Email Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
//prepare frontend for email verification then create change password controller

/**
 * @route   GET /api/v1/auth/logout
 * @desc    Logout the user
 * @access  Private
 */
export const logout = async (req: any, res: Response) => {
    try {
        // Retrieve tokens from signed or unsigned cookies
        const { refreshToken } = req.cookies;

        // If no refresh token exists, session is already dead.
        // Return 204 (No Content) as the operation is successfully idempotent.
        if (!refreshToken) {
            return res.status(204).json({ message: "Already logged out" });
        }

        /**
         * SECURITY: Invalidate the token in the database.
         * Using updateOne is an 'atomic operation' which is significantly faster 
         * than .save() because it bypasses Mongoose middleware and validation.
         */
        await User.updateOne(
            { _id: req.user._id },
            { $set: { refreshToken: "" } }
        );

        /**
         * Browser Cookie Settings
         * Must match the configuration used when the cookies were originally set.
         */
        const cookieOptions = {
            httpOnly: true, // Prevents XSS attacks by hiding cookie from JS
            secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in prod
            sameSite: 'strict' as const, // Protection against CSRF
            path: '/'
        };

        // Remove tokens from the client browser
        res.clearCookie('accessToken', cookieOptions);
        res.clearCookie('refreshToken', cookieOptions);

        return res.status(200).json({ message: "Logout successful" });

    } catch (error) {
        // Log the full error server-side for debugging, keep client response generic
        console.error("Logout System Failure:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
//bhai update ke time delete cloudinary ke image bhi delete ho jana chahiye
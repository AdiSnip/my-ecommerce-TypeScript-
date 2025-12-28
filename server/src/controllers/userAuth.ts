import { Request, Response } from 'express';
import User from '../models/userSchema.model';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { IUser } from '../types/userSchema.type';
import { uploadOnCloudinary } from '../utils/uploadCloudinary';
dotenv.config();

const generateAccessAndRefreshTokens = async (userId: string) => {
    try {
        const user = await User.findById(userId)

        if (!user) {
            throw new Error("User not found")
        }

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw error
    }
}

export const registration = async (req: Request, res: Response) => {
    try {
        const { email, name, password } = req.body;

        // 1. Better Validation (Trim strings to avoid whitespace-only bypass)
        if (![email, name, password].every((field) => field?.trim())) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // 2. Check existence early
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 3. File handling
        const profilePicturePath = req.file?.path;
        if (!profilePicturePath) {
            return res.status(400).json({ message: "Profile picture is required" });
        }

        // 4. Cloudinary Upload
        const profilePictureData = await uploadOnCloudinary(profilePicturePath);
        if (!profilePictureData) {
            return res.status(500).json({ message: "Failed to upload profile picture" });
        }

        // 5. Create User
        const newUser = await User.create({
            email,
            name,
            password, // pre-save hook for bcrypt in userSchema
            profilePicture: profilePictureData.secure_url // Use secure_url for HTTPS
        });

        // 6. Generate Tokens (Optimized: pass the user instance directly)
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(newUser._id.toString());

        // 7. Cleanup Response in memory (Saves 1 DB Query)
        const loggedInUser = newUser.toObject();
        delete loggedInUser.password;
        delete loggedInUser.refreshToken;

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only secure in production
            sameSite: "strict" as const,
        };

        return res
            .status(201)
            .cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 })
            .cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 })
            .json({
                message: "User registered successfully",
                user: loggedInUser
            });

    } catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
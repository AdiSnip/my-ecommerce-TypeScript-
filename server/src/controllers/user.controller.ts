import { Request, Response } from 'express';
import User from '../models/user.model';
import dotenv from 'dotenv';
import { uploadOnCloudinary } from '../utils/uploadCloudinary';
import { DeleteCloudinaryImage } from '../utils/deleteCloudinaryImage';

dotenv.config();


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
        let { name, contactNumber, street, city, state, zipCode, country } = req.body;

        if (!name && !contactNumber && !street && !city && !state && !zipCode && !country && !req.file) {
            return res.status(400).json({ message: "No valid fields provided for update" });
        }

        // 1. Prepare an empty object for filtered updates
        // This prevents users from updating fields like 'role' or 'email' via this route
        const updateData: any = {};

        if (name) updateData.name = name;
        if (contactNumber) updateData.contactNumber = contactNumber;

        // Use dot notation for nested address fields to prevent overwriting the entire object
        if (street) updateData["address.street"] = street;
        if (city) updateData["address.city"] = city;
        if (state) updateData["address.state"] = state;
        if (zipCode) updateData["address.zipCode"] = zipCode;
        if (country) updateData["address.country"] = country;

        // 2. Handle Profile Picture Upload and old image deletion
        if (req.file) {
            const cloudResponse = await uploadOnCloudinary(req.file.path);
            if (cloudResponse) {
                updateData.profilePicture = cloudResponse.secure_url;
                if (req.user.profilePicture) {
                    const oldPublicId = DeleteCloudinaryImage.extractPublicId(req.user.profilePicture);
                    if (oldPublicId) {
                        await DeleteCloudinaryImage.deleteImage(oldPublicId);
                    }
                }
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

//prepare frontend for email verification then create change password controller

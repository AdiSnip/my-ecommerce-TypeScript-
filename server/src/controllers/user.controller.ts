import { Request, Response } from 'express';
import User from '../models/user.model';
import { uploadOnCloudinary } from '../utils/uploadCloudinary';
import { DeleteCloudinaryImage } from '../utils/deleteCloudinaryImage';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * @route   GET /api/v1/user/me
 * @desc    Get the current authenticated user's profile data
 * @access  Private
 */
export const fetchUser = asyncHandler(async (req: any, res: Response) => {
    const user = req.user;

    if (!user) {
        throw new ApiError(404, "User context not found");
    }

    return res.status(200).json(new ApiResponse(200, { user }, "User fetched successfully"));
});

/**
 * @route   PATCH /api/v1/user/update
 * @desc    Update user profile details
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req: any, res: Response) => {
    const { name, contactNumber, street, city, state, zipCode, country } = req.body;

    if (!name && !contactNumber && !street && !city && !state && !zipCode && !country && !req.file) {
        throw new ApiError(400, "No valid fields provided for update");
    }

    const updateData: any = {};

    if (name) updateData.name = name;
    if (contactNumber) updateData.contactNumber = contactNumber;

    if (street) updateData["address.street"] = street;
    if (city) updateData["address.city"] = city;
    if (state) updateData["address.state"] = state;
    if (zipCode) updateData["address.zipCode"] = zipCode;
    if (country) updateData["address.country"] = country;

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

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No valid fields provided for update");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        {
            new: true,
            runValidators: true
        }
    ).select("-password -refreshToken");

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, { user: updatedUser }, "Profile updated successfully"));
});

export const addInteraction = asyncHandler(async (req: any, res: Response) => {
    const { categoryId } = req.body;

    if (!categoryId) {
        throw new ApiError(400, "Category ID is required");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const existingInteraction = user.interaction.find((interaction) => interaction.category.toString() === categoryId);

    if (existingInteraction) {
        existingInteraction.viewCount++;
    } else {
        if (user.interaction.length >= 5) {
            let minIndex = 0;
            let minViewCount = user.interaction[0].viewCount;

            for (let i = 1; i < user.interaction.length; i++) {
                if (user.interaction[i].viewCount < minViewCount) {
                    minViewCount = user.interaction[i].viewCount;
                    minIndex = i;
                }
            }
            user.interaction.splice(minIndex, 1); // Remove the interaction with the lowest view count
        }
        user.interaction.push({ category: categoryId, viewCount: 1 });
    }

    await user.save();

    return res.status(200).json(new ApiResponse(200, { user }, "Interaction added successfully"));
});
import { Request, Response } from 'express';
import User from '../models/user.model';
import { uploadOnCloudinary } from '../utils/uploadCloudinary';
import { DeleteCloudinaryImage } from '../utils/deleteCloudinaryImage';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import mongoose from 'mongoose';
import { Business } from '../models/business.model';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { Cart } from '../models/cart.model';
import { Sku } from '../models/sku.model';

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

/**
 * @route   PATCH /api/v1/user/add-interaction/:categoryId
 * @desc    Add interaction to user profile
 * @access  Private
 */
export const addInteraction = asyncHandler(async (req: any, res: Response) => {
    const { categoryId } = req.params;

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

/**
 * @route   PATCH /api/v1/user/change-password
 * @desc    Change user password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req: any, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    // check old pass is correct

    if (!oldPassword || !newPassword) {
        throw new ApiError(401, "Please provide old and new password")
    }
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const isPasswordMatched = await user.comparePassword(oldPassword);
    if (!isPasswordMatched) {
        throw new ApiError(401, "Invalid old password")
    }
    // change it to new pass
    user.password = newPassword;
    await user.save();
    return res.status(200).json(new ApiResponse(200, { user }, "Password changed successfully"))
})

/**
 * @route   GET /api/v1/user/recommended-categories
 * @desc    Get recommended categories for user
 * @access  Private
 */
export const getRecommendedCategories = asyncHandler(async (req: any, res: Response) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const recommendedCategories = user.interaction.map((interaction) => interaction.category);
    return res.status(200).json(new ApiResponse(200, { recommendedCategories }, "Recommended categories fetched successfully"))
})

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users for admin
 * @access  Private
 */
export const getUsersByAdmin = asyncHandler(async (req: any, res: Response) => {
    // 0. Authorization Check
    if (req.user.role !== "admin") {
        throw new ApiError(403, "Forbidden: Only admins can access this data");
    }

    // 1. Destructure query parameters for filtering and pagination
    const {
        name, email, role, street, city, state,
        zipCode, country, contactNumber, businessName, businessId
    } = req.query;

    // 2. Setup Pagination variables (Default to page 1, limit 10)
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // 3. Build dynamic query objects
    const userQuery: any = {};
    const businessQuery: any = {};

    if (name) userQuery.name = { $regex: name, $options: 'i' };
    if (email) userQuery.email = email;
    if (role) userQuery.role = role;
    if (contactNumber) userQuery.contactNumber = contactNumber;

    // Handle nested address fields for userQuery
    if (street) userQuery["address.street"] = street;
    if (city) userQuery["address.city"] = city;
    if (state) userQuery["address.state"] = state;
    if (zipCode) userQuery["address.zipCode"] = zipCode;
    if (country) userQuery["address.country"] = country;

    // Business filters (to be used after $lookup)
    if (businessName) businessQuery["business.name"] = { $regex: businessName, $options: 'i' };
    if (businessId) businessQuery["business._id"] = businessId;

    // 4. Execute Aggregation Pipeline
    const pipeline: any[] = [
        { $match: userQuery },
        {
            $lookup: {
                from: "businesses",
                localField: "_id",
                foreignField: "owner",
                as: "business"
            }
        },
        {
            $unwind: {
                path: "$business",
                preserveNullAndEmptyArrays: true
            }
        },
        { $match: businessQuery }, // Apply business filters after join
        { $sort: { createdAt: -1 } },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            email: 1,
                            role: 1,
                            contactNumber: 1,
                            address: 1,
                            business: 1,
                            createdAt: 1,
                        }
                    }
                ]
            }
        }
    ];

    const results = await User.aggregate(pipeline);
    const result = results[0] || { metadata: [], data: [] };
    const users = result.data;
    const totalUsers = result.metadata[0]?.total || 0;
    const totalPages = Math.ceil(totalUsers / limit);

    // 5. Check if results exist
    if (!users || users.length === 0) {
        return res.status(200).json(new ApiResponse(200, { users: [], totalUsers: 0, totalPages: 0, page, limit }, "No users found"));
    }

    // 6. Send Response
    return res.status(200).json(new ApiResponse(200, { users, totalPages, page, limit, totalUsers }, "Users fetched successfully"));
});

/**
 * @route   PATCH /api/v1/admin/update-user/:userId
 * @desc    Update user profile details
 * @access  Private
 */
export const updateUserByAdmin = asyncHandler(async (req: any, res: Response) => {
    const { userId } = req.params;

    // 1. Authorization Check
    if (req.user.role !== "admin") {
        throw new ApiError(403, "Forbidden: Only admins can perform this action");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // 2. Protect other Admins
    if (user.role === "admin") {
        throw new ApiError(403, "Only Super Admins can modify Admin accounts");
    }

    // 3. Destructure body
    const { name, email, role, contactNumber, street, city, state, zipCode, country } = req.body;

    // 4. Update top-level fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (contactNumber) user.contactNumber = contactNumber;

    // 5. Update nested address fields safely
    if (street || city || state || zipCode || country) {
        user.address = {
            ...user.address, // Keep existing fields if not provided
            ...(street && { street }),
            ...(city && { city }),
            ...(state && { state }),
            ...(zipCode && { zipCode }),
            ...(country && { country })
        };
    }

    const updatedUser = await user.save();

    return res.status(200).json(new ApiResponse(200, { updatedUser }, "User updated successfully"));
});

/**
 * @route   DELETE /api/v1/admin/delete-user/:userId
 * @desc    Delete user
 * @access  Private
 */
export const deleteUserByAdmin = asyncHandler(async (req: any, res: Response) => {
    const { userId } = req.params;

    // 1. Authorization Check
    if (req.user.role !== "admin") {
        throw new ApiError(403, "Forbidden: Only admins can perform this action");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // 2. Protect other Admins (except maybe self-deletion, but let's stick to current logic)
    if (user.role === "admin") {
        throw new ApiError(403, "Only Super Admins can modify Admin accounts");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 3. Handle Business & Products if user is a seller
        const business = await Business.findOne({ owner: userId }).session(session);

        if (business && !business.isDeleted) {
            const businessId = business._id;

            // Check for pending orders for this business
            const pendingOrders = await Order.findOne({
                "items.seller": businessId,
                orderStatus: { $in: ['processing', 'shipped'] }
            }).session(session);

            if (pendingOrders) {
                throw new ApiError(400, "Cannot delete user with active business orders. Please fulfill or cancel them first.");
            }

            // Soft delete business
            await Business.findByIdAndUpdate(businessId, { isDeleted: true }, { session });

            // Soft delete products
            await Product.updateMany(
                { seller: businessId },
                { $set: { isPublished: false, isDeleted: true } },
                { session }
            );

            // Deactivate SKUs
            await Sku.updateMany(
                { seller: businessId },
                { $set: { isActive: false } },
                { session }
            );
        }

        // 4. Cleanup associated data
        await Cart.findOneAndDelete({ user: userId }).session(session);

        // 5. Cleanup Cloudinary Assets (Cannot be part of DB transaction, but done before final user deletion)
        if (user.profilePicture) {
            const publicId = DeleteCloudinaryImage.extractPublicId(user.profilePicture);
            if (publicId) {
                try {
                    await DeleteCloudinaryImage.deleteImage(publicId);
                } catch (cloudinaryError) {
                    console.error("Cloudinary deletion failed:", cloudinaryError);
                    // We continue even if Cloudinary fails to avoid blocking user deletion
                }
            }
        }

        // 6. Delete the User
        const deletedUser = await User.findByIdAndDelete(userId).session(session);

        await session.commitTransaction();

        return res.status(200).json(new ApiResponse(200, { deletedUser }, "User and associated data deleted successfully"));
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});
import { Business } from "../models/business.model";
import User from "../models/user.model";
import { Response } from "express";
import { Product } from "../models/product.model";
import { Order } from "../models/order.model";
import { Review } from "../models/review.model";
import mongoose from "mongoose";

/**
 * @route   POST /api/v1/business/create
 * @desc    Create a new business
 * @access  Private(seller only)
 */
export const createBusiness = async (req: any, res: Response) => {
    try {
        const {
            businessName, legalEntityName, taxId,
            street, city, state, zipCode, country,
            accountHolderName, accountNumber, routingNumber, bankName
        } = req.body;

        // 1. Basic Validation
        if (!businessName || !legalEntityName || !taxId) {
            return res.status(400).json({ message: "Essential business details are missing." });
        }

        // 2. Check for Existing Business (One owner = One business rule)
        const existingBusiness = await Business.findOne({
            $or: [{ owner: req.user._id }, { taxId }]
        });

        if (existingBusiness) {
            const message = existingBusiness.taxId === taxId
                ? "Tax ID already registered."
                : "You already own a business account.";
            return res.status(400).json({ message });
        }

        // 3. Create Business with Structured Data
        const business = await Business.create({
            owner: req.user._id,
            businessName,
            legalEntityName,
            taxId,
            businessAddress: { street, city, state, zipCode, country },
            bankDetails: { accountHolderName, accountNumber, routingNumber, bankName },
        });

        // 4. Update User Role (Promote user to seller upon business creation)
        await User.findByIdAndUpdate(req.user._id, { role: 'seller' });

        return res.status(201).json({
            success: true,
            message: "Business created and undergoing review.",
            data: business
        });

    } catch (error: any) {
        console.error("Business Creation Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

/**
 * @route   POST /api/v1/business/update
 * @desc    Update business details
 * @access  Private(seller only)
 */
export const updateBusiness = async (req: any, res: Response) => {
    try {
        // 1. Find the business first
        const business = await Business.findOne({ owner: req.user._id });
        if (!business || business.isDeleted) {
            return res.status(404).json({ message: "Business not found." });
        }

        const {
            businessName, legalEntityName, taxId,
            street, city, state, zipCode, country,
            accountHolderName, accountNumber, routingNumber, bankName
        } = req.body;

        // 2. Tax ID Conflict Check (Only if taxId is provided and different)
        if (taxId && taxId !== business.taxId) {
            const conflict = await Business.findOne({ taxId });
            if (conflict) {
                return res.status(400).json({ message: "Tax ID already in use." });
            }
        }

        // 3. Build a Dynamic Update Object
        // This prevents overwriting existing data with 'undefined'
        const updateData: any = {};
        if (businessName) updateData.businessName = businessName;
        if (legalEntityName) updateData.legalEntityName = legalEntityName;
        if (taxId) updateData.taxId = taxId;

        // Handle nested Address (Merge with existing)
        if (street || city || state || zipCode || country) {
            updateData.businessAddress = {
                ...business.businessAddress, // Keep old values if not provided
                ...(street && { street }),
                ...(city && { city }),
                ...(state && { state }),
                ...(zipCode && { zipCode }),
                ...(country && { country }),
            };
        }

        // Handle nested Bank Details (Merge with existing)
        if (accountHolderName || accountNumber || routingNumber || bankName) {
            updateData.bankDetails = {
                ...business.bankDetails,
                ...(accountHolderName && { accountHolderName }),
                ...(accountNumber && { accountNumber }),
                ...(routingNumber && { routingNumber }),
                ...(bankName && { bankName }),
            };
        }

        // 4. Perform the Update
        const updatedBusiness = await Business.findByIdAndUpdate(
            business._id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Business updated successfully.",
            data: updatedBusiness
        });

    } catch (error: any) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/**
 * @route   GET /api/v1/business/get
 * @desc    Get business details
 * @access  Private(seller only)
 */
export const getBusiness = async (req: any, res: Response) => {
    try {
        const business = await Business.findOne({ owner: req.user._id })
            .populate("owner", "name email profilePicture")
            .lean();

        if (!business || business.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "No business account found for this user."
            });
        }

        return res.status(200).json({
            success: true,
            data: business
        });

    } catch (error: any) {
        console.error("Get Business Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

/**
 * @route   DELETE /api/v1/business/delete
 * @desc    Seller: Delete business account
 * @access  Private (Seller Only)
 */
export const deleteBusiness = async (req: any, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Find the business
        const business = await Business.findOne({ owner: req.user._id }).session(session);
        if (!business || business.isDeleted) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "No business account found for this user or already deleted."
            });
        }

        const businessId = business._id;

        // 2. Check for PENDING/ACTIVE orders 
        // We cannot delete a business if there are orders people paid for that aren't finished
        const pendingOrders = await Order.findOne({
            "items.seller": businessId,
            orderStatus: { $in: ['processing', 'shipped'] }
        }).session(session);

        if (pendingOrders) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Cannot delete business with active orders. Please fulfill or cancel them first."
            });
        }

        // 3. Perform Soft-Deletion & Cleanup
        // Update Business status
        await Business.findByIdAndUpdate(businessId, { isDeleted: true }, { session });

        // Unpublish/Soft-delete Products (Don't hard-delete so old orders still have references)
        await Product.updateMany(
            { seller: businessId },
            { $set: { isPublished: false, isDeleted: true } },
            { session }
        );

        // Demote User back to 'user' role
        await User.findByIdAndUpdate(req.user._id, { role: 'user' }, { session });

        // NOTE: We DO NOT delete Orders or Reviews. 
        // They remain in the DB for historical and legal purposes.

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Business deleted successfully. Products have been unpublished."
        });

    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        console.error("Delete Business Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

/**
 * @route   GET /api/v1/business/dashboard-stats
 * @desc    Seller: Comprehensive dashboard data (Revenue, Products, Inventory, Customers)
 * @access  Private (Seller Only)
 */
export const getBusinessDashboardStats = async (req: any, res: Response) => {
    try {
        const business = await Business.findOne({ owner: req.user._id }).select("_id");
        if (!business || business.isDeleted) {
            return res.status(404).json({ success: false, message: "Business not found." });
        }

        const businessId = new mongoose.Types.ObjectId(business._id.toString());

        // Run all complex calculations in parallel for maximum speed
        const [salesStats, topProducts, stockAlerts, topCustomers] = await Promise.all([

            // 1. REVENUE & ORDER STATUS BREAKDOWN
            Order.aggregate([
                { $unwind: "$items" },
                { $match: { "items.seller": businessId } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$items.price", 0] } },
                        orderCount: { $addToSet: "$_id" },
                        pendingOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "pending"] }, 1, 0] } },
                        deliveredOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] } }
                    }
                },
                { $project: { _id: 0, totalRevenue: 1, totalOrders: { $size: "$orderCount" }, pendingOrders: 1, deliveredOrders: 1 } }
            ]),

            // 2. TOP 5 BEST SELLING PRODUCTS
            Order.aggregate([
                { $unwind: "$items" },
                { $match: { "items.seller": businessId } },
                { $group: { _id: "$items.product", totalSold: { $sum: 1 }, revenue: { $sum: "$items.price" } } },
                { $sort: { totalSold: -1 } },
                { $limit: 5 },
                { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "details" } },
                { $unwind: "$details" },
                { $project: { name: "$details.name", image: { $arrayElemAt: ["$details.images", 0] }, totalSold: 1, revenue: 1 } }
            ]),

            // 3. INVENTORY STOCK ALERTS (Low stock < 10)
            Product.find({ seller: businessId, stock: { $lt: 10 } })
                .select("name stock price")
                .limit(5)
                .lean(),

            // 4. TOP CUSTOMERS (Loyalty)
            Order.aggregate([
                { $unwind: "$items" },
                { $match: { "items.seller": businessId, paymentStatus: 'paid' } },
                {
                    $group: {
                        _id: "$user",
                        totalSpent: { $sum: "$items.price" },
                        orderCount: { $addToSet: "$_id" },
                        lastPurchase: { $max: "$createdAt" }
                    }
                },
                { $sort: { totalSpent: -1 } },
                { $limit: 5 },
                { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
                { $unwind: "$user" },
                { $project: { name: "$user.name", email: "$user.email", totalSpent: 1, orderCount: { $size: "$orderCount" }, lastPurchase: 1 } }
            ])
        ]);

        return res.status(200).json({
            success: true,
            data: {
                summary: salesStats[0] || { totalRevenue: 0, totalOrders: 0, pendingOrders: 0, deliveredOrders: 0 },
                topProducts,
                stockAlerts,
                topCustomers
            }
        });

    } catch (error: any) {
        console.error("Dashboard Error:", error);
        return res.status(500).json({ success: false, message: "Failed to load dashboard data." });
    }
};

/**
 * @route   GET /api/v1/business/profile/:id?page=1&limit=12
 * @desc    Public: Get seller profile and their paginated products
 * @access  Public
 */
export const getPublicBusinessProfile = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12; // Standard e-commerce grid size
        const skip = (page - 1) * limit;

        // 1. Parallel Execution: Fetch Business and Products simultaneously for speed
        const [business, products, totalProducts] = await Promise.all([
            Business.findOne({ _id: id, status: 'active', isDeleted: false })
                .select("-bankDetails -taxId -analytics -updatedAt -__v")
                .populate("owner", "name profilePicture")
                .lean(),

            Product.find({ seller: id, isPublished: true })
                .select("name price images averageRating stock")
                .sort("-createdAt")
                .skip(skip)
                .limit(limit)
                .lean(),

            Product.countDocuments({ seller: id, isPublished: true })
        ]);

        // 2. Validation
        if (!business || business.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "Business not found or is currently inactive."
            });
        }

        // 3. Structured Response
        return res.status(200).json({
            success: true,
            data: {
                profile: business,
                products,
                pagination: {
                    totalProducts,
                    currentPage: page,
                    totalPages: Math.ceil(totalProducts / limit),
                    hasNextPage: skip + products.length < totalProducts
                }
            }
        });
    } catch (error: any) {
        console.error("Public Profile Error:", error);
        return res.status(500).json({ success: false, message: "Error loading store profile." });
    }
};

/**
 * @route   PATCH /api/v1/business/status/:id
 * @desc    Admin: Activate or Suspend a business account
 * @access  Private (Admin Only)
 */
export const toggleBusinessStatus = async (req: any, res: Response) => {
    try {
        const { status } = req.body; // 'active', 'suspended', 'under_review'
        const { id } = req.params;

        if (!['active', 'suspended', 'under_review'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status type." });
        }

        const business = await Business.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!business || business.isDeleted) {
            return res.status(404).json({ success: false, message: "Business not found." });
        }

        return res.status(200).json({
            success: true,
            message: `Business status updated to ${status}`,
            data: business
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};



//bhai aur do function hai bana lo fir business me softdeletion ke liye field bana lena
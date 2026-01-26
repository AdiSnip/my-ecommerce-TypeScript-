import { Business } from "../models/business.model";
import User from "../models/user.model";
import { Response, Request } from "express";
import { Product } from "../models/product.model";
import { Order } from "../models/order.model";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

/**
 * @route   POST /api/v1/business/create
 * @desc    Create a new business
 * @access  Private(seller only)
 */
export const createBusiness = asyncHandler(async (req: any, res: Response) => {
    const {
        businessName, legalEntityName, taxId,
        street, city, state, zipCode, country,
        accountHolderName, accountNumber, routingNumber, bankName
    } = req.body;

    if (!businessName || !legalEntityName || !taxId) {
        throw new ApiError(400, "Essential business details are missing.");
    }

    const existingBusiness = await Business.findOne({
        $or: [{ owner: req.user._id }, { taxId }]
    });

    if (existingBusiness) {
        const message = existingBusiness.taxId === taxId
            ? "Tax ID already registered."
            : "You already own a business account.";
        throw new ApiError(400, message);
    }

    const business = await Business.create({
        owner: req.user._id,
        businessName,
        legalEntityName,
        taxId,
        businessAddress: { street, city, state, zipCode, country },
        bankDetails: { accountHolderName, accountNumber, routingNumber, bankName },
    });

    await User.findByIdAndUpdate(req.user._id, { role: 'seller' });

    return res.status(201).json(new ApiResponse(201, business, "Business created and undergoing review."));
});

/**
 * @route   PATCH /api/v1/business/update
 * @desc    Update business details
 * @access  Private(seller only)
 */
export const updateBusiness = asyncHandler(async (req: any, res: Response) => {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business || business.isDeleted) {
        throw new ApiError(404, "Business not found.");
    }

    const {
        businessName, legalEntityName, taxId,
        street, city, state, zipCode, country,
        accountHolderName, accountNumber, routingNumber, bankName
    } = req.body;

    if (taxId && taxId !== business.taxId) {
        const conflict = await Business.findOne({ taxId });
        if (conflict) {
            throw new ApiError(400, "Tax ID already in use.");
        }
    }

    const updateData: any = {};
    if (businessName) updateData.businessName = businessName;
    if (legalEntityName) updateData.legalEntityName = legalEntityName;
    if (taxId) updateData.taxId = taxId;

    if (street || city || state || zipCode || country) {
        updateData.businessAddress = {
            ...business.businessAddress,
            ...(street && { street }),
            ...(city && { city }),
            ...(state && { state }),
            ...(zipCode && { zipCode }),
            ...(country && { country }),
        };
    }

    if (accountHolderName || accountNumber || routingNumber || bankName) {
        updateData.bankDetails = {
            ...business.bankDetails,
            ...(accountHolderName && { accountHolderName }),
            ...(accountNumber && { accountNumber }),
            ...(routingNumber && { routingNumber }),
            ...(bankName && { bankName }),
        };
    }

    const updatedBusiness = await Business.findByIdAndUpdate(
        business._id,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    return res.status(200).json(new ApiResponse(200, updatedBusiness, "Business updated successfully."));
});

/**
 * @route   GET /api/v1/business/get
 * @desc    Get business details
 * @access  Private(seller only)
 */
export const getBusiness = asyncHandler(async (req: any, res: Response) => {
    const business = await Business.findOne({ owner: req.user._id })
        .populate("owner", "name email profilePicture")
        .lean();

    if (!business || business.isDeleted) {
        throw new ApiError(404, "No business account found for this user.");
    }

    return res.status(200).json(new ApiResponse(200, business, "Business fetched successfully"));
});

/**
 * @route   DELETE /api/v1/business/delete
 * @desc    Seller: Delete business account
 * @access  Private (Seller Only)
 */
export const deleteBusiness = asyncHandler(async (req: any, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const business = await Business.findOne({ owner: req.user._id }).session(session);
        if (!business || business.isDeleted) {
            throw new ApiError(404, "No business account found for this user or already deleted.");
        }

        const businessId = business._id;

        const pendingOrders = await Order.findOne({
            "items.seller": businessId,
            orderStatus: { $in: ['processing', 'shipped'] }
        }).session(session);

        if (pendingOrders) {
            throw new ApiError(400, "Cannot delete business with active orders. Please fulfill or cancel them first.");
        }

        await Business.findByIdAndUpdate(businessId, { isDeleted: true }, { session });

        await Product.updateMany(
            { seller: businessId },
            { $set: { isPublished: false, isDeleted: true } },
            { session }
        );

        await User.findByIdAndUpdate(req.user._id, { role: 'user' }, { session });

        await session.commitTransaction();
        return res.status(200).json(new ApiResponse(200, {}, "Business deleted successfully. Products have been unpublished."));
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

/**
 * @route   GET /api/v1/business/dashboard-stats
 * @desc    Seller: Comprehensive dashboard data
 * @access  Private (Seller Only)
 */
export const getBusinessDashboardStats = asyncHandler(async (req: any, res: Response) => {
    const business = await Business.findOne({ owner: req.user._id }).select("_id");
    if (!business || business.isDeleted) {
        throw new ApiError(404, "Business not found.");
    }

    const businessId = new mongoose.Types.ObjectId(business._id.toString());

    const [salesStats, topProducts, stockAlerts, topCustomers] = await Promise.all([
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

        Product.find({ seller: businessId, stock: { $lt: 10 } })
            .select("name stock price")
            .limit(5)
            .lean(),

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

    return res.status(200).json(new ApiResponse(200, {
        summary: salesStats[0] || { totalRevenue: 0, totalOrders: 0, pendingOrders: 0, deliveredOrders: 0 },
        topProducts,
        stockAlerts,
        topCustomers
    }, "Dashboard stats fetched successfully"));
});

/**
 * @route   GET /api/v1/business/profile/:id
 * @desc    Public: Get seller profile and products
 * @access  Public
 */
export const getPublicBusinessProfile = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

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

    if (!business) {
        throw new ApiError(404, "Business not found or inactive.");
    }

    return res.status(200).json(new ApiResponse(200, {
        profile: business,
        products,
        pagination: {
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            hasNextPage: skip + products.length < totalProducts
        }
    }, "Business profile fetched successfully"));
});

/**
 * @route   PATCH /api/v1/admin/business/status/:id
 * @desc    Admin: Activate or Suspend a business account
 * @access  Private (Admin Only)
 */
export const toggleBusinessStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const { id } = req.params;

    if (!['active', 'suspended', 'under_review'].includes(status)) {
        throw new ApiError(400, "Invalid status type.");
    }

    const business = await Business.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    );

    if (!business || business.isDeleted) {
        throw new ApiError(404, "Business not found.");
    }

    return res.status(200).json(new ApiResponse(200, business, `Business status updated to ${status}`));
});
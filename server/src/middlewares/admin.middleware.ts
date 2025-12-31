import { Response, NextFunction } from "express";

/**
 * Middleware to restrict access to Admin users only.
 * Assumes 'isAuthenticated' has already been called and populated 'req.user'.
 */
export const verifyAdmin = (req: any, res: Response, next: NextFunction) => {
    // 1. Check if user object exists and has the 'admin' role
    if (req.user && req.user.role === 'admin') {
        return next();
    }

    // 2. Deny access if role is 'user', 'seller', or undefined
    return res.status(403).json({
        success: false,
        message: "Forbidden: Access restricted to administrators only."
    });
};
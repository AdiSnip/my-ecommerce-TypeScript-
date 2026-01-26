import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

export const verifyJWT = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
        const user = await User.findById(decodedToken?.id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            const refreshToken = req.cookies?.refreshToken;

            if (!refreshToken) {
                throw new ApiError(401, "Session expired. Please login again.");
            }

            try {
                const decodedRefreshToken: any = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string);

                const user = await User.findById(decodedRefreshToken?.id);

                if (!user) {
                    throw new ApiError(401, "Invalid Access Token");
                }

                if (user.refreshToken !== refreshToken) {
                    throw new ApiError(401, "Invalid usage of refresh token");
                }

                const newAccessToken = user.generateAccessToken();

                const cookieOptions = {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict" as const,
                    path: '/'
                };

                res.cookie("accessToken", newAccessToken, cookieOptions);

                req.user = user;
                
                next();
                return;

            } catch (refreshError) {
                throw new ApiError(401, "Session expired. Please login again.");
            }
        }

        throw new ApiError(401, "Invalid or Expired Token");
    }
});
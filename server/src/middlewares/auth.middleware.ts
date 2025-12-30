import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

export const verifyJWT = async (req: any, res: Response, next: NextFunction) => {
    try {
        // 1. Get token from cookies OR Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Unauthorized request" });
        }

        // 2. Decode the token
        const decodedToken: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);

        // 3. Find user and attach to request object
        const user = await User.findById(decodedToken?.id).select("-password -refreshToken");

        if (!user) {
            return res.status(401).json({ message: "Invalid Access Token" });
        }

        // 4. Attach the user to the request so the next function can use it
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or Expired Token" });
    }
};
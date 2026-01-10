import Router from "express";
import {
    registration,
    login,
    logout,
    sendEmailVerification,
    verifyOtp,
    resetPassword
} from "../controllers/auth.controller";
import { upload } from '../middlewares/multer.middleware';
import { verifyJWT } from '../middlewares/auth.middleware';
import { otpRequestLimiter, otpVerifyLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

router.post("/register", upload.single("profilePicture"), registration);
router.post("/login", login);
router.post("/send-otp", otpRequestLimiter, sendEmailVerification); //add in middleware after testing otpRequestLimiter
router.post("/verify-otp", otpVerifyLimiter, verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/logout", verifyJWT, logout);

export default router;

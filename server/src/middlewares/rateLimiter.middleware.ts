import rateLimit from 'express-rate-limit';

// 1. Limit for REQUESTING an OTP (Prevents email spam/cost)
export const otpRequestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 OTP requests per window
    message: {
        message: "Too many verification emails sent. Please try again after 15 minutes."
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// 2. Limit for VERIFYING an OTP (Prevents brute-force guessing)
export const otpVerifyLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 failed attempts per hour
    message: {
        message: "Too many incorrect attempts. Please try again in an hour."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
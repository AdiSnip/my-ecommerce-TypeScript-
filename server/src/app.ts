import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

//routes imports
import AuthRoute from "./routes/auth.route"; 
import businessRoute from "./routes/business.route";
import userRoute from "./routes/user.route";

const app = express();

// 1. Improved CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// 2. Parsers with limits
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // Useful for Multer temp files
app.use(cookieParser());

// 3. Health Check Route (Good for Load Balancers/Docker)
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// 4. Routes
app.use("/api/v1/auth", AuthRoute); 
app.use("/api/v1/user", userRoute); 
app.use("/api/v1/business", businessRoute); 

// 5. Root Route
app.get("/", (req: Request, res: Response) => {
    res.send("API is running...");
});

export default app;
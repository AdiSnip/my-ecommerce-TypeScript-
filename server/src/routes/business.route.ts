import Router from "express";
import { createBusiness, getBusiness, updateBusiness, toggleBusinessStatus, getPublicBusinessProfile, getBusinessDashboardStats } from "../controllers/business.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import { verifyAdmin } from "../middlewares/admin.middleware";


const router = Router();

router.post("/create", verifyJWT, createBusiness);
router.patch("/update", verifyJWT, updateBusiness);
router.get("/get", verifyJWT, getBusiness);
router.patch("/status/:id", verifyJWT, verifyAdmin, toggleBusinessStatus);
router.get("/profile/:id", getPublicBusinessProfile);
router.get("/analytics", verifyJWT, getBusinessDashboardStats);
export default router;

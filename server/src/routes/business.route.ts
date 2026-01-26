import Router from "express";
import { createBusiness, getBusiness, updateBusiness, toggleBusinessStatus, getPublicBusinessProfile, getBusinessDashboardStats } from "../controllers/business.controller";
import { verifyJWT } from "../middlewares/auth.middleware";


const router = Router();

router.use(verifyJWT);

router.post("/create", createBusiness);
router.patch("/update", updateBusiness);
router.get("/get", getBusiness);
router.get("/profile/:id", getPublicBusinessProfile);
router.get("/analytics", getBusinessDashboardStats);
export default router;

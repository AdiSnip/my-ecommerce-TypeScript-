import { Router } from "express";
import { getUsersByAdmin, updateUserByAdmin, deleteUserByAdmin } from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import { verifyAdmin } from "../middlewares/admin.middleware";
import { toggleBusinessStatus } from "../controllers/business.controller";

const router = Router();

// Apply verifyJWT to all admin routes
router.use(verifyJWT, verifyAdmin);

//for users
router.get("/users", getUsersByAdmin);
router.patch("/update-user/:userId", updateUserByAdmin);
router.delete("/delete-user/:userId", deleteUserByAdmin);

//for businesses
router.patch("/business/status/:id", toggleBusinessStatus);

export default router;

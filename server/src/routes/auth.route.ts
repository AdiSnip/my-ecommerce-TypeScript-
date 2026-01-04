import Router from "express";
import { registration , login , logout, sendEmailVerification } from "../controllers/auth.controller";
import { upload } from '../middlewares/multer.middleware';
import { verifyJWT } from '../middlewares/auth.middleware';

let router = Router();

router.post("/register", upload.single("profilePicture"), registration);
router.post("/login", login);
router.post("/sendEmailVerification", sendEmailVerification);
router.get("/logout", verifyJWT, logout);

export default router;

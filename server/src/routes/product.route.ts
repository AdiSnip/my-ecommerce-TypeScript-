import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createProduct } from "../controllers/product.controller";

const router = Router();

router.post('/create',verifyJWT,createProduct);

export default router;
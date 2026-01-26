import { Router } from 'express';
import {
    fetchUser,
    updateProfile,
    addInteraction,
    changePassword,
    getRecommendedCategories
} from '../controllers/user.controller';
import { upload } from '../middlewares/multer.middleware';
import { verifyJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/me', verifyJWT, fetchUser);
router.patch('/update', verifyJWT, upload.single('profilePicture'), updateProfile);
router.patch('/addInteraction/:categoryId', verifyJWT, addInteraction);
router.patch('/change-password', verifyJWT, changePassword);
router.get('/recommended-categories', verifyJWT, getRecommendedCategories);

export default router;

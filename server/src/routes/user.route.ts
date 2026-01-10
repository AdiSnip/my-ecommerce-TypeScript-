import { Router } from 'express';
import {
    fetchUser,
    updateProfile,
    addInteraction,
} from '../controllers/user.controller';
import { upload } from '../middlewares/multer.middleware';
import { verifyJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/me', verifyJWT, fetchUser);
router.patch('/update', verifyJWT, upload.single('profilePicture'), updateProfile);
router.patch('/interaction', verifyJWT, addInteraction);

export default router;

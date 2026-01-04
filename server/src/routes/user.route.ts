import { Router } from 'express';
import {
    fetchUser,
    updateProfile,
} from '../controllers/user.controller';
import { upload } from '../middlewares/multer.middleware';
import { verifyJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/fetchUser', verifyJWT, fetchUser);
router.patch('/updateProfile', verifyJWT, upload.single('profilePicture'), updateProfile);

export default router

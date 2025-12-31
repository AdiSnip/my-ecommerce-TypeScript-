import { Router } from 'express';
import { 
    login, 
    registration, 
    fetchUser, 
    updateProfile, 
    sendEmailVerification,
    logout 
} from '../controllers/user.controller';
import { upload } from '../middlewares/multer.middleware';
import { verifyJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', upload.single('profilePicture'), registration);
router.post('/login', login);
router.get('/fetchUser', verifyJWT, fetchUser);
router.patch('/updateProfile', verifyJWT, upload.single('profilePicture'), updateProfile);
router.post('/sendEmailVerification', sendEmailVerification);
router.get('/logout', verifyJWT, logout);

export default router

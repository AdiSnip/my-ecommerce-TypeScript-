import Router from 'express';
import { registration } from '../controllers/userAuth';
import { upload } from '../middlewares/multer.middleware';

const router = Router();

router.post('/register', upload.single('profilePicture'), registration);

export default router

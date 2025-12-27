import Router from 'express';
import { registration } from '../controllers/userAuth';

const router = Router();

router.route('/register').post(registration);

export default router

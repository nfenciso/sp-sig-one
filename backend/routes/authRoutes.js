import { Router } from 'express';
import { verifyAccount } from '../controllers/authController.js';

const router = Router();

router.post('/verify-account', verifyAccount);

export default router;
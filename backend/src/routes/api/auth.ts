import express from 'express';
import * as authController from '../../controllers/auth';

const router = express.Router();

// User login
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);
router.post('/signup', authController.postSignup);

export default router;

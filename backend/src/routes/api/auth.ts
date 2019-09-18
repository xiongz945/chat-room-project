import express from 'express';
import * as authController from '../../controllers/auth';
import { usernameRule, passwordRule } from '../../controllers/auth';

const router = express.Router();

// Account auth
router.post('/login', [usernameRule, passwordRule], authController.postLogin);
router.get('/logout', authController.logout);

export default router;

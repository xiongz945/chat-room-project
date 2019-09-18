import express from 'express';
import * as userController from '../../controllers/user';
import * as passportConfig from '../../config/passport';
import { usernameRule, passwordRule } from '../../controllers/user';

const router = express.Router();

// User login
router.post('/login', [usernameRule, passwordRule], userController.postLogin);
router.get('/logout', userController.logout);
router.post('/forgot', userController.postForgot);
router.post('/reset/:token', userController.postReset);

// Get account editing info
router.get(
  '/profile',
  passportConfig.isAuthenticated,
  userController.getProfile
);
router.post(
  '/profile',
  passportConfig.isAuthenticated,
  userController.postUpdateProfile
);
router.post(
  '/password',
  passportConfig.isAuthenticated,
  userController.postUpdatePassword
);
router.post(
  '/delete',
  passportConfig.isAuthenticated,
  userController.deleteAccount
);

export default router;

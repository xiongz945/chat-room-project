import express from 'express';
import * as userController from '../../controllers/user';
import * as passportConfig from '../../config/passport';

const router = express.Router();

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

import express from 'express';
import * as userController from '../../controllers/user';
import * as passportConfig from '../../config/passport';

const router = express.Router();

// Get account editing info
router.get(
  '/profile',
  passportConfig.isAuthenticated,
  userController.getProfile
);
router.patch(
  '/profile',
  passportConfig.isAuthenticated,
  userController.patchUpdateProfile
);
router.patch(
  '/password',
  passportConfig.isAuthenticated,
  userController.patchUpdatePassword
);
router.delete(
  '/delete',
  passportConfig.isAuthenticated,
  userController.deleteAccount
);

export default router;

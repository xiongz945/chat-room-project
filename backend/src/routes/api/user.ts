import express from 'express';
import * as userController from '../../controllers/user';
import * as passportConfig from '../../config/passport';

const router = express.Router();

// Get account editing info
router.get(
  '/me/profile',
  passportConfig.isAuthenticated,
  userController.getProfile
);

router.patch(
  '/me/status',
  passportConfig.isAuthenticated,
  userController.patchUpdateStatus
);

router.patch(
  '/me/isOnline',
  passportConfig.isAuthenticated,
  userController.patchUpdateIsOnline
);

router.patch(
  '/me/profile',
  passportConfig.isAuthenticated,
  userController.patchUpdateProfile
);

router.patch(
  '/me/password',
  passportConfig.isAuthenticated,
  userController.patchUpdatePassword
);

router.delete(
  '/me/delete',
  passportConfig.isAuthenticated,
  userController.deleteAccount
);

export default router;

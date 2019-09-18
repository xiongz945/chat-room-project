import express from 'express';
import * as userController from '../../controllers/user';
import * as passportConfig from '../../config/passport';

const router = express.Router();

// User login
router.post('/login', userController.postLogin);
router.get('/logout', userController.logout);
router.post('/forgot', userController.postForgot);
router.post('/reset/:token', userController.postReset);
router.post('/signup', userController.postSignup);

// Get / edit info
router.post(
  '/account/profile',
  passportConfig.isAuthenticated,
  userController.postUpdateProfile
);
router.post(
  '/account/password',
  passportConfig.isAuthenticated,
  userController.postUpdatePassword
);
router.post(
  '/account/delete',
  passportConfig.isAuthenticated,
  userController.postDeleteAccount
);
router.get(
  '/account/unlink/:provider',
  passportConfig.isAuthenticated,
  userController.getOauthUnlink
);

router.patch(
  '/loginTag',
  passportConfig.isAuthenticated,
  userController.patchChangeLoginTag
)

export default router;

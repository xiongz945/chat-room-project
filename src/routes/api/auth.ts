import express from 'express';
import * as authController from '../../controllers/auth';
import { usernameRule, passwordRule } from '../../controllers/auth';
import * as passportConfig from '../../config/passport';
import passport from 'passport';

const router = express.Router();

// Account auth
router.post('/login', [usernameRule, passwordRule], authController.postLogin);
router.get(
  '/logout',
  passport.authenticate('jwt', { session: false }),
  passportConfig.isAuthenticated,
  authController.getLogout
);

export default router;

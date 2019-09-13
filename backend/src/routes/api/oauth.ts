import express from 'express';
import passport from 'passport';

import * as passportConfig from '../../config/passport';
import * as apiController from '../../controllers/api';

const router = express.Router();

/**
 * API examples routes.
 */
router.get('/api', apiController.getApi);
router.get(
  '/api/facebook',
  passportConfig.isAuthenticated,
  passportConfig.isAuthorized,
  apiController.getFacebook
);

/**
 * OAuth authentication routes. (Sign in)
 */
router.get(
  '/auth/facebook',
  passport.authenticate('facebook', { scope: ['email', 'public_profile'] })
);
router.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(req.session.returnTo || '/');
  }
);

export default router;

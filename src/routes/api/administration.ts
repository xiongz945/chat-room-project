import express from 'express';
import * as administrationController from '../../controllers/administration';
import * as passportConfig from '../../config/passport';

const router = express.Router();

router.get(
  '/user',
  passportConfig.isAuthenticated,
  administrationController.getUserProfile
);

router.patch(
  '/user',
  passportConfig.isAuthenticated,
  administrationController.updateUserProfile
);

export default router;

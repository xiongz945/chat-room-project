import express from 'express';
import * as statusCheckController from '../../controllers/status_check';
import * as passportConfig from '../../config/passport';

const router = express.Router();

// Status Check
router.get(
  '/',
  passportConfig.isAuthenticated,
  statusCheckController.getStatusCheck
);

router.post(
  '/',
  passportConfig.isAuthenticated,
  statusCheckController.postStatusCheck
);

router.patch(
  '/',
  passportConfig.isAuthenticated,
  statusCheckController.patchStatusCheck
);

export default router;

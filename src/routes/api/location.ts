import express from 'express';
import * as passportConfig from '../../config/passport';
import * as statusmapController from '../../controllers/statusmap';

const router = express.Router();

// Status
router.patch(
  '/:id/status',
  passportConfig.isAuthenticated,
  passportConfig.isLegalAnnouncement,
  statusmapController.updateStatus
);

// Location
router.get(
  '/:id',
  passportConfig.isAuthenticated,
  statusmapController.getLocation
);

router.get(
  '',
  passportConfig.isAuthenticated,
  statusmapController.getAllLocation
);

router.post(
  '/:name',
  passportConfig.isAuthenticated,
  statusmapController.postNewLocation
);

export default router;

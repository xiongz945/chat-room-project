import express from 'express';
import * as passportConfig from '../../config/passport';
import * as statusmapController from '../../controllers/statusmap';

const router = express.Router();

// Location
router.get(
  '/:name',
  passportConfig.isAuthenticated,
  statusmapController.getLocation
);

router.get(
  '/all',
  passportConfig.isAuthenticated,
  statusmapController.getAllLocation
);

router.post(
  '/:name',
  passportConfig.isAuthenticated,
  statusmapController.postNewLocation
);

// Comment
router.get(
  '/:name/comment',
  passportConfig.isAuthenticated,
  statusmapController.getComment
);

router.post(
  '/:name/comment',
  passportConfig.isAuthenticated,
  statusmapController.postNewComment
);

export default router;

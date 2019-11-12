import express from 'express';
import * as passportConfig from '../../config/passport';
import * as earthquakeController from '../../controllers/earthquake';

const router = express.Router();

router.post(
  '/report',
  passportConfig.isAuthenticated,
  earthquakeController.postEarthquakeReport
);

router.get(
  '/report',
  passportConfig.isAuthenticated,
  earthquakeController.getEarthquakeReport
);

router.patch(
  '/report',
  passportConfig.isAuthenticated,
  earthquakeController.patchEarthquakeReport
);

router.post(
  '/prediction',
  passportConfig.isAuthenticated,
  earthquakeController.postEarthquakePrediction
);

export default router;

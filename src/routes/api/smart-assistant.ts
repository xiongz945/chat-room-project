import express from 'express';
import * as smartAssistantController from '../../controllers/smart-assistant';
import * as passportConfig from '../../config/passport';

const router = express.Router();

// Request and response messages
router.post(
  '',
  //passportConfig.isAuthenticated,
  smartAssistantController.postRequest
);
router.get(
  '',
  //passportConfig.isAuthenticated,
  smartAssistantController.getResponse
);
router.get(
  '/hospital-info',
  //passportConfig.isAuthenticated,
  smartAssistantController.getHospitalInfo
);

export default router;

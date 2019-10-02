import express from 'express';
import * as messageController from '../../controllers/messages';
import * as passportConfig from '../../config/passport';

const router = express.Router();

// User login
router.get(
  '/public/history',
  passportConfig.isAuthenticated,
  messageController.getHistoryMessage
);
router.post(
  '/public',
  passportConfig.isAuthenticated,
  messageController.postMessage
);
router.get(
  '/public',
  passportConfig.isAuthenticated,
  messageController.getMessage
);

export default router;

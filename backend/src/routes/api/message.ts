import express from 'express';
import * as messageController from '../../controllers/messages';
import * as passportConfig from '../../config/passport';

const router = express.Router();

// User login
router.get(
  '/:receiverId/history',
  passportConfig.isAuthenticated,
  messageController.getHistoryMessage
);
router.post(
  '/:receiverId',
  passportConfig.isAuthenticated,
  messageController.postMessage
);
router.get(
  '/:receiverId',
  passportConfig.isAuthenticated,
  messageController.getMessage
);

export default router;

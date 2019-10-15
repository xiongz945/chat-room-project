import express from 'express';
import * as messageController from '../../controllers/messages';
import * as passportConfig from '../../config/passport';

const router = express.Router();

// User login
router.get(
  '/:receiverName/history',
  passportConfig.isAuthenticated,
  messageController.getHistoryMessage
);
router.post(
  '/:receiverName',
  passportConfig.isAuthenticated,
  messageController.postMessage
);
router.get(
  '/:receiverName',
  passportConfig.isAuthenticated,
  messageController.getMessage
);

export default router;

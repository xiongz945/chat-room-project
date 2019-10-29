import express from 'express';
import * as messageController from '../../controllers/messages';
import * as passportConfig from '../../config/passport';

const router = express.Router();

// Announcments
router.get(
  '/announcements',
  passportConfig.isAuthenticated,
  messageController.getAnnouncment
);
router.post(
  '/announcements',
  passportConfig.isAuthenticated,
  messageController.postAnnouncment
);

// Message history
router.get(
  '/:receiverName/history',
  passportConfig.isAuthenticated,
  messageController.getHistoryMessage
);

// Post/Recive message
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

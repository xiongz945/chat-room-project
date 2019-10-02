import express from 'express';
import * as chatroomController from '../../controllers/chatroom';
import * as passportConfig from '../../config/passport';

const router = express.Router();

// Get account editing info
router.get(
  '/public/users',
  passportConfig.isAuthenticated,
  chatroomController.getPublicUsers
);

export default router;

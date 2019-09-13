import express from 'express';
import * as messageController from '../../controllers/messages';

const router = express.Router();

// User login
router.get('/historyMessage', messageController.getHistoryMessage);

export default router;

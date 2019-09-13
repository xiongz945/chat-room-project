import express from 'express';

import user from './api/user';
import message from './api/message';

const router = express.Router();

router.use('/users', user);
router.use('/messages', message);

export default router;

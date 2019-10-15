import express from 'express';
import passport from 'passport';

import auth from './api/auth';
import user from './api/user';
import message from './api/message';
import chatroom from './api/chatroom';

const router = express.Router();

router.use('/auth', auth);
router.use('/user', passport.authenticate('jwt', { session: false }), user);
router.use(
  '/messages',
  passport.authenticate('jwt', { session: false }),
  message
);
router.use('/chat', passport.authenticate('jwt', { session: false }), chatroom);

export default router;

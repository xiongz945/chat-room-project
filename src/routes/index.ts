import express from 'express';
import passport from 'passport';

import auth from './api/auth';
import user from './api/user';
import message from './api/message';
import chatroom from './api/chatroom';
import search from './api/search';
import earthquake from './api/earthquake';
import statusCheck from './api/status_check';

const router = express.Router();

router.use('/auth', auth);
router.use('/user', passport.authenticate('jwt', { session: false }), user);
router.use(
  '/messages',
  passport.authenticate('jwt', { session: false }),
  message
);
router.use('/chat', passport.authenticate('jwt', { session: false }), chatroom);
router.use('/search', passport.authenticate('jwt', { session: false }), search);
router.use(
  '/earthquake',
  passport.authenticate('jwt', { session: false }),
  earthquake
);
router.use(
  '/statusCheck',
  passport.authenticate('jwt', { session: false }),
  statusCheck
);
export default router;

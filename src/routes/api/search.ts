import express from 'express';
import * as searchController from '../../controllers/search';
import * as passportConfig from '../../config/passport';

const router = express.Router();

router.get(
  '/users/username',
  passportConfig.isAuthenticated,
  searchController.getSearchUsersByUsername
);
router.get(
  '/users/status',
  passportConfig.isAuthenticated,
  searchController.getSearchUsersByStatus
);
router.get(
  '/announcements',
  passportConfig.isAuthenticated,
  searchController.getSearchAnnouncements
);
router.get(
  '/messages/public',
  passportConfig.isAuthenticated,
  searchController.getSearchPublicMessages
);
router.get(
  '/messages/private',
  passportConfig.isAuthenticated,
  searchController.getSearchPrivateMessages
);

export default router;

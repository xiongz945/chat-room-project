import express from 'express';
import * as fakeAdmin from '../../controllers/fake-administration';
import * as passportConfig from '../../config/passport';

const router = express.Router();

// TODO: passportConfig.isAuthenticated
router.patch('/user', fakeAdmin.patchUserProfile);

export default router;

import { Router } from 'express';

import { authUser } from '../auth/middleware.js';
import * as handler from './handler.js';

const router = Router();

router.patch('/me', authUser, handler.updateProfile);
router.put('/me/password', authUser, handler.changePassword);

export default router;

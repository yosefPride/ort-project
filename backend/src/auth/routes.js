import { Router } from 'express';

import * as handler from './handler.js';

const router = Router();

router.post('/auth/register', handler.register);
router.post('/auth/login', handler.login);
router.post('/auth/logout', handler.logout);
router.get('/auth/me', handler.me);

export default router;

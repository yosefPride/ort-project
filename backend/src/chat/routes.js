import { Router } from 'express';

import { member } from '../team/middleware.js';
import * as handler from './handler.js';

const router = Router();
const chat = '/teams/:team_id/issues/:issue_id/chat';

router.get(chat, member, handler.history);
router.post(chat, member, handler.send);
router.delete(chat, member, handler.clear);

export default router;

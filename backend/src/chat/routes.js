import { Router } from 'express';

import { member } from '../team/middleware.js';
import * as handler from './handler.js';

const router = Router();
const chats = '/teams/:team_id/issues/:issue_id/chats';

router.get(chats, member, handler.list);
router.post(chats, member, handler.create);
router.get(`${chats}/:chat_id`, member, handler.messages);
router.post(`${chats}/:chat_id`, member, handler.send);
router.delete(`${chats}/:chat_id`, member, handler.remove);

export default router;

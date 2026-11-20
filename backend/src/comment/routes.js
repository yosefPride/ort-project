import { Router } from 'express';

import { member } from '../team/middleware.js';
import * as handler from './handler.js';

const router = Router();
const comments = '/teams/:team_id/issues/:issue_id/comments';

router.get(comments, member, handler.list);
router.post(comments, member, handler.create);
router.delete(`${comments}/:comment_id`, member, handler.remove);
router.put(`${comments}/:comment_id/reaction`, member, handler.react);
router.delete(`${comments}/:comment_id/reaction`, member, handler.unreact);

export default router;

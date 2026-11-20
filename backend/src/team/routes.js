import { Router } from 'express';

import { authUser } from '../auth/middleware.js';
import * as handler from './handler.js';
import { member } from './middleware.js';

const router = Router();

router.get('/teams', authUser, handler.list);
router.post('/teams', authUser, handler.create);
router.patch('/teams/:team_id', member, handler.rename);
router.delete('/teams/:team_id', member, handler.remove);
router.get('/teams/:team_id/members', member, handler.members);
router.post('/teams/:team_id/members', member, handler.addMember);
router.get('/teams/:team_id/users/lookup', member, handler.lookup);
router.patch('/teams/:team_id/members/:user_id', member, handler.changeRole);
router.delete('/teams/:team_id/members/:user_id', member, handler.removeMember);

export default router;

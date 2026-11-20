import { Router } from 'express';

import { member } from '../team/middleware.js';
import * as handler from './handler.js';

const router = Router();

router.get('/teams/:team_id/issues', member, handler.list);
router.post('/teams/:team_id/issues', member, handler.create);
router.get('/teams/:team_id/issues/:issue_id', member, handler.get);
router.put('/teams/:team_id/issues/:issue_id', member, handler.update);
router.delete('/teams/:team_id/issues/:issue_id', member, handler.remove);

export default router;

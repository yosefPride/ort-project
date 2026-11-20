import { Router } from 'express';

import * as handler from './handler.js';
import { admin } from './middleware.js';

const router = Router();

router.get('/admin/users', admin, handler.users);
router.patch('/admin/users/:user_id', admin, handler.setAdmin);
router.delete('/admin/users/:user_id', admin, handler.deleteUser);
router.get('/admin/teams', admin, handler.teams);
router.delete('/admin/teams/:team_id', admin, handler.deleteTeam);
router.get('/admin/audit-logs', admin, handler.auditLogs);

export default router;

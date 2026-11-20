import { requireUser } from '../auth/middleware.js';
import { forbidden } from '../error.js';

/**
 * Put `admin` before a handler and only system admins can call it (the admin
 * is `req.user`). System admins manage users and teams, but get no access to
 * issues inside teams they aren't a member of.
 */
export async function admin(req, res, next) {
  const user = await requireUser(req);
  if (user.is_admin !== true) throw forbidden();
  req.user = user;
  next();
}

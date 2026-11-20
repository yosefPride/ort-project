import { requireUser } from '../auth/middleware.js';
import { Scoped, TEAMS } from '../db/index.js';
import { forbidden, notFound } from '../error.js';
import { roleOf } from './model.js';

/** A signed-in user together with the team (from the URL) they belong to. */
class Member {
  #db;

  constructor(user, team, role, db) {
    this.user = user;
    this.team = team;
    this.role = role;
    this.#db = db;
  }

  requireAdmin() {
    this.requireAdminOr([]);
  }

  /** Team admins may do it, and so may the listed users (e.g. an issue's creator). */
  requireAdminOr(userIds) {
    if (this.role === 'admin' || userIds.includes(this.user._id)) return;
    throw forbidden();
  }

  /** Issues, comments or chats of this team only (see `Scoped`). */
  scoped(collectionName) {
    return new Scoped(this.#db, collectionName, this.team._id);
  }
}

/**
 * Put `member` before a handler under /teams/:team_id/... and it only runs
 * for members of that team (as `req.member`). Non-members get 404, so they
 * can't even learn that the team exists. This is the one place team access is
 * checked.
 */
export async function member(req, res, next) {
  const user = await requireUser(req);
  const { db } = req.app.locals;
  const filter = { _id: req.params.team_id, 'members.user_id': user._id };
  const team = await db.collection(TEAMS).findOne(filter);
  if (!team) throw notFound();
  const role = roleOf(team, user._id);
  req.member = new Member(user, team, role, db);
  next();
}

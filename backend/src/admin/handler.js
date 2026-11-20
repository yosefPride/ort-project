import { AUDIT_LOGS, CHAT_MESSAGES, ISSUES, SESSIONS, TEAMS, USERS, findAll } from '../db/index.js';
import { badRequest, notFound } from '../error.js';
import { deleteTeam as deleteTeamData, teamView } from '../team/model.js';
import { publicUser } from '../user/model.js';
import { audit } from './audit.js';

export async function users(req, res) {
  const users = await findAll(req.app.locals.db.collection(USERS), {}, { name: 1 });
  res.json(users.map(publicUser));
}

export async function setAdmin(req, res) {
  const { user_id: userId } = req.params;
  const isAdmin = req.body?.is_admin;
  if (typeof isAdmin !== 'boolean') throw badRequest('is_admin must be true or false');
  // Stops the last admin from locking everyone out of the panel.
  if (userId === req.user._id) {
    throw badRequest("You can't change your own admin status");
  }
  await req.app.locals.db.collection(USERS).updateOne({ _id: userId }, { $set: { is_admin: isAdmin } });
  res.status(204).end();
}

/**
 * Deletes an account. Their comments stay (shown as "Former member"); their
 * sessions, private AI chats, team memberships and assignments are removed.
 */
export async function deleteUser(req, res) {
  const { user_id: userId } = req.params;
  if (userId === req.user._id) {
    throw badRequest("You can't delete your own account here");
  }
  const { db } = req.app.locals;
  const user = await db.collection(USERS).findOne({ _id: userId });
  if (!user) throw notFound();
  await db.collection(USERS).deleteOne({ _id: user._id });
  await db.collection(SESSIONS).deleteMany({ user_id: user._id });
  await db.collection(CHAT_MESSAGES).deleteMany({ user_id: user._id });
  const pull = { $pull: { members: { user_id: user._id } } };
  await db.collection(TEAMS).updateMany({ 'members.user_id': user._id }, pull);
  const unassign = { $set: { assignee_id: null } };
  await db.collection(ISSUES).updateMany({ assignee_id: user._id }, unassign);
  await audit(db, req.user, 'user.delete', `${user.name} (${user.email})`);
  res.status(204).end();
}

export async function teams(req, res) {
  const teams = await findAll(req.app.locals.db.collection(TEAMS), {}, { name: 1 });
  res.json(teams.map(teamView));
}

export async function deleteTeam(req, res) {
  const { db } = req.app.locals;
  const team = await db.collection(TEAMS).findOne({ _id: req.params.team_id });
  if (!team) throw notFound();
  await deleteTeamData(db, team, req.user);
  res.status(204).end();
}

/** The 500 most recent user and team deletions. */
export async function auditLogs(req, res) {
  const logs = req.app.locals.db.collection(AUDIT_LOGS).find({}).sort({ created_at: -1 }).limit(500);
  res.json(await logs.toArray());
}

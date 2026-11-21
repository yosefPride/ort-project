import { AUDIT_LOGS, CHATS, CHAT_MESSAGES, ISSUES, SESSIONS, TEAMS, USERS, findAll } from '../db/index.js';
import { badRequest, notFound } from '../error.js';
import { deleteTeam as deleteTeamData, isLastAdmin, removeTeamMember, roleOf, setRole, teamView } from '../team/model.js';
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
  const { db } = req.app.locals;
  const user = await db.collection(USERS).findOne({ _id: userId });
  if (!user) throw notFound();
  await db.collection(USERS).updateOne({ _id: user._id }, { $set: { is_admin: isAdmin } });
  res.status(204).end();
}

/**
 * The member who becomes admin of `team` in place of the deleted user, or
 * null if the team doesn't need one (it has another admin, or the user is its
 * only member and the team is deleted with them).
 */
function replacementFor(team, userId, replacements) {
  if (team.members.length === 1 || !isLastAdmin(team, userId)) return null;
  const replacementId = replacements?.[team._id];
  if (typeof replacementId !== 'string' || replacementId === userId || !roleOf(team, replacementId)) {
    throw badRequest(`Choose a new admin for "${team.name}"`);
  }
  return replacementId;
}

/**
 * Deletes an account. Their comments stay (shown as "Former member"); their
 * sessions, private AI chats, team memberships and assignments are removed.
 *
 * Teams where they are the only member are deleted with them. Teams where they
 * are the only admin need a replacement, sent as `replacements`:
 * { team_id: user_id }.
 */
export async function deleteUser(req, res) {
  const { user_id: userId } = req.params;
  if (userId === req.user._id) {
    throw badRequest("You can't delete your own account here");
  }
  const { db } = req.app.locals;
  const user = await db.collection(USERS).findOne({ _id: userId });
  if (!user) throw notFound();
  const teams = await findAll(db.collection(TEAMS), { 'members.user_id': user._id }, { name: 1 });
  // Every replacement is checked before anything changes, so a missing one
  // leaves the user and all their teams as they were.
  const changes = teams.map((team) => ({ team, replacementId: replacementFor(team, user._id, req.body?.replacements) }));

  // Teams are handled before the account is deleted, so if this stops partway
  // the user still exists and the delete can simply be tried again.
  for (const { team, replacementId } of changes) {
    if (team.members.length === 1) {
      await deleteTeamData(db, team, req.user);
      continue;
    }
    if (replacementId) {
      await setRole(db, team, replacementId, 'admin');
      const replacement = await db.collection(USERS).findOne({ _id: replacementId });
      await audit(db, req.user, 'team.admin_replace', `${replacement.name} replaced ${user.name} as admin of "${team.name}"`);
    }
    await removeTeamMember(db, team, user._id);
  }
  await db.collection(USERS).deleteOne({ _id: user._id });
  await db.collection(SESSIONS).deleteMany({ user_id: user._id });
  await db.collection(CHATS).deleteMany({ user_id: user._id });
  await db.collection(CHAT_MESSAGES).deleteMany({ user_id: user._id });
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

/** The 500 most recent audit entries (user and team deletions, replaced team admins). */
export async function auditLogs(req, res) {
  const logs = req.app.locals.db.collection(AUDIT_LOGS).find({}).sort({ created_at: -1 }).limit(500);
  res.json(await logs.toArray());
}

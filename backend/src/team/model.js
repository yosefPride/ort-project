import { audit } from '../admin/audit.js';
import { CHAT_MESSAGES, COMMENTS, ISSUES, TEAMS } from '../db/index.js';
import { badRequest, conflict, notFound } from '../error.js';

// A `teams` document:
//   _id, name, created_at
//   members         [{ user_id, role }]. Members live inside the team document, so
//                   one lookup answers both "does this team exist?" and "is this
//                   user in it, and with what role?".
//   issue_counter   Number of the last issue created, used to give issues #1, #2, ...

export const ROLES = ['admin', 'contributor'];

/** The user's role in the team, or `undefined` if they aren't a member. */
export function roleOf(team, userId) {
  return team.members.find((m) => m.user_id === userId)?.role;
}

/** Whether the user is the team's only admin. */
export function isLastAdmin(team, userId) {
  const admins = team.members.filter((m) => m.role === 'admin').length;
  return roleOf(team, userId) === 'admin' && admins === 1;
}

/** A team must always keep at least one admin. */
export function checkKeepsAdmin(team, userId) {
  if (isLastAdmin(team, userId)) {
    throw badRequest('A team needs an admin. Make someone else admin first');
  }
}

// Members are changed one at a time with $push, $pull and $set on a single
// member, never by writing the whole list back, so two changes made at the
// same moment can't undo each other. The "keeps an admin" rule is part of the
// update's filter, so it is checked against the team as it is when it changes.

/** Matches the team only while someone other than `userId` is an admin. */
const otherAdmin = (userId) => ({ members: { $elemMatch: { user_id: { $ne: userId }, role: 'admin' } } });

/** Called when a member update matched nothing: throws the reason. */
async function unchanged(db, teamId, userId) {
  const team = await db.collection(TEAMS).findOne({ _id: teamId });
  if (!team || !roleOf(team, userId)) throw notFound();
  checkKeepsAdmin(team, userId);
  throw conflict('The team just changed, try again');
}

export async function addTeamMember(db, teamId, userId, role) {
  const filter = { _id: teamId, 'members.user_id': { $ne: userId } };
  const result = await db.collection(TEAMS).updateOne(filter, { $push: { members: { user_id: userId, role } } });
  if (result.matchedCount === 0) throw conflict('Already a member of this team');
}

export async function setRole(db, teamId, userId, role) {
  const filter = { _id: teamId, 'members.user_id': userId, ...(role === 'admin' ? {} : otherAdmin(userId)) };
  // `$[m]` names the member to change; plain `$` could point at the other admin.
  const update = { $set: { 'members.$[m].role': role } };
  const result = await db.collection(TEAMS).updateOne(filter, update, { arrayFilters: [{ 'm.user_id': userId }] });
  if (result.matchedCount === 0) await unchanged(db, teamId, userId);
}

export async function removeTeamMember(db, teamId, userId) {
  const filter = { _id: teamId, 'members.user_id': userId, ...otherAdmin(userId) };
  const result = await db.collection(TEAMS).updateOne(filter, { $pull: { members: { user_id: userId } } });
  if (result.matchedCount === 0) await unchanged(db, teamId, userId);
}

/**
 * Deletes the team with all its issues, comments and chats. Used by team
 * admins and by the system admin panel.
 */
export async function deleteTeam(db, team, actor) {
  for (const name of [ISSUES, COMMENTS, CHAT_MESSAGES]) {
    await db.collection(name).deleteMany({ team_id: team._id });
  }
  await db.collection(TEAMS).deleteOne({ _id: team._id });
  await audit(db, actor, 'team.delete', `Team "${team.name}"`);
}

/** A whole team as the API sends it. */
export function teamView(team) {
  return {
    _id: team._id,
    name: team.name,
    members: team.members,
    issue_counter: team.issue_counter ?? 0,
    created_at: team.created_at,
  };
}

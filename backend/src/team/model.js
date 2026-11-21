import { audit } from '../admin/audit.js';
import { CHATS, CHAT_MESSAGES, COMMENTS, ISSUES, TEAMS } from '../db/index.js';
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

// Each of these changes the loaded `team` and saves its member list.

async function saveMembers(db, team) {
  await db.collection(TEAMS).updateOne({ _id: team._id }, { $set: { members: team.members } });
}

export async function addTeamMember(db, team, userId, role) {
  if (roleOf(team, userId)) throw conflict('Already a member of this team');
  team.members.push({ user_id: userId, role });
  await saveMembers(db, team);
}

export async function setRole(db, team, userId, role) {
  const membership = team.members.find((m) => m.user_id === userId);
  if (!membership) throw notFound();
  if (role !== 'admin') checkKeepsAdmin(team, userId);
  membership.role = role;
  await saveMembers(db, team);
}

export async function removeTeamMember(db, team, userId) {
  if (!roleOf(team, userId)) throw notFound();
  checkKeepsAdmin(team, userId);
  team.members = team.members.filter((m) => m.user_id !== userId);
  await saveMembers(db, team);
}

/**
 * Deletes the team with all its issues, comments and chats. Used by team
 * admins and by the system admin panel.
 */
export async function deleteTeam(db, team, actor) {
  // The team goes first: if this stops partway, nobody can reach what's left.
  await db.collection(TEAMS).deleteOne({ _id: team._id });
  for (const name of [ISSUES, COMMENTS, CHATS, CHAT_MESSAGES]) {
    await db.collection(name).deleteMany({ team_id: team._id });
  }
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

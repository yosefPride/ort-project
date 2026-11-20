import { audit } from '../admin/audit.js';
import { CHAT_MESSAGES, COMMENTS, ISSUES, TEAMS } from '../db/index.js';
import { badRequest } from '../error.js';

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

/** A team must always keep at least one admin. */
export function checkKeepsAdmin(team, userId) {
  const admins = team.members.filter((m) => m.role === 'admin').length;
  if (roleOf(team, userId) === 'admin' && admins === 1) {
    throw badRequest('A team needs an admin. Make someone else admin first');
  }
}

/** Saves a changed name or member list (the issue counter is only ever changed by `$inc`). */
export async function saveTeam(db, team) {
  const changes = { name: team.name, members: team.members };
  await db.collection(TEAMS).updateOne({ _id: team._id }, { $set: changes });
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

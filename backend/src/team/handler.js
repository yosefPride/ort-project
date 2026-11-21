import { ISSUES, Scoped, TEAMS, USERS, findAll, newId, now } from '../db/index.js';
import { badRequest, conflict, notFound } from '../error.js';
import { publicUser } from '../user/model.js';
import { check, checkEmail, oneOf } from '../validation.js';
import { ROLES, checkKeepsAdmin, deleteTeam, roleOf, saveTeam, teamView } from './model.js';

/**
 * The user's teams. The issue counts feed the dashboard tiles, so the
 * dashboard needs no endpoint of its own.
 */
export async function list(req, res) {
  const { user } = req;
  const { db } = req.app.locals;
  const teams = await findAll(db.collection(TEAMS), { 'members.user_id': user._id }, { name: 1 });
  const summaries = [];
  for (const team of teams) {
    const issues = new Scoped(db, ISSUES, team._id);
    // The three counts run at the same time instead of one after another.
    const [openIssues, urgentIssues, myIssues] = await Promise.all([
      issues.count({ status: 'open' }),
      issues.count({ status: 'open', priority: { $in: ['high', 'critical'] } }),
      issues.count({ status: 'open', assignee_id: user._id }),
    ]);
    summaries.push({
      _id: team._id,
      name: team.name,
      role: roleOf(team, user._id) ?? 'contributor',
      member_count: team.members.length,
      open_issues: openIssues,
      urgent_issues: urgentIssues,
      my_issues: myIssues,
    });
  }
  res.json(summaries);
}

export async function create(req, res) {
  const team = {
    _id: newId(),
    name: check('Team name', req.body?.name, 60),
    members: [{ user_id: req.user._id, role: 'admin' }],
    issue_counter: 0,
    created_at: now(),
  };
  await req.app.locals.db.collection(TEAMS).insertOne(team);
  res.json(teamView(team));
}

export async function rename(req, res) {
  const { member } = req;
  member.requireAdmin();
  member.team.name = check('Team name', req.body?.name, 60);
  await saveTeam(req.app.locals.db, member.team);
  res.status(204).end();
}

export async function remove(req, res) {
  const { member } = req;
  member.requireAdmin();
  await deleteTeam(req.app.locals.db, member.team, member.user);
  res.status(204).end();
}

export async function members(req, res) {
  const { member } = req;
  const ids = member.team.members.map((m) => m.user_id);
  const users = await findAll(req.app.locals.db.collection(USERS), { _id: { $in: ids } }, { name: 1 });
  const views = users.map((user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: roleOf(member.team, user._id) ?? 'contributor',
  }));
  res.json(views);
}

async function findByEmail(db, email) {
  const user = await db.collection(USERS).findOne({ email: checkEmail(email) });
  if (!user) throw badRequest('No account uses that email');
  return user;
}

/** Finds an account by exact email, so an admin can check who they're adding. */
export async function lookup(req, res) {
  const { member } = req;
  member.requireAdmin();
  res.json(publicUser(await findByEmail(req.app.locals.db, req.query.email)));
}

export async function addMember(req, res) {
  const { member } = req;
  member.requireAdmin();
  const role = oneOf('Role', req.body?.role, ROLES);
  const user = await findByEmail(req.app.locals.db, req.body?.email);
  const { team } = member;
  if (roleOf(team, user._id)) {
    throw conflict('Already a member of this team');
  }
  team.members.push({ user_id: user._id, role });
  await saveTeam(req.app.locals.db, team);
  res.status(204).end();
}

export async function changeRole(req, res) {
  const { member } = req;
  member.requireAdmin();
  const { user_id: userId } = req.params;
  const role = oneOf('Role', req.body?.role, ROLES);
  const { team } = member;
  if (role !== 'admin') {
    checkKeepsAdmin(team, userId);
  }
  const membership = team.members.find((m) => m.user_id === userId);
  if (!membership) throw notFound();
  membership.role = role;
  await saveTeam(req.app.locals.db, team);
  res.status(204).end();
}

/** Removes a member. Admins can remove anyone; everyone can remove themselves (leave). */
export async function removeMember(req, res) {
  const { member } = req;
  const { user_id: userId } = req.params;
  if (userId !== member.user._id) {
    member.requireAdmin();
  }
  const { team } = member;
  if (!roleOf(team, userId)) throw notFound();
  checkKeepsAdmin(team, userId);
  team.members = team.members.filter((m) => m.user_id !== userId);
  await saveTeam(req.app.locals.db, team);
  // Their open work in this team goes back to unassigned. Closed issues keep
  // them as assignee (shown as "Former member"), and editing one means
  // choosing a new assignee, since the assignee must be a team member.
  await member.scoped(ISSUES).update({ assignee_id: userId, status: 'open' }, { $set: { assignee_id: null } });
  res.status(204).end();
}

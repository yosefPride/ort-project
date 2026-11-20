import { CHAT_MESSAGES, COMMENTS, ISSUES, TEAMS, newId, now } from '../db/index.js';
import { notFound } from '../error.js';
import { validateIssueInput } from './model.js';

/**
 * All of the team's issues, oldest first. Filtering and search happen in the
 * frontend, which keeps this endpoint trivial.
 */
export async function list(req, res) {
  res.json(await req.member.scoped(ISSUES).find({}, { created_at: 1 }));
}

export async function get(req, res) {
  res.json(await req.member.scoped(ISSUES).get(req.params.issue_id));
}

export async function create(req, res) {
  const { member } = req;
  const input = validateIssueInput(req.body, member.team);
  // $inc hands out the next number atomically, so two issues created at the
  // same moment can't both become #7.
  const team = await req.app.locals.db
    .collection(TEAMS)
    .findOneAndUpdate({ _id: member.team._id }, { $inc: { issue_counter: 1 } }, { returnDocument: 'after' });
  if (!team) throw notFound();
  const time = now();
  const issue = {
    _id: newId(),
    team_id: team._id,
    number: team.issue_counter,
    title: input.title,
    description: input.description,
    priority: input.priority,
    status: 'open',
    creator_id: member.user._id,
    assignee_id: input.assignee_id,
    created_at: time,
    updated_at: time,
  };
  await member.scoped(ISSUES).insert(issue);
  res.json(issue);
}

/** Team admins, the creator and the assignee can edit an issue. */
export async function update(req, res) {
  const { member } = req;
  const issues = member.scoped(ISSUES);
  const issue = await issues.get(req.params.issue_id);
  member.requireAdminOr([issue.creator_id, issue.assignee_id]);

  const input = validateIssueInput(req.body, member.team);
  issue.title = input.title;
  issue.description = input.description;
  issue.priority = input.priority;
  issue.status = input.status ?? issue.status;
  issue.assignee_id = input.assignee_id;
  issue.updated_at = now();
  await issues.replace(issue._id, issue);
  res.json(issue);
}

/** Team admins and the creator can delete an issue, which also deletes its comments and chats. */
export async function remove(req, res) {
  const { member } = req;
  const issue = await member.scoped(ISSUES).get(req.params.issue_id);
  member.requireAdminOr([issue.creator_id]);

  await member.scoped(ISSUES).delete({ _id: issue._id });
  await member.scoped(COMMENTS).delete({ issue_id: issue._id });
  await member.scoped(CHAT_MESSAGES).delete({ issue_id: issue._id });
  res.status(204).end();
}

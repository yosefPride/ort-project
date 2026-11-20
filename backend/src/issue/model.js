import { badRequest } from '../error.js';
import { roleOf } from '../team/model.js';
import { check, oneOf } from '../validation.js';

// An `issues` document:
//   _id, team_id, title, description, created_at, updated_at
//   number        Per-team number shown as #1, #2, ...
//   priority      "low" | "high" | "critical"
//   status        "open" | "closed"
//   creator_id    The user who created it
//   assignee_id   A team member, or null

export const PRIORITIES = ['low', 'high', 'critical'];
export const STATUSES = ['open', 'closed'];

/**
 * Checks the body of both "create issue" (status is ignored: new issues are
 * open) and "edit issue" (the whole issue is sent back with its changes).
 */
export function validateIssueInput(input, team) {
  input ??= {};
  const title = check('Title', input.title, 200);
  const description = check('Description', input.description, 10_000);
  const priority = oneOf('Priority', input.priority, PRIORITIES);
  const status = input.status == null ? null : oneOf('Status', input.status, STATUSES);
  const assigneeId = input.assignee_id ?? null;
  if (assigneeId !== null && (typeof assigneeId !== 'string' || !roleOf(team, assigneeId))) {
    throw badRequest('The assignee must be a team member');
  }
  return { title, description, priority, status, assignee_id: assigneeId };
}

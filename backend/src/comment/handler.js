import { COMMENTS, ISSUES, newId, now } from '../db/index.js';
import { conflict } from '../error.js';
import { check } from '../validation.js';

// A `comments` document:
//   _id, team_id, issue_id, author_id, body, created_at
//   reactions   [{ user_id, emoji }]. Reactions are stored inside their comment,
//               so a comment always arrives with its reactions and no extra
//               lookups are needed.

export async function list(req, res) {
  const comments = req.member.scoped(COMMENTS);
  res.json(await comments.find({ issue_id: req.params.issue_id }, { created_at: 1 }));
}

export async function create(req, res) {
  const { member } = req;
  const issue = await member.scoped(ISSUES).get(req.params.issue_id);
  if (issue.status === 'closed') {
    throw conflict('This issue is closed');
  }
  const comment = {
    _id: newId(),
    team_id: issue.team_id,
    issue_id: issue._id,
    author_id: member.user._id,
    body: check('Comment', req.body?.body, 2_000),
    reactions: [],
    created_at: now(),
  };
  await member.scoped(COMMENTS).insert(comment);
  res.json(comment);
}

/** The author or a team admin can delete a comment. */
export async function remove(req, res) {
  const { member } = req;
  const comments = member.scoped(COMMENTS);
  const comment = await comments.get(req.params.comment_id);
  member.requireAdminOr([comment.author_id]);
  await comments.delete({ _id: comment._id });
  res.status(204).end();
}

/**
 * Sets the user's reaction. Each user has at most one reaction per comment,
 * so a new emoji replaces their old one.
 *
 * Only the user's own reaction is changed, never the whole list, so other
 * people reacting at the same moment aren't undone.
 */
export async function react(req, res) {
  const { member } = req;
  const emoji = check('Emoji', req.body?.emoji, 8);
  const { _id: userId } = member.user;
  const { comment_id: id } = req.params;
  const comments = member.scoped(COMMENTS);
  const changed = await comments.updateOne({ _id: id, 'reactions.user_id': userId }, { $set: { 'reactions.$.emoji': emoji } });
  if (changed.matchedCount === 0) {
    // They have no reaction yet. The filter stops two requests at once from both adding one.
    const filter = { _id: id, 'reactions.user_id': { $ne: userId } };
    await comments.updateOne(filter, { $push: { reactions: { user_id: userId, emoji } } });
  }
  res.json(await comments.get(id)); // also the 404 for a comment that doesn't exist
}

export async function unreact(req, res) {
  const { member } = req;
  const { comment_id: id } = req.params;
  const comments = member.scoped(COMMENTS);
  await comments.updateOne({ _id: id }, { $pull: { reactions: { user_id: member.user._id } } });
  res.json(await comments.get(id));
}

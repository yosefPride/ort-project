import { CHAT_MESSAGES, ISSUES, newId, now } from '../db/index.js';
import { check } from '../validation.js';
import { askGemini } from './gemini.js';

// A `chat_messages` document is one message of a user's private chat with the
// AI about one issue:
//   _id, team_id, issue_id, user_id, text, created_at
//   role   "user" or "model", the same names Gemini uses.

/** How many earlier messages the AI sees. Keeps requests small and cheap. */
const HISTORY_LIMIT = 20;

/** The signed-in user's own chat about this issue (other members can't see it). */
export async function history(req, res) {
  const { member } = req;
  const filter = { issue_id: req.params.issue_id, user_id: member.user._id };
  res.json(await member.scoped(CHAT_MESSAGES).find(filter, { created_at: 1 }));
}

/** Starts over: deletes the user's conversation about this issue. */
export async function clear(req, res) {
  const { member } = req;
  const issue = await member.scoped(ISSUES).get(req.params.issue_id);
  await member.scoped(CHAT_MESSAGES).delete({ issue_id: issue._id, user_id: member.user._id });
  res.status(204).end();
}

/** Sends a message and returns [the user's message, the AI's reply]. */
export async function send(req, res) {
  const { member } = req;
  const text = check('Message', req.body?.message, 2_000);
  const issue = await member.scoped(ISSUES).get(req.params.issue_id);
  const chat = member.scoped(CHAT_MESSAGES);
  const history = await chat.find({ issue_id: issue._id, user_id: member.user._id }, { created_at: 1 });
  const recent = history.slice(-HISTORY_LIMIT);
  const reply = await askGemini(req.app.locals.geminiKey, issue, recent, text);

  // Both messages are saved only once the AI has answered, so a failed
  // request leaves no half-finished exchange behind.
  const message = (role, text) => ({
    _id: newId(),
    team_id: issue.team_id,
    issue_id: issue._id,
    user_id: member.user._id,
    role,
    text,
    created_at: now(),
  });
  const messages = [message('user', text), message('model', reply)];
  for (const message of messages) {
    await chat.insert(message);
  }
  res.json(messages);
}

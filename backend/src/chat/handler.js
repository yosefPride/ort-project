import { CHATS, CHAT_MESSAGES, ISSUES, newId, now } from '../db/index.js';
import { notFound } from '../error.js';
import { check } from '../validation.js';
import { askGemini } from './gemini.js';

// A `chats` document is one of a user's private conversations with the AI
// about one issue. A user can have several chats per issue:
//   _id, team_id, issue_id, user_id, created_at
//   title   The start of the chat's first message.
//
// A `chat_messages` document is one message in a chat:
//   _id, team_id, issue_id, chat_id, user_id, text, created_at
//   role   "user" or "model", the same names Gemini uses.

/** How many earlier messages the AI sees. Keeps requests small and cheap. */
const HISTORY_LIMIT = 20;

const TITLE_LENGTH = 60;

/** The chat from the URL. Other members get 404, so nobody can read someone else's chat. */
async function ownChat(req) {
  const { member } = req;
  const chat = await member.scoped(CHATS).get(req.params.chat_id);
  if (chat.user_id !== member.user._id || chat.issue_id !== req.params.issue_id) throw notFound();
  return chat;
}

/**
 * Asks the AI and saves the user's message and its reply in the chat.
 * Both are saved only once the AI has answered, so a failed request leaves
 * no half-finished exchange behind.
 */
async function exchange(req, issue, chat, text) {
  const messages = req.member.scoped(CHAT_MESSAGES);
  const history = await messages.find({ chat_id: chat._id }, { created_at: 1 });
  const reply = await askGemini(req.app.locals.geminiKey, issue, history.slice(-HISTORY_LIMIT), text);
  const message = (role, text) => ({
    _id: newId(),
    team_id: chat.team_id,
    issue_id: chat.issue_id,
    chat_id: chat._id,
    user_id: chat.user_id,
    role,
    text,
    created_at: now(),
  });
  const exchanged = [message('user', text), message('model', reply)];
  for (const item of exchanged) {
    await messages.insert(item);
  }
  return exchanged;
}

/** The signed-in user's chats about this issue, newest first. */
export async function list(req, res) {
  const { member } = req;
  const filter = { issue_id: req.params.issue_id, user_id: member.user._id };
  res.json(await member.scoped(CHATS).find(filter, { created_at: -1 }));
}

/** Starts a new chat with its first message and returns the chat. */
export async function create(req, res) {
  const { member } = req;
  const text = check('Message', req.body?.message, 2_000);
  const issue = await member.scoped(ISSUES).get(req.params.issue_id);
  const chat = {
    _id: newId(),
    team_id: issue.team_id,
    issue_id: issue._id,
    user_id: member.user._id,
    title: text.length > TITLE_LENGTH ? `${text.slice(0, TITLE_LENGTH)}…` : text,
    created_at: now(),
  };
  await exchange(req, issue, chat, text);
  // Saved after the AI answered, so a failed first message leaves no empty chat.
  await member.scoped(CHATS).insert(chat);
  res.json(chat);
}

/** One chat's messages, oldest first. */
export async function messages(req, res) {
  const chat = await ownChat(req);
  res.json(await req.member.scoped(CHAT_MESSAGES).find({ chat_id: chat._id }, { created_at: 1 }));
}

/** Sends a message in a chat and returns [the user's message, the AI's reply]. */
export async function send(req, res) {
  const text = check('Message', req.body?.message, 2_000);
  const chat = await ownChat(req);
  const issue = await req.member.scoped(ISSUES).get(chat.issue_id);
  res.json(await exchange(req, issue, chat, text));
}

/** Deletes a chat and its messages. */
export async function remove(req, res) {
  const { member } = req;
  const chat = await ownChat(req);
  await member.scoped(CHAT_MESSAGES).delete({ chat_id: chat._id });
  await member.scoped(CHATS).delete({ _id: chat._id });
  res.status(204).end();
}

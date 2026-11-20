import { aiUnavailable } from '../error.js';
import { log } from '../logging.js';

// Pinned on purpose: "-latest" aliases silently change quota and behaviour.
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent';

const capitalize = (word) => word[0].toUpperCase() + word.slice(1);

function instructions(issue) {
  return (
    'You help a software team with one bug-tracker issue. Only discuss this issue and ' +
    'software debugging; politely decline anything unrelated. Be concise and use Markdown.\n\n' +
    `Issue #${issue.number}: ${issue.title}\n` +
    `Priority: ${capitalize(issue.priority)}\n` +
    `Status: ${capitalize(issue.status)}\n` +
    `Description:\n${issue.description}`
  );
}

/**
 * Sends the conversation to Gemini and returns its reply. The AI only reads:
 * it gets this one issue's text and never touches the database.
 */
export async function askGemini(geminiKey, issue, history, message) {
  if (!geminiKey) throw aiUnavailable();
  const contents = history.map((m) => ({ role: m.role, parts: [{ text: m.text }] }));
  contents.push({ role: 'user', parts: [{ text: message }] });
  const body = {
    systemInstruction: { parts: [{ text: instructions(issue) }] },
    contents,
  };

  let response;
  try {
    response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiKey },
      body: JSON.stringify(body),
    });
  } catch (error) {
    log.error(`Gemini request failed: ${error}`);
    throw aiUnavailable();
  }
  if (!response.ok) {
    log.error(`Gemini answered ${response.status}: ${await response.text().catch(() => '')}`);
    throw aiUnavailable();
  }
  const reply = await response.json().catch(() => null);
  const text = reply?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string') throw aiUnavailable();
  return text;
}

/** Runs at startup. Creating an index that already exists does nothing. */
export async function createIndexes(db) {
  const unique = { unique: true };
  // MongoDB deletes a session by itself once its `expires_at` has passed.
  const expire = { expireAfterSeconds: 0 };
  const indexes = [
    ['users', { email: 1 }, unique],
    ['sessions', { expires_at: 1 }, expire],
    ['teams', { 'members.user_id': 1 }, {}],
    ['issues', { team_id: 1, number: 1 }, unique],
    ['comments', { team_id: 1, issue_id: 1 }, {}],
    ['chat_messages', { team_id: 1, issue_id: 1, user_id: 1 }, {}],
  ];
  for (const [name, keys, options] of indexes) {
    await db.collection(name).createIndex(keys, options);
  }
}

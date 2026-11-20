import { AUDIT_LOGS, newId, now } from '../db/index.js';

/**
 * Call this after an admin deletes a user or a team. Nothing else is logged.
 *
 * The actor's name and email are copied into the `audit_logs` document, so
 * the entry still reads well after that user is deleted too.
 */
export async function audit(db, actor, action, detail) {
  await db.collection(AUDIT_LOGS).insertOne({
    _id: newId(),
    actor_id: actor._id,
    actor_name: actor.name,
    actor_email: actor.email,
    action, // what happened, like "team.delete"
    detail, // human-readable description of what was deleted
    created_at: now(),
  });
}

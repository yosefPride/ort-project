use mongodb::Database;

use super::model::AuditLog;
use crate::db::{collection, new_id, now};
use crate::error::Result;
use crate::user::model::User;

/// Call this after an admin deletes a user or a team. Nothing else is logged.
pub async fn audit(db: &Database, actor: &User, action: &str, detail: String) -> Result<()> {
    let log = AuditLog {
        id: new_id(),
        actor_id: actor.id.clone(),
        actor_name: actor.name.clone(),
        actor_email: actor.email.clone(),
        action: action.to_string(),
        detail,
        created_at: now(),
    };
    collection::<AuditLog>(db).insert_one(&log).await?;
    Ok(())
}

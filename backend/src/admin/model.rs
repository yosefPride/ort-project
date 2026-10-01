use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::db::Model;

/// A record of something being deleted, shown in the admin panel. The actor's
/// name and email are copied in, so the entry still reads well after that
/// user is deleted too.
#[derive(Serialize, Deserialize)]
pub struct AuditLog {
    #[serde(rename = "_id")]
    pub id: String,
    pub actor_id: String,
    pub actor_name: String,
    pub actor_email: String,
    /// What happened, like "issue.delete".
    pub action: String,
    /// Human-readable description of what was deleted.
    pub detail: String,
    pub created_at: DateTime<Utc>,
}

impl Model for AuditLog {
    const COLLECTION: &'static str = "audit_logs";
}

#[derive(Deserialize)]
pub struct AdminInput {
    pub is_admin: bool,
}

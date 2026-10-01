use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::db::Model;

#[derive(Serialize, Deserialize, Clone)]
pub struct Reaction {
    pub user_id: String,
    pub emoji: String,
}

/// Reactions are stored inside their comment, so a comment always arrives
/// with its reactions and no extra lookups are needed.
#[derive(Serialize, Deserialize)]
pub struct Comment {
    #[serde(rename = "_id")]
    pub id: String,
    pub team_id: String,
    pub issue_id: String,
    pub author_id: String,
    pub body: String,
    pub reactions: Vec<Reaction>,
    pub created_at: DateTime<Utc>,
}

impl Model for Comment {
    const COLLECTION: &'static str = "comments";
}

#[derive(Deserialize)]
pub struct CommentInput {
    pub body: String,
}

#[derive(Deserialize)]
pub struct ReactionInput {
    pub emoji: String,
}

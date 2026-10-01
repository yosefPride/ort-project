use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::db::Model;

/// One message of a user's private chat with the AI about one issue.
/// `role` is "user" or "model", the same names Gemini uses.
#[derive(Serialize, Deserialize)]
pub struct ChatMessage {
    #[serde(rename = "_id")]
    pub id: String,
    pub team_id: String,
    pub issue_id: String,
    pub user_id: String,
    pub role: String,
    pub text: String,
    pub created_at: DateTime<Utc>,
}

impl Model for ChatMessage {
    const COLLECTION: &'static str = "chat_messages";
}

#[derive(Deserialize)]
pub struct ChatInput {
    pub message: String,
}

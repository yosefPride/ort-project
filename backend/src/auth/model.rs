use mongodb::bson::DateTime;
use serde::{Deserialize, Serialize};

use crate::db::Model;

/// A signed-in browser. The cookie holds a random token; the database only
/// keeps its SHA-256 hash, so a leaked database can't be used to sign in.
#[derive(Serialize, Deserialize)]
pub struct Session {
    #[serde(rename = "_id")]
    pub token_hash: String,
    pub user_id: String,
    pub expires_at: DateTime,
}

impl Model for Session {
    const COLLECTION: &'static str = "sessions";
}

#[derive(Deserialize)]
pub struct RegisterInput {
    pub name: String,
    pub email: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct LoginInput {
    pub email: String,
    pub password: String,
}

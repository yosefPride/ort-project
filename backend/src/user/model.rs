use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::db::Model;

#[derive(Serialize, Deserialize, Clone)]
pub struct User {
    #[serde(rename = "_id")]
    pub id: String,
    pub name: String,
    pub email: String,
    pub password_hash: String,
    /// System admin. Only settable from the admin panel (or by hand in the database).
    #[serde(default)]
    pub is_admin: bool,
    pub created_at: DateTime<Utc>,
}

impl Model for User {
    const COLLECTION: &'static str = "users";
}

/// What the API shows about a user: everything except the password hash.
#[derive(Serialize)]
pub struct PublicUser {
    #[serde(rename = "_id")]
    pub id: String,
    pub name: String,
    pub email: String,
    pub is_admin: bool,
    pub created_at: DateTime<Utc>,
}

impl From<&User> for PublicUser {
    fn from(user: &User) -> Self {
        PublicUser {
            id: user.id.clone(),
            name: user.name.clone(),
            email: user.email.clone(),
            is_admin: user.is_admin,
            created_at: user.created_at,
        }
    }
}

#[derive(Deserialize)]
pub struct ProfileInput {
    pub name: String,
    pub email: String,
    #[serde(default)]
    pub current_password: String,
}

#[derive(Deserialize)]
pub struct PasswordInput {
    pub current_password: String,
    pub new_password: String,
}

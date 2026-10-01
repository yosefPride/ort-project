use chrono::{DateTime, Utc};
use mongodb::Database;
use mongodb::bson::{Document, doc};
use serde::{Deserialize, Serialize};

use crate::admin::audit::audit;
use crate::chat::model::ChatMessage;
use crate::comment::model::Comment;
use crate::db::{Model, collection};
use crate::error::{AppError, Result};
use crate::issue::model::Issue;
use crate::user::model::User;

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Role {
    Admin,
    Contributor,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Membership {
    pub user_id: String,
    pub role: Role,
}

/// Members live inside the team document, so one lookup answers both
/// "does this team exist?" and "is this user in it, and with what role?".
#[derive(Serialize, Deserialize, Clone)]
pub struct Team {
    #[serde(rename = "_id")]
    pub id: String,
    pub name: String,
    pub members: Vec<Membership>,
    /// Number of the last issue created, used to give issues #1, #2, ...
    #[serde(default)]
    pub issue_counter: i64,
    pub created_at: DateTime<Utc>,
}

impl Model for Team {
    const COLLECTION: &'static str = "teams";
}

impl Team {
    pub fn role_of(&self, user_id: &str) -> Option<Role> {
        self.members.iter().find(|m| m.user_id == user_id).map(|m| m.role)
    }

    /// A team must always keep at least one admin.
    pub fn check_keeps_admin(&self, user_id: &str) -> Result<()> {
        let admins = self.members.iter().filter(|m| m.role == Role::Admin).count();
        if self.role_of(user_id) == Some(Role::Admin) && admins == 1 {
            return Err(AppError::BadRequest("A team needs an admin. Make someone else admin first".into()));
        }
        Ok(())
    }

    pub async fn save(&self, db: &Database) -> Result<()> {
        collection::<Team>(db).replace_one(doc! { "_id": &self.id }, self).await?;
        Ok(())
    }

    /// Deletes the team with all its issues, comments and chats. Used by team
    /// admins and by the system admin panel.
    pub async fn delete(&self, db: &Database, actor: &User) -> Result<()> {
        for name in [Issue::COLLECTION, Comment::COLLECTION, ChatMessage::COLLECTION] {
            db.collection::<Document>(name).delete_many(doc! { "team_id": &self.id }).await?;
        }
        collection::<Team>(db).delete_one(doc! { "_id": &self.id }).await?;
        audit(db, actor, "team.delete", format!("Team \"{}\"", self.name)).await
    }
}

/// One entry of GET /teams. The issue counts feed the dashboard tiles, so the
/// dashboard needs no endpoint of its own.
#[derive(Serialize)]
pub struct TeamSummary {
    #[serde(rename = "_id")]
    pub id: String,
    pub name: String,
    pub role: Role,
    pub member_count: usize,
    pub open_issues: u64,
    pub urgent_issues: u64,
    pub my_issues: u64,
}

#[derive(Serialize)]
pub struct MemberView {
    #[serde(rename = "_id")]
    pub id: String,
    pub name: String,
    pub email: String,
    pub role: Role,
}

#[derive(Deserialize)]
pub struct NameInput {
    pub name: String,
}

#[derive(Deserialize)]
pub struct EmailQuery {
    pub email: String,
}

#[derive(Deserialize)]
pub struct AddMemberInput {
    pub email: String,
    pub role: Role,
}

#[derive(Deserialize)]
pub struct RoleInput {
    pub role: Role,
}

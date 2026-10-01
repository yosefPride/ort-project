use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::db::Model;
use crate::error::{AppError, Result};
use crate::team::model::Team;
use crate::validation::check;

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Debug)]
#[serde(rename_all = "lowercase")]
pub enum Priority {
    Low,
    High,
    Critical,
}

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Debug)]
#[serde(rename_all = "lowercase")]
pub enum Status {
    Open,
    Closed,
}

#[derive(Serialize, Deserialize)]
pub struct Issue {
    #[serde(rename = "_id")]
    pub id: String,
    pub team_id: String,
    /// Per-team number shown as #1, #2, ...
    pub number: i64,
    pub title: String,
    pub description: String,
    pub priority: Priority,
    pub status: Status,
    pub creator_id: String,
    pub assignee_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Model for Issue {
    const COLLECTION: &'static str = "issues";
}

/// Body of both "create issue" (status is ignored: new issues are open) and
/// "edit issue" (the whole issue is sent back with its changes).
#[derive(Deserialize)]
pub struct IssueInput {
    pub title: String,
    pub description: String,
    pub priority: Priority,
    pub status: Option<Status>,
    pub assignee_id: Option<String>,
}

impl IssueInput {
    pub fn validate(mut self, team: &Team) -> Result<Self> {
        self.title = check("Title", &self.title, 200)?;
        self.description = check("Description", &self.description, 10_000)?;
        if let Some(assignee) = &self.assignee_id {
            team.role_of(assignee).ok_or(AppError::BadRequest("The assignee must be a team member".into()))?;
        }
        Ok(self)
    }
}

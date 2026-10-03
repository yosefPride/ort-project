use actix_web::HttpResponse;
use actix_web::web::{Json, Path};
use mongodb::bson::doc;
use mongodb::options::ReturnDocument;

use super::model::*;
use crate::chat::model::ChatMessage;
use crate::comment::model::Comment;
use crate::db::{collection, new_id, now};
use crate::error::{AppError, Result};
use crate::team::extractor::Member;
use crate::team::model::Team;

/// All of the team's issues, oldest first. Filtering and search happen in the
/// frontend, which keeps this endpoint trivial.
pub async fn list(member: Member) -> Result<Json<Vec<Issue>>> {
    Ok(Json(member.scoped::<Issue>().find(doc! {}, doc! { "created_at": 1 }).await?))
}

pub async fn get(member: Member, path: Path<(String, String)>) -> Result<Json<Issue>> {
    let (_, issue_id) = path.into_inner();
    Ok(Json(member.scoped::<Issue>().get(&issue_id).await?))
}

pub async fn create(member: Member, input: Json<IssueInput>) -> Result<Json<Issue>> {
    let input = input.into_inner().validate(&member.team)?;
    // $inc hands out the next number atomically, so two issues created at the
    // same moment can't both become #7.
    let team = collection::<Team>(&member.db)
        .find_one_and_update(doc! { "_id": &member.team.id }, doc! { "$inc": { "issue_counter": 1 } })
        .return_document(ReturnDocument::After)
        .await?
        .ok_or(AppError::NotFound)?;
    let issue = Issue {
        id: new_id(),
        team_id: team.id,
        number: team.issue_counter,
        title: input.title,
        description: input.description,
        priority: input.priority,
        status: Status::Open,
        creator_id: member.user.id.clone(),
        assignee_id: input.assignee_id,
        created_at: now(),
        updated_at: now(),
    };
    member.scoped::<Issue>().insert(&issue).await?;
    Ok(Json(issue))
}

/// Team admins, the creator and the assignee can edit an issue.
pub async fn update(member: Member, path: Path<(String, String)>, input: Json<IssueInput>) -> Result<Json<Issue>> {
    let (_, issue_id) = path.into_inner();
    let issues = member.scoped::<Issue>();
    let mut issue = issues.get(&issue_id).await?;
    member.require_admin_or(&[&issue.creator_id, issue.assignee_id.as_deref().unwrap_or_default()])?;

    let input = input.into_inner().validate(&member.team)?;
    issue.title = input.title;
    issue.description = input.description;
    issue.priority = input.priority;
    issue.status = input.status.unwrap_or(issue.status);
    issue.assignee_id = input.assignee_id;
    issue.updated_at = now();
    issues.replace(&issue.id, &issue).await?;
    Ok(Json(issue))
}

/// Team admins and the creator can delete an issue, which also deletes its comments and chats.
pub async fn delete(member: Member, path: Path<(String, String)>) -> Result<HttpResponse> {
    let (_, issue_id) = path.into_inner();
    let issue = member.scoped::<Issue>().get(&issue_id).await?;
    member.require_admin_or(&[&issue.creator_id])?;

    member.scoped::<Issue>().delete(doc! { "_id": &issue.id }).await?;
    member.scoped::<Comment>().delete(doc! { "issue_id": &issue.id }).await?;
    member.scoped::<ChatMessage>().delete(doc! { "issue_id": &issue.id }).await?;
    Ok(HttpResponse::NoContent().finish())
}

use actix_web::HttpResponse;
use actix_web::web::{Json, Path};
use mongodb::bson::doc;

use super::model::*;
use crate::admin::audit::audit;
use crate::db::{new_id, now};
use crate::error::{AppError, Result};
use crate::issue::model::{Issue, Status};
use crate::team::extractor::Member;
use crate::validation::check;

pub async fn list(member: Member, path: Path<(String, String)>) -> Result<Json<Vec<Comment>>> {
    let (_, issue_id) = path.into_inner();
    let comments = member.scoped::<Comment>();
    Ok(Json(comments.find(doc! { "issue_id": issue_id }, doc! { "created_at": 1 }).await?))
}

pub async fn create(member: Member, path: Path<(String, String)>, input: Json<CommentInput>) -> Result<Json<Comment>> {
    let (_, issue_id) = path.into_inner();
    let issue = member.scoped::<Issue>().get(&issue_id).await?;
    if issue.status == Status::Closed {
        return Err(AppError::Conflict("This issue is closed".into()));
    }
    let comment = Comment {
        id: new_id(),
        team_id: issue.team_id,
        issue_id: issue.id,
        author_id: member.user.id.clone(),
        body: check("Comment", &input.body, 2_000)?,
        reactions: Vec::new(),
        created_at: now(),
    };
    member.scoped::<Comment>().insert(&comment).await?;
    Ok(Json(comment))
}

/// The author or a team admin can delete a comment.
pub async fn delete(member: Member, path: Path<(String, String, String)>) -> Result<HttpResponse> {
    let (_, _, comment_id) = path.into_inner();
    let comments = member.scoped::<Comment>();
    let comment = comments.get(&comment_id).await?;
    member.require_admin_or(&[&comment.author_id])?;
    comments.delete(doc! { "_id": &comment.id }).await?;
    audit(&member.db, &member.user, "comment.delete", format!("\"{}\"", comment.body)).await?;
    Ok(HttpResponse::NoContent().finish())
}

/// Sets the user's reaction. Each user has at most one reaction per comment,
/// so a new emoji replaces their old one.
pub async fn react(member: Member, path: Path<(String, String, String)>, input: Json<ReactionInput>) -> Result<Json<Comment>> {
    let (_, _, comment_id) = path.into_inner();
    let emoji = check("Emoji", &input.emoji, 8)?;
    let comments = member.scoped::<Comment>();
    let mut comment = comments.get(&comment_id).await?;
    comment.reactions.retain(|r| r.user_id != member.user.id);
    comment.reactions.push(Reaction { user_id: member.user.id.clone(), emoji });
    comments.replace(&comment.id, &comment).await?;
    Ok(Json(comment))
}

pub async fn unreact(member: Member, path: Path<(String, String, String)>) -> Result<Json<Comment>> {
    let (_, _, comment_id) = path.into_inner();
    let comments = member.scoped::<Comment>();
    let mut comment = comments.get(&comment_id).await?;
    comment.reactions.retain(|r| r.user_id != member.user.id);
    comments.replace(&comment.id, &comment).await?;
    audit(&member.db, &member.user, "reaction.delete", format!("on comment \"{}\"", comment.body)).await?;
    Ok(Json(comment))
}

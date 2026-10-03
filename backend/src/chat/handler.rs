use actix_web::HttpResponse;
use actix_web::web::{Data, Json, Path};
use mongodb::bson::doc;

use super::gemini::ask_gemini;
use super::model::*;
use crate::AppState;
use crate::db::{new_id, now};
use crate::error::Result;
use crate::issue::model::Issue;
use crate::team::extractor::Member;
use crate::validation::check;

/// How many earlier messages the AI sees. Keeps requests small and cheap.
const HISTORY_LIMIT: usize = 20;

/// The signed-in user's own chat about this issue (other members can't see it).
pub async fn history(member: Member, path: Path<(String, String)>) -> Result<Json<Vec<ChatMessage>>> {
    let (_, issue_id) = path.into_inner();
    let filter = doc! { "issue_id": issue_id, "user_id": &member.user.id };
    Ok(Json(member.scoped::<ChatMessage>().find(filter, doc! { "created_at": 1 }).await?))
}

/// Starts over: deletes the user's conversation about this issue.
pub async fn clear(member: Member, path: Path<(String, String)>) -> Result<HttpResponse> {
    let (_, issue_id) = path.into_inner();
    let issue = member.scoped::<Issue>().get(&issue_id).await?;
    let chat = member.scoped::<ChatMessage>();
    chat.delete(doc! { "issue_id": &issue.id, "user_id": &member.user.id }).await?;
    Ok(HttpResponse::NoContent().finish())
}

/// Sends a message and returns [the user's message, the AI's reply].
pub async fn send(
    member: Member,
    state: Data<AppState>,
    path: Path<(String, String)>,
    input: Json<ChatInput>,
) -> Result<Json<Vec<ChatMessage>>> {
    let (_, issue_id) = path.into_inner();
    let text = check("Message", &input.message, 2_000)?;
    let issue = member.scoped::<Issue>().get(&issue_id).await?;
    let chat = member.scoped::<ChatMessage>();
    let history = chat.find(doc! { "issue_id": &issue.id, "user_id": &member.user.id }, doc! { "created_at": 1 }).await?;
    let recent = &history[history.len().saturating_sub(HISTORY_LIMIT)..];
    let reply = ask_gemini(&state, &issue, recent, &text).await?;

    // Both messages are saved only once the AI has answered, so a failed
    // request leaves no half-finished exchange behind.
    let message = |role: &str, text: String| ChatMessage {
        id: new_id(),
        team_id: issue.team_id.clone(),
        issue_id: issue.id.clone(),
        user_id: member.user.id.clone(),
        role: role.to_string(),
        text,
        created_at: now(),
    };
    let messages = vec![message("user", text), message("model", reply)];
    for message in &messages {
        chat.insert(message).await?;
    }
    Ok(Json(messages))
}

use actix_web::HttpResponse;
use actix_web::web::{Data, Json, Path};
use futures::TryStreamExt;
use mongodb::bson::doc;

use super::audit::audit;
use super::extractor::Admin;
use super::model::*;
use crate::AppState;
use crate::auth::model::Session;
use crate::chat::model::ChatMessage;
use crate::db::{collection, find_all};
use crate::error::{AppError, Result};
use crate::issue::model::Issue;
use crate::team::model::Team;
use crate::user::model::{PublicUser, User};

pub async fn users(_: Admin, state: Data<AppState>) -> Result<Json<Vec<PublicUser>>> {
    let users = find_all(&collection::<User>(&state.db), doc! {}, doc! { "name": 1 }).await?;
    Ok(Json(users.iter().map(PublicUser::from).collect()))
}

pub async fn set_admin(Admin(admin): Admin, state: Data<AppState>, path: Path<String>, input: Json<AdminInput>) -> Result<HttpResponse> {
    let user_id = path.into_inner();
    // Stops the last admin from locking everyone out of the panel.
    if user_id == admin.id {
        return Err(AppError::BadRequest("You can't change your own admin status".into()));
    }
    let update = doc! { "$set": { "is_admin": input.is_admin } };
    collection::<User>(&state.db).update_one(doc! { "_id": &user_id }, update).await?;
    Ok(HttpResponse::NoContent().finish())
}

/// Deletes an account. Their comments stay (shown as "Former member"); their
/// sessions, private AI chats, team memberships and assignments are removed.
pub async fn delete_user(Admin(admin): Admin, state: Data<AppState>, path: Path<String>) -> Result<HttpResponse> {
    let user_id = path.into_inner();
    if user_id == admin.id {
        return Err(AppError::BadRequest("You can't delete your own account here".into()));
    }
    let db = &state.db;
    let user = collection::<User>(db).find_one(doc! { "_id": &user_id }).await?.ok_or(AppError::NotFound)?;
    collection::<User>(db).delete_one(doc! { "_id": &user.id }).await?;
    collection::<Session>(db).delete_many(doc! { "user_id": &user.id }).await?;
    collection::<ChatMessage>(db).delete_many(doc! { "user_id": &user.id }).await?;
    let pull = doc! { "$pull": { "members": { "user_id": &user.id } } };
    collection::<Team>(db).update_many(doc! { "members.user_id": &user.id }, pull).await?;
    let unassign = doc! { "$set": { "assignee_id": null } };
    collection::<Issue>(db).update_many(doc! { "assignee_id": &user.id }, unassign).await?;
    audit(db, &admin, "user.delete", format!("{} ({})", user.name, user.email)).await?;
    Ok(HttpResponse::NoContent().finish())
}

pub async fn teams(_: Admin, state: Data<AppState>) -> Result<Json<Vec<Team>>> {
    Ok(Json(find_all(&collection::<Team>(&state.db), doc! {}, doc! { "name": 1 }).await?))
}

pub async fn delete_team(Admin(admin): Admin, state: Data<AppState>, path: Path<String>) -> Result<HttpResponse> {
    let team = collection::<Team>(&state.db).find_one(doc! { "_id": path.into_inner() }).await?;
    team.ok_or(AppError::NotFound)?.delete(&state.db, &admin).await?;
    Ok(HttpResponse::NoContent().finish())
}

/// The 500 most recent deletions.
pub async fn audit_logs(_: Admin, state: Data<AppState>) -> Result<Json<Vec<AuditLog>>> {
    let logs = collection::<AuditLog>(&state.db).find(doc! {}).sort(doc! { "created_at": -1 }).limit(500).await?;
    Ok(Json(logs.try_collect().await?))
}

use actix_web::cookie::time::Duration;
use actix_web::web::{Data, Json};
use actix_web::{HttpRequest, HttpResponse};
use mongodb::bson::doc;

use super::extractor::AuthUser;
use super::model::*;
use super::password::{hash_password, password_matches};
use super::session::{SESSION_COOKIE, hash_token, session_cookie, start_session};
use crate::AppState;
use crate::db::{collection, new_id, now};
use crate::error::{AppError, Result};
use crate::user::model::{PublicUser, User};
use crate::validation::{check, check_email};

pub async fn register(state: Data<AppState>, input: Json<RegisterInput>) -> Result<HttpResponse> {
    let user = User {
        id: new_id(),
        name: check("Name", &input.name, 80)?,
        email: check_email(&input.email)?,
        password_hash: hash_password(&input.password).await?,
        is_admin: false,
        created_at: now(),
    };
    collection::<User>(&state.db).insert_one(&user).await?;
    signed_in(&state, &user).await
}

pub async fn login(state: Data<AppState>, input: Json<LoginInput>) -> Result<HttpResponse> {
    // Same message for an unknown email and a wrong password, so the form
    // can't be used to find out who has an account.
    let wrong = || AppError::BadRequest("Wrong email or password".into());
    let email = check_email(&input.email)?;
    let user = collection::<User>(&state.db).find_one(doc! { "email": email }).await?;
    let user = user.ok_or_else(wrong)?;
    if !password_matches(&input.password, &user).await? {
        return Err(wrong());
    }
    signed_in(&state, &user).await
}

async fn signed_in(state: &AppState, user: &User) -> Result<HttpResponse> {
    let cookie = start_session(state, &user.id).await?;
    Ok(HttpResponse::Ok().cookie(cookie).json(PublicUser::from(user)))
}

pub async fn logout(state: Data<AppState>, req: HttpRequest) -> Result<HttpResponse> {
    if let Some(cookie) = req.cookie(SESSION_COOKIE) {
        let sessions = collection::<Session>(&state.db);
        sessions.delete_one(doc! { "_id": hash_token(cookie.value()) }).await?;
    }
    let expired = session_cookie(&state, String::new(), Duration::ZERO);
    Ok(HttpResponse::NoContent().cookie(expired).finish())
}

/// The signed-in user, or `null` when signed out (so the frontend can tell
/// "signed out" apart from a real error).
pub async fn me(user: Option<AuthUser>) -> Json<Option<PublicUser>> {
    Json(user.map(|AuthUser(user)| PublicUser::from(&user)))
}

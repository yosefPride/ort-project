use actix_web::cookie::{Cookie, SameSite, time::Duration};
use mongodb::bson::DateTime;
use rand::Rng;
use rand::distr::Alphanumeric;
use sha2::{Digest, Sha256};

use super::model::Session;
use crate::AppState;
use crate::db::collection;
use crate::error::Result;

pub const SESSION_COOKIE: &str = "session";
const SESSION_DAYS: i64 = 30;

pub fn hash_token(token: &str) -> String {
    format!("{:x}", Sha256::digest(token))
}

/// Creates a session for the user and returns the cookie that carries its token.
pub async fn start_session(state: &AppState, user_id: &str) -> Result<Cookie<'static>> {
    let token: String = rand::rng().sample_iter(Alphanumeric).take(43).map(char::from).collect();
    let expires_ms = DateTime::now().timestamp_millis() + SESSION_DAYS * 24 * 60 * 60 * 1000;
    let session = Session {
        token_hash: hash_token(&token),
        user_id: user_id.to_string(),
        expires_at: DateTime::from_millis(expires_ms),
    };
    collection::<Session>(&state.db).insert_one(&session).await?;
    Ok(session_cookie(state, token, Duration::days(SESSION_DAYS)))
}

/// httpOnly: page JavaScript can't read the token. In production the frontend
/// is on another site, which browsers only allow with SameSite=None + Secure.
pub fn session_cookie(state: &AppState, value: String, max_age: Duration) -> Cookie<'static> {
    let same_site = if state.cookie_secure { SameSite::None } else { SameSite::Lax };
    Cookie::build(SESSION_COOKIE, value)
        .path("/")
        .http_only(true)
        .secure(state.cookie_secure)
        .same_site(same_site)
        .max_age(max_age)
        .finish()
}

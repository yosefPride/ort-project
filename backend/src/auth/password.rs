use actix_web::web;

use crate::error::{AppError, Result};
use crate::user::model::User;

// bcrypt is slow on purpose (to resist guessing), so it runs on a background
// thread instead of blocking the server's async threads.
pub async fn hash_password(password: &str) -> Result<String> {
    if password.len() < 8 {
        return Err(AppError::BadRequest("Password must be at least 8 characters".into()));
    }
    let password = password.to_string();
    Ok(web::block(move || bcrypt::hash(password, bcrypt::DEFAULT_COST)).await??)
}

pub async fn password_matches(password: &str, user: &User) -> Result<bool> {
    let (password, hash) = (password.to_string(), user.password_hash.clone());
    Ok(web::block(move || bcrypt::verify(password, &hash)).await??)
}

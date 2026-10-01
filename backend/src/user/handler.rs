use actix_web::HttpResponse;
use actix_web::web::{Data, Json};
use mongodb::bson::doc;

use super::model::*;
use crate::AppState;
use crate::auth::extractor::AuthUser;
use crate::auth::model::Session;
use crate::auth::password::{hash_password, password_matches};
use crate::auth::session::start_session;
use crate::db::collection;
use crate::error::{AppError, Result};
use crate::validation::{check, check_email};

async fn require_password(password: &str, user: &User) -> Result<()> {
    match password_matches(password, user).await? {
        true => Ok(()),
        false => Err(AppError::BadRequest("Current password is incorrect".into())),
    }
}

pub async fn update_profile(
    AuthUser(mut user): AuthUser,
    state: Data<AppState>,
    input: Json<ProfileInput>,
) -> Result<Json<PublicUser>> {
    let email = check_email(&input.email)?;
    // Changing the sign-in email needs the password, so someone who only
    // grabbed an open session can't take over the account.
    if email != user.email {
        require_password(&input.current_password, &user).await?;
    }
    user.name = check("Name", &input.name, 80)?;
    user.email = email;
    collection::<User>(&state.db).replace_one(doc! { "_id": &user.id }, &user).await?;
    Ok(Json(PublicUser::from(&user)))
}

pub async fn change_password(
    AuthUser(mut user): AuthUser,
    state: Data<AppState>,
    input: Json<PasswordInput>,
) -> Result<HttpResponse> {
    require_password(&input.current_password, &user).await?;
    user.password_hash = hash_password(&input.new_password).await?;
    collection::<User>(&state.db).replace_one(doc! { "_id": &user.id }, &user).await?;
    // Sign out every device, then sign this one back in with a fresh session.
    collection::<Session>(&state.db).delete_many(doc! { "user_id": &user.id }).await?;
    let cookie = start_session(&state, &user.id).await?;
    Ok(HttpResponse::NoContent().cookie(cookie).finish())
}

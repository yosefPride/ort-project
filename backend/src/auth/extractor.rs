use actix_web::dev::Payload;
use actix_web::{FromRequest, HttpRequest, web};
use futures::future::LocalBoxFuture;
use mongodb::bson::{DateTime, doc};

use super::model::Session;
use super::session::{SESSION_COOKIE, hash_token};
use crate::AppState;
use crate::db::collection;
use crate::error::{AppError, Result};
use crate::user::model::User;

/// Add `AuthUser(user): AuthUser` to a handler's arguments and it only runs
/// for signed-in users; everyone else gets a 401.
pub struct AuthUser(pub User);

impl FromRequest for AuthUser {
    type Error = AppError;
    type Future = LocalBoxFuture<'static, Result<Self>>;

    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        let req = req.clone();
        Box::pin(async move {
            let state = req.app_data::<web::Data<AppState>>().expect("AppState is registered in main");
            let cookie = req.cookie(SESSION_COOKIE).ok_or(AppError::Unauthorized)?;
            let filter = doc! { "_id": hash_token(cookie.value()), "expires_at": { "$gt": DateTime::now() } };
            let session = collection::<Session>(&state.db).find_one(filter).await?;
            let session = session.ok_or(AppError::Unauthorized)?;
            let user = collection::<User>(&state.db).find_one(doc! { "_id": &session.user_id }).await?;
            Ok(AuthUser(user.ok_or(AppError::Unauthorized)?))
        })
    }
}

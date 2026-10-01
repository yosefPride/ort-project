use actix_web::dev::Payload;
use actix_web::{FromRequest, HttpRequest};
use futures::future::LocalBoxFuture;

use crate::auth::extractor::AuthUser;
use crate::error::{AppError, Result};
use crate::user::model::User;

/// Add `Admin(user): Admin` to a handler and only system admins can call it.
/// System admins manage users and teams, but get no access to issues inside
/// teams they aren't a member of.
pub struct Admin(pub User);

impl FromRequest for Admin {
    type Error = AppError;
    type Future = LocalBoxFuture<'static, Result<Self>>;

    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        let req = req.clone();
        Box::pin(async move {
            let AuthUser(user) = AuthUser::extract(&req).await?;
            match user.is_admin {
                true => Ok(Admin(user)),
                false => Err(AppError::Forbidden),
            }
        })
    }
}

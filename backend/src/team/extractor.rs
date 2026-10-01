use actix_web::dev::Payload;
use actix_web::{FromRequest, HttpRequest, web};
use futures::future::LocalBoxFuture;
use mongodb::Database;
use mongodb::bson::doc;

use super::model::{Role, Team};
use crate::AppState;
use crate::auth::extractor::AuthUser;
use crate::db::{Model, Scoped, collection};
use crate::error::{AppError, Result};
use crate::user::model::User;

/// Add `member: Member` to a handler under /teams/{team_id}/... and it only
/// runs for members of that team. Non-members get 404, so they can't even
/// learn that the team exists. This is the one place team access is checked.
pub struct Member {
    pub user: User,
    pub team: Team,
    pub role: Role,
    pub db: Database,
}

impl Member {
    pub fn require_admin(&self) -> Result<()> {
        self.require_admin_or(&[])
    }

    /// Team admins may do it, and so may the listed users (e.g. an issue's creator).
    pub fn require_admin_or(&self, user_ids: &[&str]) -> Result<()> {
        if self.role == Role::Admin || user_ids.contains(&self.user.id.as_str()) {
            return Ok(());
        }
        Err(AppError::Forbidden)
    }

    /// Issues, comments or chats of this team only (see `Scoped`).
    pub fn scoped<T: Model>(&self) -> Scoped<T> {
        Scoped::new(&self.db, &self.team.id)
    }
}

impl FromRequest for Member {
    type Error = AppError;
    type Future = LocalBoxFuture<'static, Result<Self>>;

    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        let req = req.clone();
        Box::pin(async move {
            let AuthUser(user) = AuthUser::extract(&req).await?;
            let state = req.app_data::<web::Data<AppState>>().expect("AppState is registered in main");
            let team_id = req.match_info().get("team_id").unwrap_or_default();
            let filter = doc! { "_id": team_id, "members.user_id": &user.id };
            let team = collection::<Team>(&state.db).find_one(filter).await?;
            let team = team.ok_or(AppError::NotFound)?;
            let role = team.role_of(&user.id).ok_or(AppError::NotFound)?;
            Ok(Member { user, team, role, db: state.db.clone() })
        })
    }
}

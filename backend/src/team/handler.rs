use actix_web::HttpResponse;
use actix_web::web::{Data, Json, Path, Query};
use mongodb::bson::doc;

use super::extractor::Member;
use super::model::*;
use crate::AppState;
use crate::auth::extractor::AuthUser;
use crate::db::{Scoped, collection, find_all, new_id, now};
use crate::error::{AppError, Result};
use crate::issue::model::Issue;
use crate::user::model::{PublicUser, User};
use crate::validation::{check, check_email};

pub async fn list(AuthUser(user): AuthUser, state: Data<AppState>) -> Result<Json<Vec<TeamSummary>>> {
    let teams = collection::<Team>(&state.db);
    let teams = find_all(&teams, doc! { "members.user_id": &user.id }, doc! { "name": 1 }).await?;
    let mut summaries = Vec::new();
    for team in teams {
        let issues = Scoped::<Issue>::new(&state.db, &team.id);
        // The three counts run at the same time instead of one after another.
        let (open_issues, urgent_issues, my_issues) = futures::try_join!(
            issues.count(doc! { "status": "open" }),
            issues.count(doc! { "status": "open", "priority": { "$in": ["high", "critical"] } }),
            issues.count(doc! { "status": "open", "assignee_id": &user.id }),
        )?;
        summaries.push(TeamSummary {
            role: team.role_of(&user.id).unwrap_or(Role::Contributor),
            member_count: team.members.len(),
            open_issues,
            urgent_issues,
            my_issues,
            id: team.id,
            name: team.name,
        });
    }
    Ok(Json(summaries))
}

pub async fn create(AuthUser(user): AuthUser, state: Data<AppState>, input: Json<NameInput>) -> Result<Json<Team>> {
    let team = Team {
        id: new_id(),
        name: check("Team name", &input.name, 60)?,
        members: vec![Membership { user_id: user.id, role: Role::Admin }],
        issue_counter: 0,
        created_at: now(),
    };
    collection::<Team>(&state.db).insert_one(&team).await?;
    Ok(Json(team))
}

pub async fn rename(member: Member, input: Json<NameInput>) -> Result<HttpResponse> {
    member.require_admin()?;
    let mut team = member.team;
    team.name = check("Team name", &input.name, 60)?;
    team.save(&member.db).await?;
    Ok(HttpResponse::NoContent().finish())
}

pub async fn delete(member: Member) -> Result<HttpResponse> {
    member.require_admin()?;
    member.team.delete(&member.db, &member.user).await?;
    Ok(HttpResponse::NoContent().finish())
}

pub async fn members(member: Member) -> Result<Json<Vec<MemberView>>> {
    let ids: Vec<&String> = member.team.members.iter().map(|m| &m.user_id).collect();
    let users = collection::<User>(&member.db);
    let users = find_all(&users, doc! { "_id": { "$in": ids } }, doc! { "name": 1 }).await?;
    let views = users.into_iter().map(|user| MemberView {
        role: member.team.role_of(&user.id).unwrap_or(Role::Contributor),
        id: user.id,
        name: user.name,
        email: user.email,
    });
    Ok(Json(views.collect()))
}

/// Finds an account by exact email, so an admin can check who they're adding.
pub async fn lookup(member: Member, query: Query<EmailQuery>) -> Result<Json<PublicUser>> {
    member.require_admin()?;
    let user = collection::<User>(&member.db).find_one(doc! { "email": check_email(&query.email)? }).await?;
    let user = user.ok_or(AppError::BadRequest("No account uses that email".into()))?;
    Ok(Json(PublicUser::from(&user)))
}

pub async fn add_member(member: Member, input: Json<AddMemberInput>) -> Result<HttpResponse> {
    member.require_admin()?;
    let user = collection::<User>(&member.db).find_one(doc! { "email": check_email(&input.email)? }).await?;
    let user = user.ok_or(AppError::BadRequest("No account uses that email".into()))?;
    let mut team = member.team;
    if team.role_of(&user.id).is_some() {
        return Err(AppError::Conflict("Already a member of this team".into()));
    }
    team.members.push(Membership { user_id: user.id, role: input.role });
    team.save(&member.db).await?;
    Ok(HttpResponse::NoContent().finish())
}

pub async fn change_role(member: Member, path: Path<(String, String)>, input: Json<RoleInput>) -> Result<HttpResponse> {
    member.require_admin()?;
    let (_, user_id) = path.into_inner();
    let mut team = member.team;
    if input.role != Role::Admin {
        team.check_keeps_admin(&user_id)?;
    }
    let membership = team.members.iter_mut().find(|m| m.user_id == user_id);
    membership.ok_or(AppError::NotFound)?.role = input.role;
    team.save(&member.db).await?;
    Ok(HttpResponse::NoContent().finish())
}

/// Removes a member. Admins can remove anyone; everyone can remove themselves (leave).
pub async fn remove_member(member: Member, path: Path<(String, String)>) -> Result<HttpResponse> {
    let (_, user_id) = path.into_inner();
    if user_id != member.user.id {
        member.require_admin()?;
    }
    let mut team = member.team.clone();
    team.role_of(&user_id).ok_or(AppError::NotFound)?;
    team.check_keeps_admin(&user_id)?;
    team.members.retain(|m| m.user_id != user_id);
    team.save(&member.db).await?;
    // Their open work in this team goes back to unassigned.
    let issues = member.scoped::<Issue>();
    issues.update(doc! { "assignee_id": &user_id }, doc! { "$set": { "assignee_id": null } }).await?;
    Ok(HttpResponse::NoContent().finish())
}

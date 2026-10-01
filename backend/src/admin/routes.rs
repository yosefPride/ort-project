use actix_web::web;

use super::handler;

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(web::resource("/admin/users").route(web::get().to(handler::users)))
        .service(
            web::resource("/admin/users/{user_id}")
                .route(web::patch().to(handler::set_admin))
                .route(web::delete().to(handler::delete_user)),
        )
        .service(web::resource("/admin/teams").route(web::get().to(handler::teams)))
        .service(web::resource("/admin/teams/{team_id}").route(web::delete().to(handler::delete_team)))
        .service(web::resource("/admin/audit-logs").route(web::get().to(handler::audit_logs)));
}

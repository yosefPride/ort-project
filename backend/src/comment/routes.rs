use actix_web::web;

use super::handler;

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::resource("/teams/{team_id}/issues/{issue_id}/comments")
            .route(web::get().to(handler::list))
            .route(web::post().to(handler::create)),
    )
    .service(
        web::resource("/teams/{team_id}/issues/{issue_id}/comments/{comment_id}")
            .route(web::delete().to(handler::delete)),
    )
    .service(
        web::resource("/teams/{team_id}/issues/{issue_id}/comments/{comment_id}/reaction")
            .route(web::put().to(handler::react))
            .route(web::delete().to(handler::unreact)),
    );
}

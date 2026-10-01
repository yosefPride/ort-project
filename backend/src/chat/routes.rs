use actix_web::web;

use super::handler;

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::resource("/teams/{team_id}/issues/{issue_id}/chat")
            .route(web::get().to(handler::history))
            .route(web::post().to(handler::send))
            .route(web::delete().to(handler::clear)),
    );
}

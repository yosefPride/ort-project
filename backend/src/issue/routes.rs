use actix_web::web;

use super::handler;

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::resource("/teams/{team_id}/issues")
            .route(web::get().to(handler::list))
            .route(web::post().to(handler::create)),
    )
    .service(
        web::resource("/teams/{team_id}/issues/{issue_id}")
            .route(web::get().to(handler::get))
            .route(web::put().to(handler::update))
            .route(web::delete().to(handler::delete)),
    );
}

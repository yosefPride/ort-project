use actix_web::web;

use super::handler;

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::resource("/teams")
            .route(web::get().to(handler::list))
            .route(web::post().to(handler::create)),
    )
    .service(
        web::resource("/teams/{team_id}")
            .route(web::patch().to(handler::rename))
            .route(web::delete().to(handler::delete)),
    )
    .service(
        web::resource("/teams/{team_id}/members")
            .route(web::get().to(handler::members))
            .route(web::post().to(handler::add_member)),
    )
    .service(web::resource("/teams/{team_id}/users/lookup").route(web::get().to(handler::lookup)))
    .service(
        web::resource("/teams/{team_id}/members/{user_id}")
            .route(web::patch().to(handler::change_role))
            .route(web::delete().to(handler::remove_member)),
    );
}

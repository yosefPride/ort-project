use actix_web::web;

use super::handler;

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(web::resource("/auth/register").route(web::post().to(handler::register)))
        .service(web::resource("/auth/login").route(web::post().to(handler::login)))
        .service(web::resource("/auth/logout").route(web::post().to(handler::logout)))
        .service(web::resource("/auth/me").route(web::get().to(handler::me)));
}

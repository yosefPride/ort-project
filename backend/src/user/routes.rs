use actix_web::web;

use super::handler;

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(web::resource("/me").route(web::patch().to(handler::update_profile)))
        .service(web::resource("/me/password").route(web::put().to(handler::change_password)));
}

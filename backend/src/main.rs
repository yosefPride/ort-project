mod admin;
mod auth;
mod chat;
mod comment;
mod config;
mod db;
mod error;
mod issue;
mod team;
mod user;
mod validation;

use actix_cors::Cors;
use actix_web::middleware::Logger;
use actix_web::{App, HttpServer, web};
use mongodb::{Client, Database};

use crate::config::Config;
use crate::error::AppError;

/// Shared by every request (handlers receive it as `web::Data<AppState>`).
pub struct AppState {
    pub db: Database,
    pub http: reqwest::Client,
    pub gemini_key: Option<String>,
    pub cookie_secure: bool,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let config = Config::from_env();
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let client = Client::with_uri_str(&config.mongo_uri).await.expect("cannot connect to MongoDB");
    let db = client.database(&config.mongo_db);
    db::create_indexes(&db).await.expect("cannot create indexes");

    let state = web::Data::new(AppState {
        db,
        http: reqwest::Client::new(),
        gemini_key: config.gemini_key,
        cookie_secure: config.cookie_secure,
    });
    let origin = config.frontend_origin;

    HttpServer::new(move || {
        // The frontend runs on another origin and must send the session cookie.
        let cors = Cors::default()
            .allowed_origin(&origin)
            .allow_any_method()
            .allow_any_header()
            .supports_credentials();
        // Malformed JSON bodies get the same {"error": "..."} shape as every other error.
        let json = web::JsonConfig::default()
            .error_handler(|error, _| AppError::BadRequest(error.to_string()).into());

        App::new()
            .app_data(state.clone())
            .app_data(json)
            .wrap(cors)
            .wrap(Logger::default())
            .service(
                web::scope("/api")
                    .configure(auth::routes::routes)
                    .configure(user::routes::routes)
                    .configure(team::routes::routes)
                    .configure(issue::routes::routes)
                    .configure(comment::routes::routes)
                    .configure(chat::routes::routes)
                    .configure(admin::routes::routes),
            )
    })
    .bind(("0.0.0.0", config.port))?
    .run()
    .await
}

mod admin;
mod auth;
mod chat;
mod comment;
mod config;
mod db;
mod error;
mod issue;
mod logging;
mod team;
mod user;
mod validation;

use actix_cors::Cors;
use actix_web::middleware::from_fn;
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
    logging::init();

    // creating the client with a connection to the resolve cluster
    let client = Client::with_uri_str(&config.mongo_uri)
        .await
        .expect("cannot connect to MongoDB");
    // creating the resolve db
    let db = client.database(&config.mongo_db);
    // creating all the indexes in the db
    db::create_indexes(&db)
        .await
        .expect("cannot create indexes");

    // creating the shared app state
    let state = web::Data::new(AppState {
        db,
        http: reqwest::Client::new(),
        gemini_key: config.gemini_key,
        cookie_secure: config.cookie_secure,
    });
    // setting the client's origin
    let origin = config.frontend_origin;

    HttpServer::new(move || {
        // The frontend runs on another origin and must send the session cookie.
        let cors = Cors::default() // default() is a restrictive set of defaults
            .allowed_origin(&origin) // the only origin allowed to send requests is our client
            .allow_any_method() // all methods are allowed
            .allow_any_header() // all headers are allowed
            .supports_credentials(); // Allows users to make authenticated requests.
        // Malformed JSON bodies get the same {"error": "..."} shape as every other error.
        let json = web::JsonConfig::default()
            .error_handler(|error, _| AppError::BadRequest(error.to_string()).into());

        App::new()
            // hand the state and json config to every request
            .app_data(state.clone())
            .app_data(json)
            .wrap(cors) // enable CORS for every request
            .wrap(from_fn(logging::log_request)) // log every request
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
    .bind(("localhost", config.port))?
    .run()
    .await
}

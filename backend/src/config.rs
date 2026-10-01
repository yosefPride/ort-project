use std::env;

/// Settings read from environment variables (or a `.env` file) at startup.
/// See `.env.example` for the full list.
pub struct Config {
    pub mongo_uri: String,
    pub mongo_db: String,
    /// Optional: without it the server still runs, but the AI chat is unavailable.
    pub gemini_key: Option<String>,
    /// `false` for local http development; must be `true` in production (https).
    pub cookie_secure: bool,
    /// The one site allowed to call the API from a browser (CORS).
    pub frontend_origin: String,
    pub port: u16,
}

impl Config {
    /// Stops the server with a clear message if a required setting is missing or invalid.
    pub fn from_env() -> Config {
        dotenvy::dotenv().ok();
        let or = |name: &str, default: &str| env::var(name).unwrap_or(default.to_string());
        Config {
            mongo_uri: env::var("MONGO_URI").expect("MONGO_URI must be set"),
            mongo_db: or("MONGO_DB", "resolve"),
            gemini_key: env::var("GEMINI_API_KEY").ok().filter(|key| !key.is_empty()),
            cookie_secure: or("COOKIE_SECURE", "true") != "false",
            frontend_origin: or("FRONTEND_ORIGIN", "http://localhost:5173"),
            port: or("PORT", "8080").parse().expect("PORT must be a number"),
        }
    }
}

use actix_web::http::StatusCode;
use actix_web::{HttpResponse, ResponseError};
use mongodb::error::{ErrorKind, WriteFailure};
use serde_json::json;

/// Every handler returns `Result<T>`. `?` converts library errors into an
/// AppError, and actix turns that into a JSON response: {"error": "..."}.
#[derive(Debug)]
pub enum AppError {
    BadRequest(String),
    Unauthorized,
    Forbidden,
    NotFound,
    Conflict(String),
    AiUnavailable,
    Internal,
}

pub type Result<T> = std::result::Result<T, AppError>;

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let message = match self {
            AppError::BadRequest(message) | AppError::Conflict(message) => message.as_str(),
            AppError::Unauthorized => "Please sign in",
            AppError::Forbidden => "You are not allowed to do that",
            AppError::NotFound => "Not found",
            AppError::AiUnavailable => "The AI assistant is unavailable right now, try again soon",
            AppError::Internal => "Something went wrong",
        };
        write!(f, "{message}")
    }
}

impl ResponseError for AppError {
    fn status_code(&self) -> StatusCode {
        match self {
            AppError::BadRequest(_) => StatusCode::BAD_REQUEST,
            AppError::Unauthorized => StatusCode::UNAUTHORIZED,
            AppError::Forbidden => StatusCode::FORBIDDEN,
            AppError::NotFound => StatusCode::NOT_FOUND,
            AppError::Conflict(_) => StatusCode::CONFLICT,
            AppError::AiUnavailable => StatusCode::SERVICE_UNAVAILABLE,
            AppError::Internal => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status_code()).json(json!({ "error": self.to_string() }))
    }
}

impl From<mongodb::error::Error> for AppError {
    fn from(error: mongodb::error::Error) -> Self {
        // Code 11000 means a unique index rejected the write. The only unique
        // field a user can type is their email, so that's what we report.
        if let ErrorKind::Write(WriteFailure::WriteError(write)) = error.kind.as_ref()
            && write.code == 11000
        {
            return AppError::Conflict("That email is already in use".into());
        }
        log::error!("database error: {error}");
        AppError::Internal
    }
}

// These failures are never the user's fault: log the details, answer with a plain 500.
macro_rules! internal_error_from {
    ($($error:ty),*) => {$(
        impl From<$error> for AppError {
            fn from(error: $error) -> Self {
                log::error!("{error}");
                AppError::Internal
            }
        }
    )*};
}
internal_error_from!(bcrypt::BcryptError, actix_web::error::BlockingError, mongodb::bson::ser::Error);

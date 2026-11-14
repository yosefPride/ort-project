use std::time::{Duration, Instant};

use actix_web::Error;
use actix_web::body::MessageBody;
use actix_web::dev::{ServiceRequest, ServiceResponse};
use actix_web::middleware::Next;

/// Sets up env_logger: level from RUST_LOG (default "info"), second-precision timestamps, no module path.
pub fn init() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info"))
        .format_timestamp_secs()
        .format_target(false)
        .init();
}

/// Middleware that logs every request: "GET /api/teams → 200 (45ms)".
pub async fn log_request(
    req: ServiceRequest,
    next: Next<impl MessageBody>,
) -> Result<ServiceResponse<impl MessageBody>, Error> {
    let start = Instant::now();
    let method = req.method().to_string();
    let path = req.path().to_string();
    let response = next.call(req).await?;
    log::info!(
        "{method} {path} → {} ({})",
        response.status().as_u16(),
        format_duration(start.elapsed())
    );
    Ok(response)
}

/// "45ms" under a second, "1.18s" above it.
fn format_duration(elapsed: Duration) -> String {
    let millis = elapsed.as_millis();
    if millis < 1000 {
        format!("{millis}ms")
    } else {
        format!("{:.2}s", elapsed.as_secs_f64())
    }
}

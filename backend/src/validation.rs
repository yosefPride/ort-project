use crate::error::{AppError, Result};

/// Trims a text input and checks it's between 1 and `max` characters.
pub fn check(field: &str, value: &str, max: usize) -> Result<String> {
    let value = value.trim();
    if value.is_empty() || value.chars().count() > max {
        return Err(AppError::BadRequest(format!("{field} must be 1 to {max} characters")));
    }
    Ok(value.to_string())
}

/// Emails are stored lowercase so "Bob@x.com" and "bob@x.com" are the same account.
pub fn check_email(email: &str) -> Result<String> {
    let email = email.trim().to_lowercase();
    if !email.contains('@') || email.len() > 254 {
        return Err(AppError::BadRequest("Enter a valid email".into()));
    }
    Ok(email)
}

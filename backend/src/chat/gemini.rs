use serde_json::{Value, json};

use super::model::ChatMessage;
use crate::AppState;
use crate::error::{AppError, Result};
use crate::issue::model::Issue;

// Pinned on purpose: "-latest" aliases silently change quota and behaviour.
const GEMINI_URL: &str =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

fn instructions(issue: &Issue) -> String {
    format!(
        "You help a software team with one bug-tracker issue. Only discuss this issue and \
         software debugging; politely decline anything unrelated. Be concise and use Markdown.\n\n\
         Issue #{}: {}\nPriority: {:?}\nStatus: {:?}\nDescription:\n{}",
        issue.number,
        issue.title,
        issue.priority,
        issue.status,
        issue.description,
    )
}

/// Sends the conversation to Gemini and returns its reply. The AI only reads:
/// it gets this one issue's text and never touches the database.
pub async fn ask_gemini(state: &AppState, issue: &Issue, history: &[ChatMessage], message: &str) -> Result<String> {
    let key = state.gemini_key.as_ref().ok_or(AppError::AiUnavailable)?;
    let mut contents: Vec<Value> = history
        .iter()
        .map(|m| json!({ "role": m.role, "parts": [{ "text": m.text }] }))
        .collect();
    contents.push(json!({ "role": "user", "parts": [{ "text": message }] }));
    let body = json!({
        "systemInstruction": { "parts": [{ "text": instructions(issue) }] },
        "contents": contents,
    });

    let response = state.http.post(GEMINI_URL).header("x-goog-api-key", key).json(&body).send().await;
    let reply: Value = match response {
        Ok(response) if response.status().is_success() => response.json().await.unwrap_or_default(),
        Ok(response) => {
            log::error!("Gemini answered {}: {}", response.status(), response.text().await.unwrap_or_default());
            return Err(AppError::AiUnavailable);
        }
        Err(error) => {
            log::error!("Gemini request failed: {error}");
            return Err(AppError::AiUnavailable);
        }
    };
    let text = reply["candidates"][0]["content"]["parts"][0]["text"].as_str();
    text.map(str::to_string).ok_or(AppError::AiUnavailable)
}

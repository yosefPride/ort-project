use mongodb::bson::{Document, doc};
use mongodb::options::IndexOptions;
use mongodb::{Database, IndexModel};
use std::time::Duration;

use crate::error::Result;

/// Creates all indexes required by the application.
///
/// This function is called during application startup. MongoDB will not
/// create a duplicate index if an equivalent index already exists.
pub async fn create_indexes(db: &Database) -> Result<()> {
    // Configuration for indexes that must contain unique values.
    // Used for fields such as user email addresses and issue numbers.
    let unique = IndexOptions::builder().unique(true).build();

    // Configuration for a TTL (Time-To-Live) index.
    //
    // MongoDB automatically removes documents once the timestamp stored
    // in the indexed field has passed. Duration::ZERO means the document
    // becomes eligible for deletion as soon as its expiration time is reached.
    let expire = IndexOptions::builder().expire_after(Duration::ZERO).build();

    let indexes = [
        // Users: each email address must be unique.
        ("users", doc! { "email": 1 }, Some(unique.clone())),
        // Sessions: automatically delete sessions after expires_at.
        ("sessions", doc! { "expires_at": 1 }, Some(expire)),
        // Teams: index members by their user ID for efficient lookups.
        ("teams", doc! { "members.user_id": 1 }, None),
        // Issues: issue numbers must be unique within a team.
        ("issues", doc! { "team_id": 1, "number": 1 }, Some(unique)),
        // Comments: efficiently find comments belonging to an issue in a team.
        ("comments", doc! { "team_id": 1, "issue_id": 1 }, None),
        // Chat messages: efficiently find messages sent by a user
        // within a specific issue and team.
        (
            "chat_messages",
            doc! { "team_id": 1, "issue_id": 1, "user_id": 1},
            None,
        ),
    ];

    // Build and create each index.
    //
    // create_index() is safe to run at startup: if the index already
    // exists with the same definition, MongoDB does not create another one.
    for (name, keys, options) in indexes {
        let index = IndexModel::builder().keys(keys).options(options).build();

        db.collection::<Document>(name).create_index(index).await?;
    }

    Ok(())
}

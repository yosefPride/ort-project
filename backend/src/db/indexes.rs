use mongodb::bson::{Document, doc};
use mongodb::options::IndexOptions;
use mongodb::{Database, IndexModel};
use std::time::Duration;

use crate::error::Result;

/// Runs at startup. Creating an index that already exists does nothing.
pub async fn create_indexes(db: &Database) -> Result<()> {
    let unique = IndexOptions::builder().unique(true).build();
    // MongoDB deletes a session by itself once its `expires_at` has passed.
    let expire = IndexOptions::builder().expire_after(Duration::ZERO).build();
    let indexes = [
        ("users", doc! { "email": 1 }, Some(unique.clone())),
        ("sessions", doc! { "expires_at": 1 }, Some(expire)),
        ("teams", doc! { "members.user_id": 1 }, None),
        ("issues", doc! { "team_id": 1, "number": 1 }, Some(unique)),
        ("comments", doc! { "team_id": 1, "issue_id": 1 }, None),
        ("chat_messages", doc! { "team_id": 1, "issue_id": 1, "user_id": 1 }, None),
    ];
    for (name, keys, options) in indexes {
        let index = IndexModel::builder().keys(keys).options(options).build();
        db.collection::<Document>(name).create_index(index).await?;
    }
    Ok(())
}

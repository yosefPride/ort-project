mod indexes;
mod scoped;

// Re-export selected items so other modules can access them through `db`
// without exposing the internal `indexes` and `scoped` modules.
pub use indexes::create_indexes;
pub use scoped::Scoped;

use chrono::{DateTime, Utc};
use futures::TryStreamExt;
use mongodb::bson::{Document, oid::ObjectId};
use mongodb::{Collection, Database};
use serde::{Serialize, de::DeserializeOwned};

use crate::error::Result;

/// Represents a type that can be stored in MongoDB.
///
/// Each model specifies its own collection name and must support
/// serialization, deserialization, and the thread-safety requirements
/// needed by the asynchronous database layer.
pub trait Model: Serialize + DeserializeOwned + Send + Sync + Unpin {
    /// The MongoDB collection associated with this model.
    ///
    /// For example, `User` might use "users", while `Issue` uses "issues".
    /// A static string is sufficient because collection names are fixed.
    const COLLECTION: &'static str;
}

/// Returns a typed handle to the MongoDB collection associated with `T`.
///
/// The `Model` constraint guarantees that `T` defines a collection name.
/// For example, `collection::<User>(db)` returns a `Collection<User>`
/// associated with the "users" collection.
pub fn collection<T: Model>(db: &Database) -> Collection<T> {
    db.collection(T::COLLECTION)
}

/// Generates a new MongoDB ObjectId and returns its hexadecimal representation.
///
/// IDs are stored as strings in application models, allowing the same
/// representation to be used in MongoDB documents and JSON responses.
pub fn new_id() -> String {
    ObjectId::new().to_hex()
}

/// Returns the current UTC date and time.
///
/// Using UTC provides a consistent timestamp regardless of the user's
/// or server's local timezone.
pub fn now() -> DateTime<Utc> {
    Utc::now()
}

/// Retrieves all documents matching a filter, sorted according to `sort`.
///
/// - `col`: The MongoDB collection to query.
/// - `filter`: The conditions documents must satisfy.
/// - `sort`: The fields and directions used to order the results.
///
/// `find()` returns a cursor that yields documents asynchronously.
/// `try_collect()` gathers the results into a `Vec<T>`, returning an error
/// if the query or retrieval of any document fails.
///
/// The `?` operator propagates errors to the caller, while `Ok(...)`
/// wraps the successfully collected documents in the application's Result type.
pub async fn find_all<T: Model>(
    col: &Collection<T>,
    filter: Document,
    sort: Document,
) -> Result<Vec<T>> {
    Ok(col.find(filter).sort(sort).await?.try_collect().await?)
}

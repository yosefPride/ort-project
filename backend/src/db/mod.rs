mod indexes;
mod scoped;

pub use indexes::create_indexes;
pub use scoped::Scoped;

use chrono::{DateTime, Utc};
use futures::TryStreamExt;
use mongodb::bson::{Document, oid::ObjectId};
use mongodb::{Collection, Database};
use serde::{Serialize, de::DeserializeOwned};

use crate::error::Result;

/// Anything stored in MongoDB. Each type names its own collection, so code
/// writes `collection::<User>(db)` instead of repeating the string "users".
pub trait Model: Serialize + DeserializeOwned + Send + Sync + Unpin {
    const COLLECTION: &'static str;
}

pub fn collection<T: Model>(db: &Database) -> Collection<T> {
    db.collection(T::COLLECTION)
}

/// IDs are plain strings (ObjectId hex), so the same struct can be stored in
/// MongoDB and sent as JSON without any conversion.
pub fn new_id() -> String {
    ObjectId::new().to_hex()
}

pub fn now() -> DateTime<Utc> {
    Utc::now()
}

pub async fn find_all<T: Model>(col: &Collection<T>, filter: Document, sort: Document) -> Result<Vec<T>> {
    Ok(col.find(filter).sort(sort).await?.try_collect().await?)
}

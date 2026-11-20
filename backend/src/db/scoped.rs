use mongodb::Collection;
use mongodb::Database;
use mongodb::bson::{Document, doc};

use super::{Model, collection, find_all};
use crate::error::{AppError, Result};

/// A collection wrapper that restricts database operations to a single team.
///
/// Every query filter is automatically scoped to the stored `team_id`, preventing
/// handlers from accidentally accessing documents belonging to another team.
///
/// This is intended for team-specific collections such as issues, comments, and chats.
pub struct Scoped<T: Model> {
    col: Collection<T>,
    team_id: String,
}

impl<T: Model> Scoped<T> {
    /// Creates a scoped collection for the specified team.
    ///
    /// The collection is determined by the model type `T`, while `team_id`
    /// determines which team's documents can be accessed.
    pub fn new(db: &Database, team_id: &str) -> Self {
        Scoped {
            col: collection(db),
            team_id: team_id.to_string(),
        }
    }

    /// Adds this wrapper's `team_id` to a MongoDB query filter.
    ///
    /// This ensures that queries only match documents belonging to the
    /// specified team, regardless of the other filter conditions.
    fn scope(&self, mut filter: Document) -> Document {
        filter.insert("team_id", &self.team_id);
        filter
    }

    /// Retrieves all documents matching the filter, restricted to this team.
    ///
    /// Results are ordered according to the provided sort document.
    pub async fn find(&self, filter: Document, sort: Document) -> Result<Vec<T>> {
        find_all(&self.col, self.scope(filter), sort).await
    }

    /// Retrieves a single document by its ID, restricted to this team.
    ///
    /// Returns `AppError::NotFound` if no matching document exists.
    pub async fn get(&self, id: &str) -> Result<T> {
        self.col
            .find_one(self.scope(doc! { "_id": id }))
            .await?
            .ok_or(AppError::NotFound)
    }

    /// Counts documents matching the filter, restricted to this team.
    pub async fn count(&self, filter: Document) -> Result<u64> {
        Ok(self.col.count_documents(self.scope(filter)).await?)
    }

    /// Inserts a new document into the collection.
    ///
    /// Unlike the query-based methods, this method does not automatically
    /// add `team_id` to the inserted document. The caller must ensure that
    /// the document contains the correct team ID.
    pub async fn insert(&self, item: &T) -> Result<()> {
        self.col.insert_one(item).await?;
        Ok(())
    }

    /// Replaces a stored document with the provided document.
    ///
    /// The replacement is restricted to documents matching both the
    /// specified `_id` and this wrapper's `team_id`.
    ///
    /// If no document matches, the operation succeeds without replacing
    /// anything; MongoDB does not treat a zero-match replacement as an error.
    pub async fn replace(&self, id: &str, item: &T) -> Result<()> {
        self.col
            .replace_one(self.scope(doc! { "_id": id }), item)
            .await?;
        Ok(())
    }

    /// Updates all documents matching the filter, restricted to this team.
    ///
    /// The `update` document specifies the changes to apply, such as
    /// setting a field with `$set` or incrementing a value with `$inc`.
    pub async fn update(&self, filter: Document, update: Document) -> Result<()> {
        self.col.update_many(self.scope(filter), update).await?;
        Ok(())
    }

    /// Deletes all documents matching the filter, restricted to this team.
    pub async fn delete(&self, filter: Document) -> Result<()> {
        self.col.delete_many(self.scope(filter)).await?;
        Ok(())
    }
}

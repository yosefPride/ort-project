use mongodb::Collection;
use mongodb::Database;
use mongodb::bson::{Document, doc};

use super::{Model, collection, find_all};
use crate::error::{AppError, Result};

/// A collection that only sees ONE team's documents: every filter gets
/// `team_id` added. Handlers reach issues, comments and chats only through
/// this, so they can't read or change another team's data by mistake.
pub struct Scoped<T: Model> {
    col: Collection<T>,
    team_id: String,
}

impl<T: Model> Scoped<T> {
    pub fn new(db: &Database, team_id: &str) -> Self {
        Scoped { col: collection(db), team_id: team_id.to_string() }
    }

    fn scope(&self, mut filter: Document) -> Document {
        filter.insert("team_id", &self.team_id);
        filter
    }

    pub async fn find(&self, filter: Document, sort: Document) -> Result<Vec<T>> {
        find_all(&self.col, self.scope(filter), sort).await
    }

    pub async fn get(&self, id: &str) -> Result<T> {
        self.col.find_one(self.scope(doc! { "_id": id })).await?.ok_or(AppError::NotFound)
    }

    pub async fn count(&self, filter: Document) -> Result<u64> {
        Ok(self.col.count_documents(self.scope(filter)).await?)
    }

    pub async fn insert(&self, item: &T) -> Result<()> {
        self.col.insert_one(item).await?;
        Ok(())
    }

    /// Saves a changed document back over the stored one.
    pub async fn replace(&self, id: &str, item: &T) -> Result<()> {
        self.col.replace_one(self.scope(doc! { "_id": id }), item).await?;
        Ok(())
    }

    pub async fn update(&self, filter: Document, update: Document) -> Result<()> {
        self.col.update_many(self.scope(filter), update).await?;
        Ok(())
    }

    pub async fn delete(&self, filter: Document) -> Result<()> {
        self.col.delete_many(self.scope(filter)).await?;
        Ok(())
    }
}

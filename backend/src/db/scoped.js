import { notFound } from '../error.js';

/**
 * A collection that only sees ONE team's documents: every filter gets
 * `team_id` added. Handlers reach issues, comments and chats only through
 * this, so they can't read or change another team's data by mistake.
 */
export class Scoped {
  #collection;
  #teamId;

  constructor(db, name, teamId) {
    this.#collection = db.collection(name);
    this.#teamId = teamId;
  }

  #scope(filter) {
    return { ...filter, team_id: this.#teamId };
  }

  find(filter, sort) {
    return this.#collection.find(this.#scope(filter)).sort(sort).toArray();
  }

  async get(id) {
    const item = await this.#collection.findOne(this.#scope({ _id: id }));
    if (!item) throw notFound();
    return item;
  }

  count(filter) {
    return this.#collection.countDocuments(this.#scope(filter));
  }

  async insert(item) {
    await this.#collection.insertOne(item);
  }

  /** Saves a changed document back over the stored one. */
  async replace(id, item) {
    await this.#collection.replaceOne(this.#scope({ _id: id }), item);
  }

  async update(filter, update) {
    await this.#collection.updateMany(this.#scope(filter), update);
  }

  async delete(filter) {
    await this.#collection.deleteMany(this.#scope(filter));
  }
}

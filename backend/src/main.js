import { MongoClient } from 'mongodb';

import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createIndexes } from './db/index.js';
import { log } from './logging.js';

const config = loadConfig();

const client = new MongoClient(config.mongoUri);
await client.connect();
const db = client.db(config.mongoDb);
await createIndexes(db);

const app = createApp({
  db,
  geminiKey: config.geminiKey,
  cookieSecure: config.cookieSecure,
  frontendOrigin: config.frontendOrigin,
});

app.listen(config.port, '0.0.0.0', () => {
  log.info(`API listening on http://localhost:${config.port}/api`);
});

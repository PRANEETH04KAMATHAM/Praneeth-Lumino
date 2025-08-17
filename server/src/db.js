// server/src/db.js
const { MongoClient } = require('mongodb');

let client;
let db;

async function connectMongo(uri, dbName = 'lumio_summarizer') {
  if (!uri) {
    console.warn('MONGODB_URI not set. Running without DB.');
    return;
  }

  client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  db = client.db(dbName);
  console.log('MongoDB connected (native driver)');
}

function getDb() {
  if (!db) throw new Error('DB not initialized. Call connectMongo first.');
  return db;
}

async function closeMongo() {
  if (client) await client.close();
}

module.exports = { connectMongo, getDb, closeMongo };

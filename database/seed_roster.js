import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'cbit_freshers';

if (!uri) {
  console.error('[Error] MONGODB_URI is not set in environment or .env file.');
  console.error('Usage: MONGODB_URI="mongodb+srv://..." node seed_roster.js');
  process.exit(1);
}

const rosterPath = path.join(__dirname, 'cbit_faculty_roster.json');
const rawData = fs.readFileSync(rosterPath, 'utf8');
const roster = JSON.parse(rawData);

async function run() {
  console.log(`Connecting to MongoDB...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('faculty_invitations');

    // Create performance indexes
    console.log(`Creating indexes...`);
    await collection.createIndex({ faculty_group: 1 });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ department: 1 });
    await collection.createIndex({ name: 1 });

    // Format docs with created_at and updated_at
    const now = new Date().toISOString();
    const docs = roster.map((item) => ({
      ...item,
      created_at: now,
      updated_at: now,
    }));

    // Replace collection records
    await collection.deleteMany({});
    const result = await collection.insertMany(docs);

    console.log(`[Success] Successfully populated ${result.insertedCount} records into "${dbName}.faculty_invitations"!`);
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error('[Error] Failed to seed database:', err);
  process.exit(1);
});

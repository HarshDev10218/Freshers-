import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Permissive CORS for split frontend/backend deployments
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 5000;
let mongoUri = process.env.MONGODB_URI || '';
const DB_NAME = process.env.MONGODB_DB_NAME || 'cbit_freshers';
const COLLECTION_NAME = 'faculty_invitations';

// Local backup store path
const DATA_DIR = path.join(__dirname, 'data');
const BACKUP_FILE = path.join(DATA_DIR, 'faculty_store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let mongoClient = null;
let db = null;
let isMongoConnected = false;
let mongoError = null;

// Helpers for Local JSON Fallback Store
function readLocalStore() {
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const data = fs.readFileSync(BACKUP_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading local file backup:', err);
  }
  return [];
}

function writeLocalStore(records) {
  try {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(records, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local file backup:', err);
  }
}

// Broadcast helper to all connected WebSocket clients
function broadcast(message) {
  const payload = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
      } catch (err) {
        console.error('WebSocket send error:', err);
      }
    }
  });
}

// WebSocket Connection handling
wss.on('connection', (ws) => {
  ws.send(
    JSON.stringify({
      type: 'INIT_STATUS',
      payload: {
        isMongoConnected,
        mongoError: mongoError ? mongoError.message : null,
        activeClients: wss.clients.size,
      },
    })
  );
});

// MongoDB Connection Initiator
async function connectToMongo(uri) {
  if (!uri || !uri.trim()) {
    isMongoConnected = false;
    mongoError = new Error('No MongoDB URI configured in environment.');
    return false;
  }

  try {
    console.log(`[MongoDB] Connecting to MongoDB database "${DB_NAME}"...`);
    if (mongoClient) {
      try {
        await mongoClient.close();
      } catch (e) {}
    }

    mongoClient = new MongoClient(uri.trim(), {
      serverSelectionTimeoutMS: 5000,
    });

    await mongoClient.connect();
    db = mongoClient.db(DB_NAME);

    // Ensure Indexes
    const collection = db.collection(COLLECTION_NAME);
    await collection.createIndex({ faculty_group: 1 });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ department: 1 });
    await collection.createIndex({ name: 1 });

    isMongoConnected = true;
    mongoError = null;
    mongoUri = uri.trim();
    console.log(`[MongoDB] Connected successfully!`);

    broadcast({
      type: 'CONFIG_UPDATED',
      payload: { isMongoConnected: true, message: 'MongoDB connection established' },
    });

    return true;
  } catch (err) {
    console.error('[MongoDB] Connection error:', err.message);
    isMongoConnected = false;
    mongoError = err;
    return false;
  }
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// Health & Status check
app.get('/api/health', async (req, res) => {
  let count = 0;
  if (isMongoConnected && db) {
    try {
      count = await db.collection(COLLECTION_NAME).countDocuments();
    } catch (e) {}
  } else {
    count = readLocalStore().length;
  }

  res.json({
    status: 'ok',
    isMongoConnected,
    mongoError: mongoError ? mongoError.message : null,
    mongoUriConfigured: Boolean(mongoUri && mongoUri.trim()),
    activeClients: wss.clients.size,
    recordCount: count,
  });
});

// Update MongoDB URI configuration dynamically
app.post('/api/config/mongo', async (req, res) => {
  const { uri } = req.body;
  if (!uri || !uri.trim()) {
    return res.status(400).json({ error: 'Please provide a valid MongoDB connection string' });
  }

  const success = await connectToMongo(uri);
  if (success) {
    res.json({ success: true, message: 'MongoDB connected successfully!' });
  } else {
    res.status(500).json({
      success: false,
      error: mongoError ? mongoError.message : 'Could not connect to MongoDB',
    });
  }
});

// GET all faculty
app.get('/api/faculty', async (req, res) => {
  try {
    if (isMongoConnected && db) {
      const records = await db
        .collection(COLLECTION_NAME)
        .find({})
        .sort({ faculty_group: 1, name: 1 })
        .toArray();

      const normalized = records.map((doc) => ({
        id: doc._id.toString(),
        name: doc.name,
        designation: doc.designation || '',
        department: doc.department,
        faculty_group: doc.faculty_group,
        status: doc.status || 'Not invited',
        invited_by: doc.invited_by || null,
        invited_at: doc.invited_at || null,
        notes: doc.notes || '',
        created_at: doc.created_at || new Date().toISOString(),
        updated_at: doc.updated_at || new Date().toISOString(),
        updated_by: doc.updated_by || null,
      }));

      writeLocalStore(normalized);
      return res.json(normalized);
    } else {
      const records = readLocalStore();
      return res.json(records);
    }
  } catch (err) {
    console.error('Error fetching faculty:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST single faculty member
app.post('/api/faculty', async (req, res) => {
  try {
    const { name, designation, department, faculty_group, status, invited_by, invited_at, notes, updated_by } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Faculty name is required.' });
    }

    const now = new Date().toISOString();
    const doc = {
      name: name.trim(),
      designation: designation?.trim() || '',
      department: department?.trim() || 'General',
      faculty_group: faculty_group || 'Our Batch Faculty',
      status: status || 'Not invited',
      invited_by: invited_by || null,
      invited_at: invited_at || null,
      notes: notes?.trim() || '',
      created_at: now,
      updated_at: now,
      updated_by: updated_by || invited_by || null,
    };

    let createdRecord = null;

    if (isMongoConnected && db) {
      const result = await db.collection(COLLECTION_NAME).insertOne(doc);
      createdRecord = {
        id: result.insertedId.toString(),
        ...doc,
      };
    } else {
      const records = readLocalStore();
      createdRecord = {
        id: 'loc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        ...doc,
      };
      records.push(createdRecord);
      writeLocalStore(records);
    }

    broadcast({
      type: 'FACULTY_INSERTED',
      payload: createdRecord,
    });

    res.status(201).json(createdRecord);
  } catch (err) {
    console.error('Error inserting faculty:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST batch import faculty records
app.post('/api/faculty/batch', async (req, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'No records provided for batch import.' });
    }

    const now = new Date().toISOString();
    const docs = records.map((r) => ({
      name: r.name.trim(),
      designation: r.designation?.trim() || '',
      department: r.department?.trim() || 'General',
      faculty_group: r.faculty_group || 'Our Batch Faculty',
      status: r.status || 'Not invited',
      invited_by: r.invited_by || null,
      invited_at: r.invited_at || null,
      notes: r.notes?.trim() || '',
      created_at: now,
      updated_at: now,
      updated_by: r.updated_by || r.invited_by || null,
    }));

    let insertedRecords = [];

    if (isMongoConnected && db) {
      const result = await db.collection(COLLECTION_NAME).insertMany(docs);
      insertedRecords = docs.map((d, index) => ({
        id: result.insertedIds[index].toString(),
        ...d,
      }));
    } else {
      const existing = readLocalStore();
      insertedRecords = docs.map((d, index) => ({
        id: 'loc_' + (Date.now() + index) + '_' + Math.random().toString(36).substring(2, 7),
        ...d,
      }));
      existing.push(...insertedRecords);
      writeLocalStore(existing);
    }

    broadcast({
      type: 'FACULTY_BATCH_INSERTED',
      payload: insertedRecords,
    });

    res.status(201).json({ count: insertedRecords.length, records: insertedRecords });
  } catch (err) {
    console.error('Error batch importing faculty:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update single faculty member
app.put('/api/faculty/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.id;
    delete updates._id;
    delete updates.created_at;

    updates.updated_at = new Date().toISOString();

    let updatedRecord = null;

    if (isMongoConnected && db) {
      let queryId;
      try {
        queryId = new ObjectId(id);
      } catch {
        return res.status(400).json({ error: 'Invalid MongoDB ObjectId' });
      }

      const result = await db
        .collection(COLLECTION_NAME)
        .findOneAndUpdate({ _id: queryId }, { $set: updates }, { returnDocument: 'after' });

      if (!result) {
        return res.status(404).json({ error: 'Record not found' });
      }

      updatedRecord = {
        id: result._id.toString(),
        name: result.name,
        designation: result.designation || '',
        department: result.department,
        faculty_group: result.faculty_group,
        status: result.status,
        invited_by: result.invited_by || null,
        invited_at: result.invited_at || null,
        notes: result.notes || '',
        created_at: result.created_at,
        updated_at: result.updated_at,
        updated_by: result.updated_by || null,
      };
    } else {
      const records = readLocalStore();
      const index = records.findIndex((r) => r.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Record not found' });
      }
      records[index] = { ...records[index], ...updates };
      updatedRecord = records[index];
      writeLocalStore(records);
    }

    broadcast({
      type: 'FACULTY_UPDATED',
      payload: updatedRecord,
    });

    res.json(updatedRecord);
  } catch (err) {
    console.error('Error updating faculty:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE single faculty member
app.delete('/api/faculty/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected && db) {
      let queryId;
      try {
        queryId = new ObjectId(id);
      } catch {
        return res.status(400).json({ error: 'Invalid MongoDB ObjectId' });
      }

      const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: queryId });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Record not found' });
      }
    } else {
      const records = readLocalStore();
      const filtered = records.filter((r) => r.id !== id);
      if (filtered.length === records.length) {
        return res.status(404).json({ error: 'Record not found' });
      }
      writeLocalStore(filtered);
    }

    broadcast({
      type: 'FACULTY_DELETED',
      payload: { id },
    });

    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting faculty:', err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// SERVE PRODUCTION FRONTEND UI (Auto-detects public/ or ../frontend/dist)
// -------------------------------------------------------------
const candidateStaticDirs = [
  path.join(__dirname, 'public'),
  path.join(__dirname, 'dist'),
  path.join(__dirname, '..', 'frontend', 'dist'),
];

let staticDir = null;
for (const dir of candidateStaticDirs) {
  if (fs.existsSync(dir)) {
    staticDir = dir;
    break;
  }
}

if (staticDir) {
  console.log(`[Production] Serving static client build from ${staticDir}`);
  app.use(express.static(staticDir));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
      return next();
    }
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

// Connect to MongoDB and start server
async function startServer() {
  if (mongoUri) {
    await connectToMongo(mongoUri);
  }

  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` CBIT Freshers' Faculty Invitation Tracker Running!`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(` Database: ${isMongoConnected ? 'MongoDB (Connected)' : 'Local File Store (Active)'}`);
    console.log(`=======================================================`);
  });
}

startServer();

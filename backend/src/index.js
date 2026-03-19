require('dotenv').config();

const express = require('express');
const cors = require('cors');

const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

/* =========================================================
   🔍 Liveness Probe (Kubernetes)
   ========================================================= */
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

/* =========================================================
   🚦 Readiness Probe (Kubernetes - DB check)
   ========================================================= */
app.get('/ready', async (req, res) => {
  try {
    // Check DB connection
    if (db.query) {
      await db.query('SELECT 1');
    } else if (db.pool) {
      await db.pool.query('SELECT 1');
    }

    res.status(200).send('READY');
  } catch (err) {
    console.error('Readiness check failed:', err);
    res.status(500).send('NOT READY');
  }
});

/* =========================================================
   💙 Your Existing Health API (optional)
   ========================================================= */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Jerney API is vibing ✨' });
});

/* =========================================================
   📦 Routes
   ========================================================= */
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

/* =========================================================
   🚀 Start Server
   ========================================================= */
async function start() {
  try {
    // Initialize DB
    await db.initDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Jerney backend running on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();

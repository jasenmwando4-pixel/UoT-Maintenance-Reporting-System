const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const authController = require('./controllers/authController');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const useMemory = process.env.USE_IN_MEMORY_DB === 'true';

app.use(cors());
app.use(express.json());

// Serve uploaded files from the uploads directory.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount auth and report API routes.
app.use('/auth', authRoutes);
app.use('/reports', reportRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the UoT Maintenance Reporting API' });
});

// Profile endpoint for the current authenticated user.
app.get('/users/me', authMiddleware, authController.getMe);

async function initializeDbMode() {
  // If not using memory mode, require DATABASE_URL.
  if (!process.env.DATABASE_URL && !useMemory) {
    console.error('DATABASE_URL is required when USE_IN_MEMORY_DB is not true.');
    process.exit(1);
  }

  if (useMemory) {
    console.log('Using in-memory database mode. PostgreSQL is not required.');
    return;
  }

  try {
    await pool.query('SELECT 1');
    console.log('Connected to PostgreSQL successfully.');
  } catch (error) {
    console.error('PostgreSQL unavailable; start PostgreSQL and set DATABASE_URL correctly.');
    console.error(error.message);
    process.exit(1);
  }
}

initializeDbMode().then(() => {
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
});

const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool used by the backend when USE_IN_MEMORY_DB is false.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/school_activity',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

module.exports = pool;

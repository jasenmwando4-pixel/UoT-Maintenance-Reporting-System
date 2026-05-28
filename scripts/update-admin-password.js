const pool = require('../config/db');

(async () => {
  try {
    const hash = '$2b$10$WdZ0v8KnA/KFtxzQfI3d2.ZejGJvBGxtkbEIfis.s2ZcbNz.1rRUy';
    const email = 'admin@uot.ac.zm';
    const res = await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hash, email]);
    console.log('rowsUpdated', res.rowCount);
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  } finally {
    pool.end();
  }
})();

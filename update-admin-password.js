const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function ensureAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const client = new Client({
    user: 'postgres',
    password: 'admin123',
    database: 'school_activity',
    host: 'localhost',
    port: 5432,
  });

  await client.connect();

  const email = 'admin@uot.ac.zm';
  const name = 'Admin User';
  const role = 'admin';

  const exists = await client.query('SELECT id FROM users WHERE email = $1', [email]);
  if (exists.rows.length) {
    await client.query(
      'UPDATE users SET name = $1, password = $2, role = $3 WHERE email = $4',
      [name, hashedPassword, role, email]
    );
    console.log('Updated existing admin user:', email);
  } else {
    await client.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
      [name, email, hashedPassword, role]
    );
    console.log('Created admin user:', email);
  }

  const userResult = await client.query('SELECT id, name, email, password, role FROM users WHERE email = $1', [email]);
  const user = userResult.rows[0];
  const valid = await bcrypt.compare('admin123', user.password);
  console.log('Password verified:', valid);
  console.log('Admin account ready. Login with:', email, 'and password: admin123');

  await client.end();
}

ensureAdmin().catch((err) => {
  console.error('Failed to ensure admin user:', err);
  process.exit(1);
});

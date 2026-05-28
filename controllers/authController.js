const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const pool = require('../config/db');
const store = require('../store');
const crypto = require('crypto');

// Secret used to sign JSON Web Tokens (JWT).
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
// When true, the app uses the in-memory store instead of PostgreSQL.
const useMemory = process.env.USE_IN_MEMORY_DB === 'true';

// Create an SMTP transporter only when email settings are configured.
function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Send a password reset email with the generated reset link.
async function sendResetEmail(email, resetUrl) {
  const transporter = createTransporter();
  const message = {
    from: process.env.SMTP_FROM || 'no-reply@accessfull.app',
    to: email,
    subject: 'Accessfull password reset request',
    text: `Use this link to reset your password: ${resetUrl}`,
    html: `<p>Use this link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  };

  // If SMTP is not configured, log the link for development use.
  if (!transporter) {
    console.log('SMTP not configured. Password reset URL:', resetUrl);
    return false;
  }

  await transporter.sendMail(message);
  return true;
}

// Create a JWT token containing basic user info.
function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
}

// Register a new user.
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    if (useMemory) {
      // In-memory user creation path.
      if (store.findUserByEmail(email)) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = store.createUser({ name, email, passwordHash: hashed });
      const token = generateToken(user);
      return res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
    }

    // PostgreSQL registration path.
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const insert = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashed, 'student']
    );
    const user = insert.rows[0];
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Authenticate a user and return a JWT.
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    let user;
    if (useMemory) {
      user = store.findUserByEmail(email);
    } else {
      const userQuery = await pool.query('SELECT id, name, email, password, role FROM users WHERE email = $1', [email]);
      user = userQuery.rows[0];
    }

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// Return the current authenticated user's profile.
exports.getMe = async (req, res) => {
  try {
    if (useMemory) {
      const user = store.findUserById(req.user.id);
      return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    }
    const userQuery = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
    res.json(userQuery.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch profile' });
  }
};

// Handle forgot password requests.
// Generates a reset token and sends a reset link to the user's email.
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  try {
    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset?email=${encodeURIComponent(email)}&token=${token}`;

    if (useMemory) {
      const ok = store.setResetToken(email, token, expires);
      if (!ok) return res.status(404).json({ message: 'User not found' });
      await sendResetEmail(email, resetUrl);
      return res.json({ message: 'Password reset email sent if the address is registered.' });
    }

    const update = await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3 RETURNING id, email',
      [token, expires, email]
    );
    if (!update.rows.length) return res.status(404).json({ message: 'Password reset email sent if the address is registered.' });
    await sendResetEmail(email, resetUrl);
    res.json({ message: 'Password reset email sent if the address is registered.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to generate reset token' });
  }
};

// Handle password reset using token verification.
exports.resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) return res.status(400).json({ message: 'Email, token and newPassword are required' });
  try {
    if (useMemory) {
      const ok = store.verifyResetToken(email, token);
      if (!ok) return res.status(400).json({ message: 'Invalid or expired token' });
      const hashed = await bcrypt.hash(newPassword, 10);
      const user = store.findUserByEmail(email);
      user.password = hashed;
      store.clearResetToken(email);
      return res.json({ message: 'Password reset successful' });
    }

    const userQuery = await pool.query('SELECT id, reset_token, reset_token_expires FROM users WHERE email = $1', [email]);
    const user = userQuery.rows[0];
    if (!user || !user.reset_token) return res.status(400).json({ message: 'Invalid or expired token' });
    if (user.reset_token !== token) return res.status(400).json({ message: 'Invalid or expired token' });
    if (!user.reset_token_expires || new Date() > new Date(user.reset_token_expires)) return res.status(400).json({ message: 'Invalid or expired token' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE email = $2', [hashed, email]);
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to reset password' });
  }
};

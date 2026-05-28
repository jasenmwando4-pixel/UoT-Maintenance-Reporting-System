const bcrypt = require('bcrypt');

// In-memory data structures used only when USE_IN_MEMORY_DB=true.
// Useful for local development without PostgreSQL.
const users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@uot.ac.zm',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    created_at: new Date(),
    reset_token: null,
    reset_token_expires: null,
  },
];

const reports = [];
let nextUserId = 2;
let nextReportId = 1;

function findUserByEmail(email) {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function findUserById(id) {
  return users.find((user) => user.id === Number(id));
}

function createUser({ name, email, passwordHash, role = 'student' }) {
  const user = {
    id: nextUserId++,
    name,
    email,
    password: passwordHash,
    role,
    created_at: new Date(),
    reset_token: null,
    reset_token_expires: null,
  };
  users.push(user);
  return user;
}

function setResetToken(email, token, expires) {
  const user = findUserByEmail(email);
  if (!user) return false;
  user.reset_token = token;
  user.reset_token_expires = expires;
  return true;
}

function verifyResetToken(email, token) {
  const user = findUserByEmail(email);
  if (!user || !user.reset_token) return false;
  if (user.reset_token !== token) return false;
  if (!user.reset_token_expires) return false;
  if (new Date() > new Date(user.reset_token_expires)) return false;
  return true;
}

function clearResetToken(email) {
  const user = findUserByEmail(email);
  if (!user) return false;
  user.reset_token = null;
  user.reset_token_expires = null;
  return true;
}

function getReportsByUser(userId) {
  return reports
    .filter((report) => report.user_id === Number(userId))
    .map((report) => ({
      ...report,
      reporter_name: findUserById(report.user_id)?.name || 'Unknown',
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function getAllReports() {
  return reports
    .map((report) => ({
      ...report,
      reporter_name: findUserById(report.user_id)?.name || 'Unknown',
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function getReportById(reportId) {
  return reports.find((report) => report.id === Number(reportId));
}

function updateReport(reportId, fields) {
  const report = getReportById(reportId);
  if (!report) return null;
  Object.assign(report, fields);
  return report;
}

function deleteReport(reportId) {
  const index = reports.findIndex((report) => report.id === Number(reportId));
  if (index === -1) return false;
  reports.splice(index, 1);
  return true;
}

function createReport({ title, description, location, image_url = null, user_id }) {
  const report = {
    id: nextReportId++,
    title,
    description,
    location,
    status: 'Pending',
    image_url,
    user_id: Number(user_id),
    created_at: new Date(),
  };
  reports.push(report);
  return {
    ...report,
    reporter_name: findUserById(report.user_id)?.name || 'Unknown',
  };
}

module.exports = {
  users,
  reports,
  findUserByEmail,
  findUserById,
  createUser,
  getReportsByUser,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  createReport,
};

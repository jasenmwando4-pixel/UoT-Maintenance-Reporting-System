const pool = require('../config/db');
const store = require('../store');

// Toggle between in-memory storage and PostgreSQL database.
// In-memory storage is useful for local development or when the DB is unavailable.
const useMemory = process.env.USE_IN_MEMORY_DB === 'true';

// Get all reports for the current user.
// Admins receive all reports, normal users receive only their own.
exports.getReports = async (req, res) => {
  try {
    if (useMemory) {
      const rows = req.user.role === 'admin' ? store.getAllReports() : store.getReportsByUser(req.user.id);
      return res.json(rows);
    }

    // Build the SQL query. If the user is not admin, restrict results to their own reports.
    let query = 'SELECT r.*, u.name AS reporter_name FROM reports r JOIN users u ON r.user_id = u.id';
    const params = [];
    if (req.user.role !== 'admin') {
      query += ' WHERE r.user_id = $1';
      params.push(req.user.id);
    }
    query += ' ORDER BY r.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load reports' });
  }
};

// Create a new maintenance report.
exports.createReport = async (req, res) => {
  const { title, description, location } = req.body;

  // Validate required fields.
  if (!title || !description || !location) {
    return res.status(400).json({ message: 'Title, description, and location are required' });
  }

  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    if (useMemory) {
      const report = store.createReport({ title, description, location, image_url: imageUrl, user_id: req.user.id });
      return res.status(201).json(report);
    }

    const insert = await pool.query(
      'INSERT INTO reports (title, description, location, status, image_url, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, location, 'Pending', imageUrl, req.user.id]
    );

    // Return the newly created report.
    res.status(201).json(insert.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to create report' });
  }
};

// Get a single report by ID.
exports.getReportById = async (req, res) => {
  const reportId = Number(req.params.id);
  try {
    if (useMemory) {
      const report = store.getReportById(reportId);
      if (!report) return res.status(404).json({ message: 'Report not found' });

      // Only the report owner or an admin can read this report.
      if (req.user.role !== 'admin' && report.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      return res.json({ ...report, reporter_name: store.findUserById(report.user_id)?.name || 'Unknown' });
    }

    const result = await pool.query(
      'SELECT r.*, u.name AS reporter_name FROM reports r JOIN users u ON r.user_id = u.id WHERE r.id = $1',
      [reportId]
    );
    const report = result.rows[0];
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (req.user.role !== 'admin' && report.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load report' });
  }
};

// Update an existing report.
// Both admins and owners can update a report, but ownership is enforced for normal users.
exports.updateReport = async (req, res) => {
  const reportId = Number(req.params.id);
  const { title, description, location, status } = req.body;

  try {
    if (useMemory) {
      const report = store.getReportById(reportId);
      if (!report) return res.status(404).json({ message: 'Report not found' });
      if (req.user.role !== 'admin' && report.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const imageUrl = req.file ? `/uploads/${req.file.filename}` : report.image_url;
      const updated = store.updateReport(reportId, {
        title: title || report.title,
        description: description || report.description,
        location: location || report.location,
        status: status || report.status,
        image_url: imageUrl,
      });
      return res.json({ ...updated, reporter_name: store.findUserById(updated.user_id)?.name || 'Unknown' });
    }

    const reportQuery = await pool.query('SELECT * FROM reports WHERE id = $1', [reportId]);
    const report = reportQuery.rows[0];
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (req.user.role !== 'admin' && report.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : report.image_url;
    const updated = await pool.query(
      'UPDATE reports SET title = $1, description = $2, location = $3, status = $4, image_url = $5 WHERE id = $6 RETURNING *',
      [title || report.title, description || report.description, location || report.location, status || report.status, imageUrl, reportId]
    );
    res.json(updated.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to update report' });
  }
};

// Delete a report by ID. Admins can delete any report, regular users can only delete their own.
exports.deleteReport = async (req, res) => {
  const reportId = Number(req.params.id);
  try {
    if (useMemory) {
      const report = store.getReportById(reportId);
      if (!report) return res.status(404).json({ message: 'Report not found' });
      if (req.user.role !== 'admin' && report.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      store.deleteReport(reportId);
      return res.json({ message: 'Report deleted successfully' });
    }

    const reportQuery = await pool.query('SELECT * FROM reports WHERE id = $1', [reportId]);
    const report = reportQuery.rows[0];
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (req.user.role !== 'admin' && report.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await pool.query('DELETE FROM reports WHERE id = $1', [reportId]);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to delete report' });
  }
};

const express = require('express');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// All report routes require authentication.
router.use(authMiddleware);

// List reports for the current user or admin.
router.get('/', reportController.getReports);

// Create a new report. Supports optional image upload.
router.post('/', upload.single('image'), reportController.createReport);

// Read a single report by ID.
router.get('/:id', reportController.getReportById);

// Update a report by ID. Supports optional new image upload.
router.put('/:id', upload.single('image'), reportController.updateReport);

// Delete a report by ID.
router.delete('/:id', reportController.deleteReport);

module.exports = router;

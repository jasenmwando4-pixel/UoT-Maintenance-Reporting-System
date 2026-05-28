const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Authentication routes for registration, login, and password reset.
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot', authController.forgotPassword);
router.post('/reset', authController.resetPassword);

module.exports = router;

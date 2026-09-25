// routes/generate.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth'); // Import CORRECT
const { generatePDF } = require('../controllers/generateController');

// Route protégée par authentification
router.post('/pdf', authenticateToken, generatePDF);

module.exports = router;
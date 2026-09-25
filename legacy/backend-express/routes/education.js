// routes/education.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth'); // Import CORRECT
const {
  getEducations,
  createEducation,
  updateEducation,
  deleteEducation
} = require('../controllers/educationController');

// Toutes les routes sont protégées par authentification
router.get('/:userId', authenticateToken, getEducations);
router.post('/', authenticateToken, createEducation);
router.put('/:id', authenticateToken, updateEducation);
router.delete('/:id', authenticateToken, deleteEducation);

module.exports = router;
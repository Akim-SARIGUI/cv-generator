// routes/experience.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth'); // Import CORRECT
const {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience
} = require('../controllers/experienceController');

// Toutes les routes sont protégées par authentification
router.get('/:userId', authenticateToken, getExperiences);
router.post('/', authenticateToken, createExperience);
router.put('/:id', authenticateToken, updateExperience);
router.delete('/:id', authenticateToken, deleteExperience);

module.exports = router;
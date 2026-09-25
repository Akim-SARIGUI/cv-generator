// routes/skill.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth'); // Import CORRECT
const {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill
} = require('../controllers/skillController');

// Toutes les routes sont protégées par authentification
router.get('/:userId', authenticateToken, getSkills);
router.post('/', authenticateToken, createSkill);
router.put('/:id', authenticateToken, updateSkill);
router.delete('/:id', authenticateToken, deleteSkill);

module.exports = router;
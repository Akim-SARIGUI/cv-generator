// routes/personal.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth'); // Import CORRECT
const {
  getPersonalInfo,
  createPersonalInfo,
  updatePersonalInfo,
  deletePersonalInfo
} = require('../controllers/personalController');

// Toutes les routes sont protégées par authentification
router.get('/:userId', authenticateToken, getPersonalInfo);
router.post('/', authenticateToken, createPersonalInfo);
router.put('/:id', authenticateToken, updatePersonalInfo);
router.delete('/:id', authenticateToken, deletePersonalInfo);

module.exports = router;
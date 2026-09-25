// controllers/personalController.js
const Personal = require('../models/Personal');

exports.getPersonalInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const personalInfo = await Personal.findByUserId(userId);
    res.json(personalInfo);
  } catch (error) {
    console.error('Error fetching personal info:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createPersonalInfo = async (req, res) => {
  try {
    const personalInfo = await Personal.create(req.body);
    res.status(201).json(personalInfo);
  } catch (error) {
    console.error('Error creating personal info:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updatePersonalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const personalInfo = await Personal.update(id, req.body);
    res.json(personalInfo);
  } catch (error) {
    console.error('Error updating personal info:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deletePersonalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Personal.delete(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting personal info:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
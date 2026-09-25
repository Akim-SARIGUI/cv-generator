// controllers/experienceController.js
const Experience = require('../models/Experience');

exports.getExperiences = async (req, res) => {
  try {
    const { userId } = req.params;
    const experiences = await Experience.findByUserId(userId);
    res.json(experiences);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createExperience = async (req, res) => {
  try {
    const experience = await Experience.create(req.body);
    res.status(201).json(experience);
  } catch (error) {
    console.error('Error creating experience:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const experience = await Experience.update(id, req.body);
    res.json(experience);
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Experience.delete(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
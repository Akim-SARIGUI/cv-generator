// controllers/educationController.js
const Education = require('../models/Education');

exports.getEducations = async (req, res) => {
  try {
    const { userId } = req.params;
    const educations = await Education.findByUserId(userId);
    res.json(educations);
  } catch (error) {
    console.error('Error fetching educations:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createEducation = async (req, res) => {
  try {
    const education = await Education.create(req.body);
    res.status(201).json(education);
  } catch (error) {
    console.error('Error creating education:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const education = await Education.update(id, req.body);
    res.json(education);
  } catch (error) {
    console.error('Error updating education:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Education.delete(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting education:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
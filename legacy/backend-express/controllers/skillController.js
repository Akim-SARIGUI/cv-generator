// controllers/skillController.js
const Skill = require('../models/Skill');

exports.getSkills = async (req, res) => {
  try {
    const { userId } = req.params;
    const skills = await Skill.findByUserId(userId);
    res.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createSkill = async (req, res) => {
  try {
    const skill = await Skill.create(req.body);
    res.status(201).json(skill);
  } catch (error) {
    console.error('Error creating skill:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Skill.update(id, req.body);
    res.json(skill);
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Skill.delete(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
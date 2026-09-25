// models/Skill.js
const { pool } = require('../config/database'); // Import CORRECT

class Skill {
  static async findByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM skills WHERE user_id = $1 ORDER BY category, skill_name',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error in Skill.findByUserId:', error);
      throw error;
    }
  }

  static async create(skillData) {
    try {
      const {
        user_id,
        skill_name,
        category,
        proficiency
      } = skillData;

      const result = await pool.query(
        `INSERT INTO skills 
         (user_id, skill_name, category, proficiency) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [user_id, skill_name, category, proficiency]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error in Skill.create:', error);
      throw error;
    }
  }

  static async update(id, skillData) {
    try {
      const {
        skill_name,
        category,
        proficiency
      } = skillData;

      const result = await pool.query(
        `UPDATE skills SET 
         skill_name = $1, category = $2, proficiency = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 RETURNING *`,
        [skill_name, category, proficiency, id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error in Skill.update:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await pool.query('DELETE FROM skills WHERE id = $1', [id]);
      return { message: 'Skill deleted successfully' };
    } catch (error) {
      console.error('Error in Skill.delete:', error);
      throw error;
    }
  }
}

module.exports = Skill;
// models/Education.js
const { pool } = require('../config/database'); // Import CORRECT

class Education {
  static async findByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM educations WHERE user_id = $1 ORDER BY start_date DESC',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error in Education.findByUserId:', error);
      throw error;
    }
  }

  static async create(educationData) {
    try {
      const {
        user_id,
        degree,
        institution,
        location,
        start_date,
        end_date,
        current_education,
        description
      } = educationData;

      const result = await pool.query(
        `INSERT INTO educations 
         (user_id, degree, institution, location, start_date, end_date, current_education, description) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [user_id, degree, institution, location, start_date, end_date, current_education, description]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error in Education.create:', error);
      throw error;
    }
  }

  static async update(id, educationData) {
    try {
      const {
        degree,
        institution,
        location,
        start_date,
        end_date,
        current_education,
        description
      } = educationData;

      const result = await pool.query(
        `UPDATE educations SET 
         degree = $1, institution = $2, location = $3, start_date = $4, 
         end_date = $5, current_education = $6, description = $7, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 RETURNING *`,
        [degree, institution, location, start_date, end_date, current_education, description, id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error in Education.update:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await pool.query('DELETE FROM educations WHERE id = $1', [id]);
      return { message: 'Education deleted successfully' };
    } catch (error) {
      console.error('Error in Education.delete:', error);
      throw error;
    }
  }
}

module.exports = Education;
// models/Experience.js
const { pool } = require('../config/database'); // Import CORRECT

class Experience {
  static async findByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM experiences WHERE user_id = $1 ORDER BY start_date DESC',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error in Experience.findByUserId:', error);
      throw error;
    }
  }

  static async create(experienceData) {
    try {
      const {
        user_id,
        job_title,
        company,
        location,
        start_date,
        end_date,
        current_job,
        description
      } = experienceData;

      const result = await pool.query(
        `INSERT INTO experiences 
         (user_id, job_title, company, location, start_date, end_date, current_job, description) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [user_id, job_title, company, location, start_date, end_date, current_job, description]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error in Experience.create:', error);
      throw error;
    }
  }

  static async update(id, experienceData) {
    try {
      const {
        job_title,
        company,
        location,
        start_date,
        end_date,
        current_job,
        description
      } = experienceData;

      const result = await pool.query(
        `UPDATE experiences SET 
         job_title = $1, company = $2, location = $3, start_date = $4, 
         end_date = $5, current_job = $6, description = $7, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 RETURNING *`,
        [job_title, company, location, start_date, end_date, current_job, description, id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error in Experience.update:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await pool.query('DELETE FROM experiences WHERE id = $1', [id]);
      return { message: 'Experience deleted successfully' };
    } catch (error) {
      console.error('Error in Experience.delete:', error);
      throw error;
    }
  }
}

module.exports = Experience;
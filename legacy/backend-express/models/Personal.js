// models/Personal.js
const { pool } = require('../config/database'); // Import CORRECT

class Personal {
  static async findByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM personal_infos WHERE user_id = $1',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error in Personal.findByUserId:', error);
      throw error;
    }
  }

  static async create(personalData) {
    try {
      const {
        user_id,
        full_name,
        email,
        phone,
        address,
        linkedin_url,
        github_url,
        summary
      } = personalData;

      const result = await pool.query(
        `INSERT INTO personal_infos 
         (user_id, full_name, email, phone, address, linkedin_url, github_url, summary) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [user_id, full_name, email, phone, address, linkedin_url, github_url, summary]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error in Personal.create:', error);
      throw error;
    }
  }

  static async update(id, personalData) {
    try {
      const {
        full_name,
        email,
        phone,
        address,
        linkedin_url,
        github_url,
        summary
      } = personalData;

      const result = await pool.query(
        `UPDATE personal_infos SET 
         full_name = $1, email = $2, phone = $3, address = $4, 
         linkedin_url = $5, github_url = $6, summary = $7, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 RETURNING *`,
        [full_name, email, phone, address, linkedin_url, github_url, summary, id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error in Personal.update:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await pool.query('DELETE FROM personal_infos WHERE id = $1', [id]);
      return { message: 'Personal info deleted successfully' };
    } catch (error) {
      console.error('Error in Personal.delete:', error);
      throw error;
    }
  }
}

module.exports = Personal;
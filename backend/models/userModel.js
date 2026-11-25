import pool from "../config/db.js";

const UserModel = {
  async getAll() {
    const [results] = await pool.query('SELECT id, name, email, role, created_at FROM users');
    return results;
  },

  async getById(id) {
    const [results] = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
    return results[0];
  },

  async getByEmail(email) {
    const [results] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return results[0];
  },

  async create(user) {
    const { name, email, password, role = 'user' } = user;
    const [results] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return { id: results.insertId, name, email, role };
  },

  async updateRefreshToken(id, refreshToken) {
    const [results] = await pool.query(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, id]
    );
    return results.affectedRows > 0;
  },

  async getByRefreshToken(refreshToken) {
    const [results] = await pool.query(
      'SELECT * FROM users WHERE refresh_token = ?',
      [refreshToken]
    );
    return results[0];
  }
};

export default UserModel;

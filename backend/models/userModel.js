import pool from "../config/db.js";

const UserModel = {
  async getAll() {
    const [results] = await pool.query('SELECT id, name, email, role, lastlogin FROM users');
    return results;
  },

  async getById(id) {
    const [results] = await pool.query('SELECT id, name, email, role, lastlogin FROM users WHERE id = ?', [id]);
    return results[0];
  },

  async getByEmail(email) {
    const [results] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return results[0];
  },

  async updateLastLogin(id) {
    const [results] = await pool.query('UPDATE users SET lastlogin = NOW() WHERE id = ?', [id]);
    return results.affectedRows > 0;
  },

  async create(user) {
    const { name, email, password, role = 'user' } = user;
    const [results] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return { id: results.insertId, name, email, role };
  }
};

export default UserModel;

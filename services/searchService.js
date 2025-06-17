const pool = require('../models/db');

async function searchRecipes(keyword) {
  const q = `%${keyword}%`;
  const [rows] = await pool.query(
    `SELECT id, title, image_url
       FROM recipe
      WHERE title LIKE ?
      ORDER BY created_at DESC`,
    [q]
  );
  return rows.map(r => ({
    id:        r.id,
    title:     r.title,
    image_url: r.image_url || ''
  }));
}

module.exports = { searchRecipes };

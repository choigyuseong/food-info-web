const pool = require('../models/db');

exports.searchPage = async (req, res, next) => {
  try {
    const keyword = `%${req.query.q}%`;
    const [recipes] = await pool.query(
      `SELECT id, title, image_url
         FROM recipe
        WHERE title LIKE ?
        ORDER BY created_at DESC`,
      [keyword]
    );
    res.render('search', { recipes, query: req.query.q });
  } catch (err) {
    next(err);
  }
};

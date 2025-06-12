// controllers/recipeController.js
const pool = require('../models/db');

exports.mainPage = async (req, res, next) => {
    try {
        const [recipes] = await pool.query(
            'SELECT id, title, image_url FROM recipe ORDER BY created_at DESC LIMIT 8'
        );
        res.render('index', { recipes });
    } catch (err) {
        next(err);
    }
};

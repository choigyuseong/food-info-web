const pool = require('../models/db');
const { fetchApiRecipesByName } = require('./recipeService');

async function searchRecipes(keyword = '', page = 1, pageSize = 8) {
    const q = `%${keyword}%`;

    // 1) DB 검색
    const [rows] = await pool.query(
        `SELECT id, title, image_url
       FROM recipe
      WHERE title LIKE ?
      ORDER BY created_at DESC`,
        [q]
    );
    const dbResults = rows.map(r => ({
        id:        r.id,
        title:     r.title,
        image_url: r.image_url || ''
    }));

    // 2) API 검색
    const apiResults = await fetchApiRecipesByName(keyword);

    // 3) 둘 합치고 페이징
    const allResults = dbResults.concat(apiResults);
    const totalPages = Math.ceil(allResults.length / pageSize);
    const start      = (page - 1) * pageSize;
    const recipes    = allResults.slice(start, start + pageSize);

    return { recipes, page, totalPages };
}

module.exports = { searchRecipes };

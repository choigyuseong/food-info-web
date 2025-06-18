const pool = require('../models/db');
const { fetchApiRecipesByName } = require('./recipeService');

async function searchRecipes(keyword) {
  const q = `%${keyword}%`;

    // 1) 로컬 DB 검색
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

    // 2) 외부 API 검색
    const apiResults = await fetchApiRecipesByName(keyword);

    // 3) 둘 합치기
    return dbResults.concat(apiResults);
}

module.exports = { searchRecipes };
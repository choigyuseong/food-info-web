const pool = require('../models/db');
const {fetchApiRecipesByName} = require('./recipeService');

async function searchRecipesWithPaging({
                                           keyword = '',
                                           page = 1,
                                           pageSize = 8,
                                           blockSize = 10
                                       } = {}) {
    const q = `%${keyword}%`;
    const [rows] = await pool.query(
        `SELECT id, title, image_url
         FROM recipe
         WHERE title LIKE ?
         ORDER BY created_at DESC`,
        [q]
    );
    const dbResults = rows.map(r => ({
        id: r.id,
        title: r.title,
        image_url: r.image_url || ''
    }));

    const apiAll = await fetchApiRecipesByName(keyword, {start: 1, end: 1000});

    const allResults = dbResults.concat(apiAll);
    const totalPages = Math.ceil(allResults.length / pageSize);
    const startIdx = (page - 1) * pageSize;
    const recipes = allResults.slice(startIdx, startIdx + pageSize);

    const currentBlock = Math.ceil(page / blockSize);
    const startPage = (currentBlock - 1) * blockSize + 1;
    const endPage = Math.min(currentBlock * blockSize, totalPages);
    const hasPrevBlock = startPage > 1;
    const hasNextBlock = endPage < totalPages;

    return {
        recipes,
        query: keyword,
        page,
        totalPages,
        startPage,
        endPage,
        hasPrevBlock,
        hasNextBlock
    };
}

module.exports = {searchRecipesWithPaging};

const { searchRecipes } = require('../services/searchService');

exports.searchPage = async (req, res, next) => {
    try {
        const query    = req.query.q || '';
        const page     = parseInt(req.query.page, 10) || 1;
        const pageSize = 8;

        const { recipes, page: currentPage, totalPages } =
            await searchRecipes(query, page, pageSize);

        res.render('search', {
            recipes,
            query,
            page: currentPage,
            totalPages
        });
    } catch (err) {
        next(err);
    }
};

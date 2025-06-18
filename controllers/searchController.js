const {searchRecipesWithPaging} = require('../services/searchService');

// 검색 페이지
exports.searchPage = async (req, res, next) => {
    try {
        const query = req.query.q || '';
        const page = parseInt(req.query.page, 10) || 1;
        const pagingData = await searchRecipesWithPaging({
            keyword: query,
            page
        });

        res.render('search', pagingData);
    } catch (err) {
        next(err);
    }
};

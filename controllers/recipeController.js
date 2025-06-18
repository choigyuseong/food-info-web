const {listRecipes, getRecipe, createRecipe} = require('../services/recipeService');

// 메인 페이지
exports.mainPage = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = 8;
        const {recipes, page: currentPage, totalPages} = await listRecipes({page, pageSize});
        res.render('index', {recipes, page: currentPage, totalPages});
    } catch (err) {
        next(err);
    }
};

// 상세 페이지
exports.detailPage = async (req, res, next) => {
    try {
        const id = req.params.id;
        const recipe = await getRecipe(id);
        if (!recipe) {
            return res.status(404).send('레시피를 찾을 수 없습니다.');
        }
        res.render('detail', {recipe});
    } catch (err) {
        next(err);
    }
};

// 등록 페이지
exports.showCreateForm = (req, res) => {
    res.render('create');
};

// 등록 처리
exports.createRecipe = async (req, res, next) => {
    try {
        await createRecipe(req.body);
        res.redirect('/');
    } catch (err) {
        next(err);
    }
};

const {listRecipesWithPaging, getRecipe, createRecipe, fetchRecommendedRecipes} = require('../services/recipeService');

// 메인 페이지
exports.mainPage = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const pagingData = await listRecipesWithPaging({page});
        res.render('index', pagingData);
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

// 추천 페이지
exports.recommendPage = async (req, res, next) => {
    try {
        // 4개 랜덤으로 추천
        const recipes = await fetchRecommendedRecipes(4);
        res.render('recommend', { recipes, title: '오늘의 요리 추천' });
    } catch (err) {
        next(err);
    }
};
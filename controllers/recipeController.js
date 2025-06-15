const pool  = require('../models/db');
const {
    fetchDbRecipes,
    fetchApiRecipes,
    fetchDbRecipeDetail,
    fetchApiRecipeDetail,
    createRecipe
} = require('../services/recipeService');

// 메인 페이지
exports.mainPage = async (req, res, next) => {
    try {
        const dbRecipes  = await fetchDbRecipes();
        const apiRecipes = await fetchApiRecipes();
        res.render('index', { recipes: dbRecipes.concat(apiRecipes) });
    } catch (err) {
        next(err);
    }
};

// 상세 페이지
exports.detailPage = async (req, res, next) => {
    try {
        const id = req.params.id;
        let recipe = await fetchDbRecipeDetail(id);
        if (!recipe) {
            recipe = await fetchApiRecipeDetail(id);
            if (!recipe) return res.status(404).send('레시피를 찾을 수 없습니다.');
        }
        res.render('detail', { recipe });
    } catch (err) {
        next(err);
    }
};

// 등록 폼
exports.showCreateForm = (req, res) => res.render('create');

// 등록 처리
exports.createRecipe = async (req, res, next) => {
    try {
        const { title, image_url, ingredients, instructions } = req.body;
        await createRecipe({ title, image_url, ingredients, instructions });
        res.redirect('/');
    } catch (err) {
        next(err);
    }
};

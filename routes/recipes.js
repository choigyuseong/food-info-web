const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/recipeController');
const {requireLogin} = require('../middlewares/auth');

router.get('/', ctrl.mainPage);

// GET 등록 폼
router.get('/recipes/create', requireLogin, ctrl.showCreateForm);

// 상세 조회
router.get('/recipes/:id', ctrl.detailPage);

// POST 등록 처리
router.post('/recipes/create', requireLogin, ctrl.createRecipe);

router.get('/recommend', ctrl.recommendPage);

module.exports = router;
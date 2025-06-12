// routes/recipes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/recipeController');

router.get('/', ctrl.mainPage);
module.exports = router;

const { searchRecipes } = require('../services/searchService');

exports.searchPage = async (req, res, next) => {
  try {
    const query   = req.query.q;
    const recipes = await searchRecipes(query);
    res.render('search', { recipes, query });
  } catch (err) {
    next(err);
  }
};
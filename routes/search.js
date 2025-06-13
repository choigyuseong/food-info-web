const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/searchController');

router.get('/search', ctrl.searchPage);

module.exports = router;
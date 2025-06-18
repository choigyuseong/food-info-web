const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');

router.get('/signup', ctrl.showSignupForm);
router.post('/signup', ctrl.signup);

router.get('/login', ctrl.showLoginForm);
router.post('/login', ctrl.login);

router.post('/logout', ctrl.logout);

module.exports = router;

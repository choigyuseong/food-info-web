const { createUser, login: loginService } = require('../services/authService');

// 회원가입 폼
exports.showSignupForm = (req, res) => {
    res.render('signup', { error: null });
};

// 회원가입 처리
exports.signup = async (req, res, next) => {
    try {
        await createUser(req.body);
        res.redirect('/login');
    } catch (err) {
        res.render('signup', { error: err.message });
    }
};

// 로그인 폼
exports.showLoginForm = (req, res) => {
    res.render('login', { error: null });
};

// 로그인 처리
exports.login = async (req, res, next) => {
    try {
        const user = await loginService(req.body);
        // 세션에 사용자 정보 저장
        req.session.userId   = user.id;
        req.session.username = user.username;
        res.redirect('/');
    } catch (err) {
        res.render('login', { error: err.message });
    }
};

// 로그아웃
exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) return next(err);
        res.redirect('/');
    });
};

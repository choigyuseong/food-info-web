const pool = require('../models/db');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

// 존재하는 User 인지 확인
async function findUserByUsername(username) {
    const [[user]] = await pool.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
    );
    return user || null;
}

// 회원가입
async function createUser({ username, password, passwordConfirm }) {
    if (!username || !password || password !== passwordConfirm) {
        const err = new Error('입력값을 확인하세요.');
        err.code = 'INVALID_INPUT';
        throw err;
    }

    if (await findUserByUsername(username)) {
        const err = new Error('이미 사용 중인 아이디입니다.');
        err.code = 'DUPLICATE_USER';
        throw err;
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await pool.query(
        'INSERT INTO users (username, password_hash) VALUES (?, ?)',
        [username, hash]
    );
    return result.insertId;
}

// 로그인 인증
async function login({ username, password }) {
    if (!username || !password) {
        const err = new Error('아이디와 비밀번호를 모두 입력하세요.');
        err.code = 'INVALID_INPUT';
        throw err;
    }

    const user = await findUserByUsername(username);
    if (!user) {
        const err = new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
        err.code = 'INVALID_CREDENTIALS';
        throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        const err = new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
        err.code = 'INVALID_CREDENTIALS';
        throw err;
    }

    return user.id;
}

module.exports = {
    createUser,
    login,
    findUserByUsername,   // 필요하다면 외부에서도 참조 가능
};
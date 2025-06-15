// app.js
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
require('dotenv').config();

const app = express();

// 뷰 엔진 & 레이아웃 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');   // views/layout.ejs 를 기본 레이아웃으로

// 정적 파일, 바디파서 등 기존 설정
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));

// 라우터
app.use('/', require('./routes/recipes'));
app.use('/search', require('./routes/search'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`🍽 Server running at http://localhost:${PORT}`)
);

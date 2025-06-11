require('dotenv').config();
const express = require('express');
const path = require('path');

const indexRouter   = require('./routes/index');
const recipesRouter = require('./routes/recipes');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 라우터 연결
app.use('/', indexRouter);
app.use('/recipes', recipesRouter);

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

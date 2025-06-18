const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'somesecret',
    resave: false,
    saveUninitialized: false
}));

const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const searchRoutes = require('./routes/search');

app.use('/', authRoutes);
app.use('/', recipeRoutes);
app.use('/search', searchRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`🍽 Server running at http://localhost:${PORT}`)
);

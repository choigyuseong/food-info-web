const express = require('express');
const path    = require('path');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index', { recipes: [] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`🍽  Server running at http://localhost:${PORT}`)
);

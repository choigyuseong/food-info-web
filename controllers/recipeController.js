const axios = require('axios');
const pool  = require('../models/db');
require('dotenv').config();

exports.mainPage = async (req, res, next) => {
    try {
        // 1) 로컬 DB에서 레시피 조회
        const [dbRows] = await pool.query(
            'SELECT id, title, image_url FROM recipe ORDER BY created_at DESC'
        );

        let recipes = dbRows.map(r => ({
            id:        r.id,
            title:     r.title,
            image_url: r.image_url || ''
        }));

        // 2) 외부 API에서 추가 데이터 가져오기 (옵션)
        //    예: DB에 데이터가 없을 때만 가져오려면 if(dbRows.length===0)으로 분기
        const key = process.env.FOOD_API_KEY;
        const url = `https://openapi.foodsafetykorea.go.kr/api/${key}/COOKRCP01/json/1/8`;
        const { data } = await axios.get(url);
        const apiRows = data.COOKRCP01.row.map(r => ({
            id:        r.RCP_SEQ,
            title:     r.RCP_NM,
            image_url: r.ATT_FILE_NO_MAIN || ''
        }));

        // 3) DB + API 데이터를 합쳐서, DB 쪽이 앞에 오도록
        recipes = recipes.concat(apiRows);

        // 4) 렌더링
        res.render('index', { recipes });
    } catch (err) {
        next(err);
    }
};

// 등록 폼 렌더
exports.showCreateForm = (req, res) => {
    res.render('create');
};

// 폼 데이터 받아서 DB에 저장
exports.createRecipe = async (req, res, next) => {
    try {
        const { title, image_url } = req.body;
        await pool.query(
            'INSERT INTO recipe (title, image_url) VALUES (?, ?)',
            [title, image_url]
        );
        // 저장 후 메인 페이지로 리다이렉트
        res.redirect('/');
    } catch (err) {
        next(err);
    }
};

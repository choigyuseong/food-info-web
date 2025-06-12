const axios = require('axios');
require('dotenv').config();

exports.mainPage = async (req, res, next) => {
    try {
        const key  = process.env.FOOD_API_KEY;
        const url  = `https://openapi.foodsafetykorea.go.kr/api/${key}/COOKRCP01/json/1/8`;
        const { data } = await axios.get(url);

        const rows = data.COOKRCP01.row;
        const recipes = rows.map(r => ({
            id:        r.RCP_SEQ,                // 레시피 고유번호
            title:     r.RCP_NM,                 // 레시피 이름
            image_url: r.ATT_FILE_NO_MAIN || '', // 대표 이미지 URL
        }));

        res.render('index', { recipes });
    } catch (err) {
        next(err);
    }
};

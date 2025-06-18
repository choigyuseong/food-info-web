const pool = require('../models/db');
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.FOOD_API_KEY;
const API_BASE = `https://openapi.foodsafetykorea.go.kr/api/${API_KEY}/COOKRCP01/json`;

// 로컬 DB에서 레시피 목록을 가져오기
async function fetchDbRecipes() {
    const [rows] = await pool.query(
        'SELECT id, title, image_url FROM recipe ORDER BY created_at DESC'
    );
    return rows.map(r => ({
        id: r.id,
        title: r.title,
        image_url: r.image_url || ''
    }));
}

// 외부 API에서 레시피 목록을 가져오기 (start–end 범위 지정 가능)
async function fetchApiRecipes(limit = {start: 1, end: 8}) {
    const url = `${API_BASE}/${limit.start}/${limit.end}`;
    const {data} = await axios.get(url);
    return (data.COOKRCP01.row || []).map(r => ({
        id: r.RCP_SEQ,
        title: r.RCP_NM,
        image_url: r.ATT_FILE_NO_MAIN || ''
    }));
}

// 로컬 DB에서 레시피 디테일 가져오기
async function fetchDbRecipeDetail(id) {
    const [[row]] = await pool.query(
        'SELECT * FROM recipe WHERE id = ?',
        [id]
    );
    return row || null;
}

// 외부 API에서 레시피 디테일 가져오기
async function fetchApiRecipeDetail(id) {
    // 1~1000 범위 중 RCP_SEQ=id인 결과만 URL 경로에 붙여 요청
    const url = `${API_BASE}/1/1000/RCP_SEQ=${id}`;
    const {data} = await axios.get(url);

    // API가 준 배열
    const apiRows = data.COOKRCP01?.row || [];
    // id와 정확히 일치하는 행을 찾습니다
    const matched = apiRows.find(r => String(r.RCP_SEQ) === String(id));
    if (!matched) return null;

    // 이제 matched를 기반으로 나머지 매핑
    const ingredients = matched.RCP_PARTS_DTLS || '';

    const steps = [];
    for (let i = 1; i <= 20; i++) {
        const key = `MANUAL${String(i).padStart(2, '0')}`;
        let text = matched[key];
        if (text && text.trim()) {
            text = text
                .trim()
                .replace(/^\d+\.\s*/, '')
                .replace(/\.\s*[A-Za-z]+$/, '')
                .replace(/\(\d+\)/g, '')
                .trim();
            steps.push(`${i}. ${text}`);
        }
    }

    const dc = matched.RCP_COOKING_DC?.trim() || '';

    return {
        id: matched.RCP_SEQ,
        title: matched.RCP_NM,
        image_url: matched.ATT_FILE_NO_MAIN || '',
        ingredients,
        instructions: steps.length
            ? steps.join('\n')
            : dc || '조리 방법이 없습니다.'
    };
}

// 검색한 요리 외부 API 에서 찾기
async function fetchApiRecipesByName(keyword, limit = { start: 1, end: 8 }) {
    const url = `${API_BASE}/${limit.start}/${limit.end}/RCP_NM=${encodeURIComponent(keyword)}`;
    const { data } = await axios.get(url);
    return (data.COOKRCP01.row || []).map(r => ({
        id:        r.RCP_SEQ,
        title:     r.RCP_NM,
        image_url: r.ATT_FILE_NO_MAIN || ''
    }));
}

// 로컬 DB에 레시피 등록하기
async function createRecipe({title, image_url, ingredients, instructions}) {
    const sql = `
        INSERT INTO recipe
            (title, image_url, ingredients, instructions)
        VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [
        title,
        image_url,
        ingredients,
        instructions
    ]);
    return result.insertId;
}

module.exports = {
    fetchDbRecipes,
    fetchApiRecipes,
    fetchDbRecipeDetail,
    fetchApiRecipeDetail,
    fetchApiRecipesByName,
    createRecipe
};

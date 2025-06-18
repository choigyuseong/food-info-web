const pool = require('../models/db');
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.FOOD_API_KEY;
const API_BASE = `https://openapi.foodsafetykorea.go.kr/api/${API_KEY}/COOKRCP01/json`;

// 요약용 DTO 변환 함수
function toSummary(record, source) {
    if (source === 'db') {
        return {
            id: record.id,
            title: record.title,
            image_url: record.image_url || ''
        };
    }
    return {
        id: record.RCP_SEQ,
        title: record.RCP_NM,
        image_url: record.ATT_FILE_NO_MAIN || ''
    };
}

// DB에서 레시피 목록 가져오기
async function fetchDbRecipes() {
    const [rows] = await pool.query(
        'SELECT id, title, image_url FROM recipe ORDER BY created_at DESC'
    );
    return rows.map(r => toSummary(r, 'db'));
}

// 외부 API에서 레시피 목록 가져오기 (동적 범위)
async function fetchApiRecipes(limit = {start: 1, end: 8}) {
    const url = `${API_BASE}/${limit.start}/${limit.end}`;
    const {data} = await axios.get(url);
    const apiRows = data.COOKRCP01?.row || [];
    return apiRows.map(r => toSummary(r, 'api'));
}

// 페이지네이션 포함 목록 조회
async function listRecipesWithPaging({ page = 1, pageSize = 8, blockSize = 10 } = {}) {
    // 1) DB 전체
    const dbRecipes = await fetchDbRecipes();

    // 2) API 전체 (1~1000 정도 넉넉히)
    const apiAll = await fetchApiRecipes({ start: 1, end: 1000 });

    // 3) DB+API 전체
    const all = dbRecipes.concat(apiAll);

    // 4) 전체 페이지 수
    const totalPages  = Math.ceil(all.length / pageSize);
    // 5) 현재 페이지에 보여줄 아이템
    const startIdx    = (page - 1) * pageSize;
    const recipes     = all.slice(startIdx, startIdx + pageSize);

    // 6) 블록 계산
    const currentBlock = Math.ceil(page / blockSize);
    const startPage    = (currentBlock - 1) * blockSize + 1;
    const endPage      = Math.min(currentBlock * blockSize, totalPages);
    const hasPrevBlock = startPage > 1;
    const hasNextBlock = endPage < totalPages;

    return {
        recipes,
        page,
        totalPages,
        startPage,
        endPage,
        hasPrevBlock,
        hasNextBlock
    };
}

// DB에서 단일 레시피 상세 조회
async function fetchDbRecipeDetail(id) {
    const [[row]] = await pool.query(
        'SELECT * FROM recipe WHERE id = ?',
        [id]
    );
    return row || null;
}

// 외부 API에서 단일 레시피 상세 조회
async function fetchApiRecipeDetail(id) {
    const url = `${API_BASE}/1/1000/RCP_SEQ=${id}`;
    const {data} = await axios.get(url);
    const apiRows = data.COOKRCP01?.row || [];
    const matched = apiRows.find(r => String(r.RCP_SEQ) === String(id));
    if (!matched) return null;

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

// 이름으로 외부 API 에서 레시피 목록 조회
async function fetchApiRecipesByName(keyword, limit = {start: 1, end: 8}) {
    const url = `${API_BASE}/${limit.start}/${limit.end}/RCP_NM=${encodeURIComponent(keyword)}`;
    const {data} = await axios.get(url);
    const apiRows = data.COOKRCP01?.row || [];
    return apiRows.map(r => toSummary(r, 'api'));
}

// 단일 레시피 조회 (DB 우선, 없으면 API)
async function getRecipe(id) {
    let rec = await fetchDbRecipeDetail(id);
    if (!rec) rec = await fetchApiRecipeDetail(id);
    return rec;
}

// DB에 레시피 등록
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
    listRecipesWithPaging,
    fetchDbRecipeDetail,
    fetchApiRecipeDetail,
    fetchApiRecipesByName,
    getRecipe,
    createRecipe
};

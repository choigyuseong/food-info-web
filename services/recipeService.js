const pool  = require('../models/db');
const axios = require('axios');
require('dotenv').config();

const API_KEY  = process.env.FOOD_API_KEY;
const API_BASE = `https://openapi.foodsafetykorea.go.kr/api/${API_KEY}/COOKRCP01/json`;

// 로컬 DB에서 레시피 목록을 가져옵니다.
async function fetchDbRecipes() {
  const [rows] = await pool.query(
      'SELECT id, title, image_url FROM recipe ORDER BY created_at DESC'
  );
  return rows.map(r => ({
    id:        r.id,
    title:     r.title,
    image_url: r.image_url || ''
  }));
}

// 외부 API에서 레시피 목록을 가져옵니다. (start–end 범위 지정 가능)
async function fetchApiRecipes(limit = { start: 1, end: 8 }) {
  const url = `${API_BASE}/${limit.start}/${limit.end}`;
  const { data } = await axios.get(url);
  return (data.COOKRCP01.row || []).map(r => ({
    id:        r.RCP_SEQ,
    title:     r.RCP_NM,
    image_url: r.ATT_FILE_NO_MAIN || ''
  }));
}

// 로컬 DB에서 특정 레시피 상세를 가져옵니다.
async function fetchDbRecipeDetail(id) {
  const [[row]] = await pool.query(
      'SELECT * FROM recipe WHERE id = ?',
      [id]
  );
  return row || null;
}

// 외부 API에서 특정 레시피 상세를 가져옵니다.
async function fetchApiRecipeDetail(id) {
  const url = `${API_BASE}/1/1`;
  const { data } = await axios.get(url, { params: { RCP_SEQ: id } });
  const row = (data.COOKRCP01.row || [])[0];
  if (!row) return null;

  // 재료
  const ingredients = row.RCP_PARTS_DTLS || '';

  // 단계별 조리 순서
  const steps = [];
  for (let i = 1; i <= 20; i++) {
    const key = `MANUAL${String(i).padStart(2, '0')}`;
    let text = row[key];
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

  const dc = row.RCP_COOKING_DC?.trim() || '';

  return {
    id:           row.RCP_SEQ,
    title:        row.RCP_NM,
    image_url:    row.ATT_FILE_NO_MAIN || '',
    ingredients,
    instructions: steps.length
        ? steps.join('\n')
        : dc || '조리 방법이 없습니다.'
  };
}

module.exports = {
  fetchDbRecipes,
  fetchApiRecipes,
  fetchDbRecipeDetail,
  fetchApiRecipeDetail
};

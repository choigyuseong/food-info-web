// services/recipeService.js
const pool  = require('../models/db');
const axios = require('axios');
require('dotenv').config();

const API_BASE = key =>
    `https://openapi.foodsafetykorea.go.kr/api/${key}/COOKRCP01/json`;

// DB에서 목록
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

// API에서 목록
async function fetchApiRecipes(limit = { start: 1, end: 8 }) {
  const key = process.env.FOOD_API_KEY;
  const url = `${API_BASE(key)}/${limit.start}/${limit.end}`;
  const { data } = await axios.get(url);
  return (data.COOKRCP01.row || []).map(r => ({
    id:        r.RCP_SEQ,
    title:     r.RCP_NM,
    image_url: r.ATT_FILE_NO_MAIN || ''
  }));
}

// DB에서 상세
async function fetchDbRecipeDetail(id) {
  const [[row]] = await pool.query(
      'SELECT * FROM recipe WHERE id = ?',
      [id]
  );
  return row || null;
}

// API에서 상세
async function fetchApiRecipeDetail(id) {
  const key = process.env.FOOD_API_KEY;
  const url = `${API_BASE(key)}/1/1`;
  const { data } = await axios.get(url, { params: { RCP_SEQ: id } });
  const row = (data.COOKRCP01.row || [])[0];
  if (!row) return null;

  // 1) 재료
  const ingredients = row.RCP_PARTS_DTLS || '';

  // 2) 조리 순서: MANUAL01…MANUAL20 필드를 순회해서 합치기
  const steps = [];
  for (let i = 1; i <= 20; i++) {
    const key = `MANUAL${String(i).padStart(2, '0')}`;
    if (row[key] && row[key].trim()) {
      steps.push(`${i}. ${row[key].trim()}`);
    }
  }

  // 3) 또는 전체 지침이 들어있는 RCP_COOKING_DC 사용 (있다면)
  const dc = row.RCP_COOKING_DC && row.RCP_COOKING_DC.trim();

  return {
    id:           row.RCP_SEQ,
    title:        row.RCP_NM,
    image_url:    row.ATT_FILE_NO_MAIN   || '',
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

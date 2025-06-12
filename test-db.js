// test-db.js
const pool = require('./models/db');

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ DB 연결 성공');
    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ DB 연결 실패:', err.message);
    process.exit(1);
  }
})();

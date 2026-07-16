require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3308,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sialumni',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

// Tes koneksi saat aplikasi start
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Koneksi database MySQL berhasil');
    conn.release();
  } catch (err) {
    console.error('❌ Gagal koneksi ke database:', err.message);
  }
})();

module.exports = pool;

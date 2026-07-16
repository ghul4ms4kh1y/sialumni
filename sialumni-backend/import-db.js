require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function importSchema() {
  try {
    // Membuat koneksi sementara menembak langsung ke cloud Railway
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true // Penting agar bisa eksekusi isi schema.sql sekaligus
    });

    // Membaca file schema.sql yang berada di subfolder database
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('⏳ Sedang mengimpor tabel ke Railway Cloud...');
    await connection.query(sql);
    console.log('✅ Semua tabel berhasil diimport ke Railway!');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Gagal mengimpor tabel:', error.message);
  } finally {
    process.exit();
  }
}

importSchema();
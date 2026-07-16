/**
 * Script untuk membuat akun admin default.
 * Jalankan setelah schema.sql diimport: node database/seed.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
  try {
    const nama = 'Super Admin';
    const email = 'admin@sekolah.sch.id';
    const passwordPlain = 'admin123'; // Ganti setelah login pertama!
    const hash = await bcrypt.hash(passwordPlain, 10);

    const [existing] = await pool.query('SELECT id FROM admin WHERE email = ?', [email]);

    if (existing.length > 0) {
      console.log('ℹ️  Admin dengan email tersebut sudah ada, seed dilewati.');
    } else {
      await pool.query(
        'INSERT INTO admin (nama, email, password, role) VALUES (?, ?, ?, ?)',
        [nama, email, hash, 'super_admin']
      );
      console.log('✅ Admin default berhasil dibuat:');
      console.log(`   Email    : ${email}`);
      console.log(`   Password : ${passwordPlain}`);
      console.log('   ⚠️  Segera ganti password setelah login pertama!');
    }
  } catch (err) {
    console.error('❌ Gagal membuat seed admin:', err.message); 
  } finally {
    process.exit();
  }
}

seed();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

// =========================================================
// POST /api/auth/register  -> Registrasi alumni baru
// =========================================================
exports.registerAlumni = async (req, res) => {
  try {
    const {
      nis, nama, email, password, jenis_kelamin, tempat_lahir,
      tanggal_lahir, tahun_masuk, tahun_lulus, kelas_terakhir,
      no_hp, alamat, kota_domisili
    } = req.body;

    if (!nama || !email || !password || !tahun_lulus) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, password, dan tahun lulus wajib diisi'
      });
    }

    const [existing] = await pool.query('SELECT id FROM alumni WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO alumni
        (nis, nama, email, password, jenis_kelamin, tempat_lahir, tanggal_lahir,
         tahun_masuk, tahun_lulus, kelas_terakhir, no_hp, alamat, kota_domisili)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nis || null, nama, email, hash, jenis_kelamin || null, tempat_lahir || null,
       tanggal_lahir || null, tahun_masuk || null, tahun_lulus, kelas_terakhir || null,
       no_hp || null, alamat || null, kota_domisili || null]
    );

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil. Akun Anda menunggu verifikasi admin.',
      data: { id: result.insertId }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

// =========================================================
// POST /api/auth/login/alumni
// =========================================================
exports.loginAlumni = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
    }

    const [rows] = await pool.query('SELECT * FROM alumni WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const alumni = rows[0];
    const match = await bcrypt.compare(password, alumni.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    if (alumni.status_verifikasi !== 'verified') {
      return res.status(403).json({
        success: false,
        message: `Akun Anda berstatus '${alumni.status_verifikasi}'. Hubungi admin sekolah untuk verifikasi.`
      });
    }

    const token = generateToken({ id: alumni.id, tipe: 'alumni' });
    delete alumni.password;

    res.json({ success: true, message: 'Login berhasil', data: { token, alumni } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

// =========================================================
// POST /api/auth/login/admin
// =========================================================
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
    }

    const [rows] = await pool.query('SELECT * FROM admin WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const token = generateToken({ id: admin.id, role: admin.role, tipe: 'admin' });
    delete admin.password;

    res.json({ success: true, message: 'Login berhasil', data: { token, admin } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

// =========================================================
// GET /api/auth/me  -> Info user yang sedang login (admin/alumni)
// =========================================================
exports.me = async (req, res) => {
  try {
    const { id, tipe } = req.user;
    const table = tipe === 'admin' ? 'admin' : 'alumni';
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const user = rows[0];
    delete user.password;

    res.json({ success: true, data: { tipe, user } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

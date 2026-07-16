const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// =========================================================
// GET /api/alumni  -> Daftar alumni + pencarian & filter
// Query params: search, tahun_lulus, kota_domisili, status_verifikasi, page, limit
// =========================================================
exports.getAllAlumni = async (req, res) => {
  try {
    const { search, tahun_lulus, kota_domisili, status_verifikasi } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let where = [];
    let params = [];

    if (search) {
      where.push('(nama LIKE ? OR nis LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (tahun_lulus) {
      where.push('tahun_lulus = ?');
      params.push(tahun_lulus);
    }
    if (kota_domisili) {
      where.push('kota_domisili LIKE ?');
      params.push(`%${kota_domisili}%`);
    }
    // Alumni publik (non-admin) hanya boleh melihat yang sudah verified
    if (req.user?.tipe === 'admin' && status_verifikasi) {
      where.push('status_verifikasi = ?');
      params.push(status_verifikasi);
    } else if (req.user?.tipe !== 'admin') {
      where.push('status_verifikasi = ?');
      params.push('verified');
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT id, nis, nama, email, jenis_kelamin, tahun_masuk, tahun_lulus,
              kelas_terakhir, kota_domisili, foto, status_verifikasi, privasi_kontak,
              no_hp, media_sosial, created_at
       FROM alumni
       ${whereClause}
       ORDER BY tahun_lulus DESC, nama ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM alumni ${whereClause}`,
      params
    );

    // Sembunyikan kontak jika privasi = privat dan bukan admin/pemilik data
    const data = rows.map((a) => {
      if (a.privasi_kontak === 'privat' && req.user?.tipe !== 'admin' && req.user?.id !== a.id) {
        a.no_hp = null;
        a.media_sosial = null;
      }
      return a;
    });

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

// =========================================================
// GET /api/alumni/:id
// =========================================================
exports.getAlumniById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM alumni WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Alumni tidak ditemukan' });
    }

    const alumni = rows[0];
    delete alumni.password;

    if (alumni.privasi_kontak === 'privat' && req.user?.tipe !== 'admin' && req.user?.id != id) {
      alumni.no_hp = null;
      alumni.media_sosial = null;
    }

    const [pendidikan] = await pool.query(
      'SELECT * FROM pendidikan_lanjutan WHERE alumni_id = ? ORDER BY tahun_mulai ASC', [id]
    );
    const [pekerjaan] = await pool.query(
      'SELECT * FROM pekerjaan WHERE alumni_id = ? ORDER BY tahun_mulai DESC', [id]
    );

    res.json({ success: true, data: { ...alumni, pendidikan_lanjutan: pendidikan, pekerjaan } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

// =========================================================
// PUT /api/alumni/:id -> Update profil (alumni sendiri atau admin)
// =========================================================
exports.updateAlumni = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.tipe === 'alumni' && req.user.id != id) {
      return res.status(403).json({ success: false, message: 'Tidak diizinkan mengubah data alumni lain' });
    }

    const allowedFields = [
      'nama', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'kelas_terakhir',
      'no_hp', 'alamat', 'kota_domisili', 'media_sosial', 'privasi_kontak', 'foto'
    ];
    const updates = [];
    const params = [];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    }

    if (req.body.password) {
      const hash = await bcrypt.hash(req.body.password, 10);
      updates.push('password = ?');
      params.push(hash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data yang diubah' });
    }

    params.push(id);
    await pool.query(`UPDATE alumni SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ success: true, message: 'Data alumni berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

// =========================================================
// PATCH /api/alumni/:id/verifikasi  -> Admin verifikasi/tolak alumni
// =========================================================
exports.verifikasiAlumni = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_verifikasi } = req.body;

    if (!['pending', 'verified', 'rejected'].includes(status_verifikasi)) {
      return res.status(400).json({ success: false, message: 'Status verifikasi tidak valid' });
    }

    const [result] = await pool.query(
      'UPDATE alumni SET status_verifikasi = ? WHERE id = ?',
      [status_verifikasi, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Alumni tidak ditemukan' });
    }

    res.json({ success: true, message: `Status alumni diubah menjadi '${status_verifikasi}'` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

// =========================================================
// DELETE /api/alumni/:id  -> Admin hapus data alumni
// =========================================================
exports.deleteAlumni = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM alumni WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Alumni tidak ditemukan' });
    }

    res.json({ success: true, message: 'Data alumni berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

// =========================================================
// Pendidikan Lanjutan - Sub Resource
// =========================================================
exports.addPendidikan = async (req, res) => {
  try {
    const { id } = req.params; // alumni_id
    if (req.user.tipe === 'alumni' && req.user.id != id) {
      return res.status(403).json({ success: false, message: 'Tidak diizinkan' });
    }

    const { jenjang, nama_institusi, jurusan, tahun_mulai, tahun_selesai } = req.body;
    if (!jenjang || !nama_institusi) {
      return res.status(400).json({ success: false, message: 'Jenjang dan nama institusi wajib diisi' });
    }

    const [result] = await pool.query(
      `INSERT INTO pendidikan_lanjutan (alumni_id, jenjang, nama_institusi, jurusan, tahun_mulai, tahun_selesai)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, jenjang, nama_institusi, jurusan || null, tahun_mulai || null, tahun_selesai || null]
    );

    res.status(201).json({ success: true, message: 'Pendidikan berhasil ditambahkan', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

exports.deletePendidikan = async (req, res) => {
  try {
    const { pendidikanId } = req.params;
    const [result] = await pool.query('DELETE FROM pendidikan_lanjutan WHERE id = ?', [pendidikanId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }
    res.json({ success: true, message: 'Data pendidikan dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

// =========================================================
// Pekerjaan - Sub Resource
// =========================================================
exports.addPekerjaan = async (req, res) => {
  try {
    const { id } = req.params; // alumni_id
    if (req.user.tipe === 'alumni' && req.user.id != id) {
      return res.status(403).json({ success: false, message: 'Tidak diizinkan' });
    }

    const { nama_perusahaan, posisi, bidang_industri, tahun_mulai, tahun_selesai, is_current } = req.body;
    if (!nama_perusahaan) {
      return res.status(400).json({ success: false, message: 'Nama perusahaan wajib diisi' });
    }

    const [result] = await pool.query(
      `INSERT INTO pekerjaan (alumni_id, nama_perusahaan, posisi, bidang_industri, tahun_mulai, tahun_selesai, is_current)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, nama_perusahaan, posisi || null, bidang_industri || null, tahun_mulai || null,
       tahun_selesai || null, is_current ? 1 : 0]
    );

    res.status(201).json({ success: true, message: 'Pekerjaan berhasil ditambahkan', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

exports.deletePekerjaan = async (req, res) => {
  try {
    const { pekerjaanId } = req.params;
    const [result] = await pool.query('DELETE FROM pekerjaan WHERE id = ?', [pekerjaanId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }
    res.json({ success: true, message: 'Data pekerjaan dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

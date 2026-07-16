const pool = require('../config/db');

exports.getAllLowongan = async (req, res) => {
  try {
    const { status = 'aktif' } = req.query;
    const [rows] = await pool.query(
      `SELECT lk.*, a.nama as nama_pemosting
       FROM lowongan_kerja lk JOIN alumni a ON a.id = lk.alumni_id
       WHERE lk.status = ?
       ORDER BY lk.created_at DESC`,
      [status]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

exports.getLowonganById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT lk.*, a.nama as nama_pemosting
       FROM lowongan_kerja lk JOIN alumni a ON a.id = lk.alumni_id
       WHERE lk.id = ?`, [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lowongan tidak ditemukan' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

exports.createLowongan = async (req, res) => {
  try {
    const { judul, nama_perusahaan, lokasi, deskripsi, link_lamaran } = req.body;
    if (!judul) {
      return res.status(400).json({ success: false, message: 'Judul lowongan wajib diisi' });
    }

    const [result] = await pool.query(
      `INSERT INTO lowongan_kerja (alumni_id, judul, nama_perusahaan, lokasi, deskripsi, link_lamaran)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, judul, nama_perusahaan || null, lokasi || null, deskripsi || null, link_lamaran || null]
    );

    res.status(201).json({ success: true, message: 'Lowongan berhasil diposting', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

exports.updateLowongan = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query('SELECT alumni_id FROM lowongan_kerja WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lowongan tidak ditemukan' });
    }
    if (req.user.tipe === 'alumni' && rows[0].alumni_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Tidak diizinkan mengubah lowongan ini' });
    }

    const fields = ['judul', 'nama_perusahaan', 'lokasi', 'deskripsi', 'link_lamaran', 'status'];
    const updates = [];
    const params = [];
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        params.push(req.body[f]);
      }
    }
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data yang diubah' });
    }

    params.push(id);
    await pool.query(`UPDATE lowongan_kerja SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ success: true, message: 'Lowongan berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

exports.deleteLowongan = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query('SELECT alumni_id FROM lowongan_kerja WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lowongan tidak ditemukan' });
    }
    if (req.user.tipe === 'alumni' && rows[0].alumni_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Tidak diizinkan menghapus lowongan ini' });
    }

    await pool.query('DELETE FROM lowongan_kerja WHERE id = ?', [id]);
    res.json({ success: true, message: 'Lowongan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

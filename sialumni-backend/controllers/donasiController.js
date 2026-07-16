const pool = require('../config/db');

exports.getAllDonasi = async (req, res) => {
  try {
    let query = `SELECT d.*, a.nama FROM donasi d JOIN alumni a ON a.id = d.alumni_id`;
    const params = [];

    // Alumni biasa hanya lihat donasinya sendiri, admin lihat semua
    if (req.user.tipe === 'alumni') {
      query += ' WHERE d.alumni_id = ?';
      params.push(req.user.id);
    }
    query += ' ORDER BY d.created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

exports.createDonasi = async (req, res) => {
  try {
    const { jumlah, tujuan, catatan, bukti_transfer } = req.body;
    if (!jumlah) {
      return res.status(400).json({ success: false, message: 'Jumlah donasi wajib diisi' });
    }

    const [result] = await pool.query(
      `INSERT INTO donasi (alumni_id, jumlah, tujuan, catatan, bukti_transfer)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, jumlah, tujuan || null, catatan || null, bukti_transfer || null]
    );

    res.status(201).json({ success: true, message: 'Donasi berhasil dicatat, menunggu verifikasi admin', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

exports.verifikasiDonasi = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'terverifikasi', 'ditolak'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid' });
    }

    const [result] = await pool.query('UPDATE donasi SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Donasi tidak ditemukan' });
    }

    res.json({ success: true, message: `Status donasi diubah menjadi '${status}'` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

exports.getRingkasanDonasi = async (req, res) => {
  try {
    const [[summary]] = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN status = 'terverifikasi' THEN jumlah ELSE 0 END), 0) as total_terkumpul,
         COUNT(CASE WHEN status = 'terverifikasi' THEN 1 END) as jumlah_donatur
       FROM donasi`
    );
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

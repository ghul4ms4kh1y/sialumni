const pool = require('../config/db');

exports.getAllPengumuman = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pengumuman ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

exports.createPengumuman = async (req, res) => {
  try {
    const { judul, isi } = req.body;
    if (!judul || !isi) {
      return res.status(400).json({ success: false, message: 'Judul dan isi wajib diisi' });
    }

    const [result] = await pool.query(
      'INSERT INTO pengumuman (judul, isi, dibuat_oleh) VALUES (?, ?, ?)',
      [judul, isi, req.user.id]
    );

    res.status(201).json({ success: true, message: 'Pengumuman berhasil dibuat', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

exports.deletePengumuman = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM pengumuman WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan' });
    }
    res.json({ success: true, message: 'Pengumuman berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

const pool = require('../config/db');

exports.getAllPost = async (req, res) => {
  try {
    const { angkatan } = req.query;
    let query = `SELECT fp.*, a.nama, a.foto
                 FROM forum_post fp JOIN alumni a ON a.id = fp.alumni_id`;
    const params = [];

    if (angkatan) {
      query += ' WHERE fp.angkatan = ?';
      params.push(angkatan);
    }
    query += ' ORDER BY fp.created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT fp.*, a.nama, a.foto FROM forum_post fp JOIN alumni a ON a.id = fp.alumni_id WHERE fp.id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Postingan tidak ditemukan' });
    }

    const [komentar] = await pool.query(
      `SELECT fk.*, a.nama, a.foto FROM forum_komentar fk JOIN alumni a ON a.id = fk.alumni_id
       WHERE fk.post_id = ? ORDER BY fk.created_at ASC`, [id]
    );

    res.json({ success: true, data: { ...rows[0], komentar } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { judul, isi, angkatan } = req.body;
    if (!isi) {
      return res.status(400).json({ success: false, message: 'Isi postingan wajib diisi' });
    }

    const [result] = await pool.query(
      'INSERT INTO forum_post (alumni_id, angkatan, judul, isi) VALUES (?, ?, ?, ?)',
      [req.user.id, angkatan || null, judul || null, isi]
    );

    res.status(201).json({ success: true, message: 'Postingan berhasil dibuat', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT alumni_id FROM forum_post WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Postingan tidak ditemukan' });
    }
    if (req.user.tipe === 'alumni' && rows[0].alumni_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Tidak diizinkan menghapus postingan ini' });
    }

    await pool.query('DELETE FROM forum_post WHERE id = ?', [id]);
    res.json({ success: true, message: 'Postingan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

exports.addKomentar = async (req, res) => {
  try {
    const { id } = req.params; // post_id
    const { isi } = req.body;
    if (!isi) {
      return res.status(400).json({ success: false, message: 'Isi komentar wajib diisi' });
    }

    const [result] = await pool.query(
      'INSERT INTO forum_komentar (post_id, alumni_id, isi) VALUES (?, ?, ?)',
      [id, req.user.id, isi]
    );

    res.status(201).json({ success: true, message: 'Komentar berhasil ditambahkan', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

exports.deleteKomentar = async (req, res) => {
  try {
    const { komentarId } = req.params;
    const [rows] = await pool.query('SELECT alumni_id FROM forum_komentar WHERE id = ?', [komentarId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Komentar tidak ditemukan' });
    }
    if (req.user.tipe === 'alumni' && rows[0].alumni_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Tidak diizinkan menghapus komentar ini' });
    }

    await pool.query('DELETE FROM forum_komentar WHERE id = ?', [komentarId]);
    res.json({ success: true, message: 'Komentar berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

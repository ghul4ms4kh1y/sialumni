const pool = require('../config/db');

exports.getAllEvent = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM event ORDER BY tanggal_mulai DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM event WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event tidak ditemukan' });
    }

    const [peserta] = await pool.query(
      `SELECT ep.status_rsvp, a.id as alumni_id, a.nama, a.tahun_lulus
       FROM event_peserta ep JOIN alumni a ON a.id = ep.alumni_id
       WHERE ep.event_id = ?`, [id]
    );

    res.json({ success: true, data: { ...rows[0], peserta } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { judul, deskripsi, lokasi, tanggal_mulai, tanggal_selesai, banner } = req.body;
    if (!judul || !tanggal_mulai) {
      return res.status(400).json({ success: false, message: 'Judul dan tanggal mulai wajib diisi' });
    }

    const [result] = await pool.query(
      `INSERT INTO event (judul, deskripsi, lokasi, tanggal_mulai, tanggal_selesai, banner, dibuat_oleh)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [judul, deskripsi || null, lokasi || null, tanggal_mulai, tanggal_selesai || null, banner || null, req.user.id]
    );

    res.status(201).json({ success: true, message: 'Event berhasil dibuat', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = ['judul', 'deskripsi', 'lokasi', 'tanggal_mulai', 'tanggal_selesai', 'banner'];
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
    const [result] = await pool.query(`UPDATE event SET ${updates.join(', ')} WHERE id = ?`, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Event tidak ditemukan' });
    }
    res.json({ success: true, message: 'Event berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM event WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Event tidak ditemukan' });
    }
    res.json({ success: true, message: 'Event berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

// RSVP oleh alumni
exports.rsvpEvent = async (req, res) => {
  try {
    const { id } = req.params; // event_id
    const { status_rsvp } = req.body;
    const alumni_id = req.user.id;

    if (!['hadir', 'tidak_hadir', 'mungkin'].includes(status_rsvp)) {
      return res.status(400).json({ success: false, message: 'Status RSVP tidak valid' });
    }

    await pool.query(
      `INSERT INTO event_peserta (event_id, alumni_id, status_rsvp)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE status_rsvp = VALUES(status_rsvp)`,
      [id, alumni_id, status_rsvp]
    );

    res.json({ success: true, message: 'RSVP berhasil disimpan' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

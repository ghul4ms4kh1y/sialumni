const pool = require('../config/db');

// GET /api/statistik/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const [[totalAlumni]] = await pool.query('SELECT COUNT(*) as total FROM alumni');
    const [[verified]] = await pool.query("SELECT COUNT(*) as total FROM alumni WHERE status_verifikasi = 'verified'");
    const [[pending]] = await pool.query("SELECT COUNT(*) as total FROM alumni WHERE status_verifikasi = 'pending'");

    const [perAngkatan] = await pool.query(
      `SELECT tahun_lulus, COUNT(*) as jumlah FROM alumni GROUP BY tahun_lulus ORDER BY tahun_lulus DESC`
    );

    const [perKota] = await pool.query(
      `SELECT kota_domisili, COUNT(*) as jumlah FROM alumni
       WHERE kota_domisili IS NOT NULL AND kota_domisili != ''
       GROUP BY kota_domisili ORDER BY jumlah DESC LIMIT 10`
    );

    const [pendidikanLanjutan] = await pool.query(
      `SELECT jenjang, COUNT(*) as jumlah FROM pendidikan_lanjutan GROUP BY jenjang ORDER BY jumlah DESC`
    );

    const [bidangPekerjaan] = await pool.query(
      `SELECT bidang_industri, COUNT(*) as jumlah FROM pekerjaan
       WHERE bidang_industri IS NOT NULL AND bidang_industri != '' AND is_current = 1
       GROUP BY bidang_industri ORDER BY jumlah DESC LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        total_alumni: totalAlumni.total,
        alumni_verified: verified.total,
        alumni_pending: pending.total,
        per_angkatan: perAngkatan,
        per_kota: perKota,
        pendidikan_lanjutan: pendidikanLanjutan,
        bidang_pekerjaan: bidangPekerjaan
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: err.message });
  }
};

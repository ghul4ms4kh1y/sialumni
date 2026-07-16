const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumniController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Publik/terautentikasi: lihat & cari alumni
router.get('/', verifyToken, alumniController.getAllAlumni);
router.get('/:id', verifyToken, alumniController.getAlumniById);

// Update profil (alumni sendiri atau admin)
router.put('/:id', verifyToken, alumniController.updateAlumni);

// Upload foto profil
router.post('/:id/foto', verifyToken, upload.single('foto'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'File foto tidak ditemukan' });
  }
  res.json({ success: true, message: 'Foto berhasil diupload', data: { path: req.file.path } });
});

// Verifikasi & hapus -> khusus admin
router.patch('/:id/verifikasi', verifyToken, isAdmin, alumniController.verifikasiAlumni);
router.delete('/:id', verifyToken, isAdmin, alumniController.deleteAlumni);

// Pendidikan lanjutan
router.post('/:id/pendidikan', verifyToken, alumniController.addPendidikan);
router.delete('/:id/pendidikan/:pendidikanId', verifyToken, alumniController.deletePendidikan);

// Pekerjaan
router.post('/:id/pekerjaan', verifyToken, alumniController.addPekerjaan);
router.delete('/:id/pekerjaan/:pekerjaanId', verifyToken, alumniController.deletePekerjaan);

module.exports = router;

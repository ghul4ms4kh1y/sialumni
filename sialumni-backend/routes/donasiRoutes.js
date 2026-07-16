const express = require('express');
const router = express.Router();
const donasiController = require('../controllers/donasiController');
const { verifyToken, isAdmin, isAlumni } = require('../middleware/auth');

router.get('/', verifyToken, donasiController.getAllDonasi);
router.get('/ringkasan', verifyToken, donasiController.getRingkasanDonasi);

router.post('/', verifyToken, isAlumni, donasiController.createDonasi);
router.patch('/:id/verifikasi', verifyToken, isAdmin, donasiController.verifikasiDonasi);

module.exports = router;

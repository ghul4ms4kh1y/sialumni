const express = require('express');
const router = express.Router();
const lowonganController = require('../controllers/lowonganController');
const { verifyToken, isAlumni } = require('../middleware/auth');

router.get('/', verifyToken, lowonganController.getAllLowongan);
router.get('/:id', verifyToken, lowonganController.getLowonganById);

router.post('/', verifyToken, isAlumni, lowonganController.createLowongan);
router.put('/:id', verifyToken, isAlumni, lowonganController.updateLowongan);
router.delete('/:id', verifyToken, isAlumni, lowonganController.deleteLowongan);

module.exports = router;

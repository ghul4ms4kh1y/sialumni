const express = require('express');
const router = express.Router();
const pengumumanController = require('../controllers/pengumumanController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', verifyToken, pengumumanController.getAllPengumuman);
router.post('/', verifyToken, isAdmin, pengumumanController.createPengumuman);
router.delete('/:id', verifyToken, isAdmin, pengumumanController.deletePengumuman);

module.exports = router;

const express = require('express');
const router = express.Router();
const statistikController = require('../controllers/statistikController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/dashboard', verifyToken, isAdmin, statistikController.getDashboard);

module.exports = router;

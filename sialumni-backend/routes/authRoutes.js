const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/register', authController.registerAlumni);
router.post('/login/alumni', authController.loginAlumni);
router.post('/login/admin', authController.loginAdmin);
router.get('/me', verifyToken, authController.me);

module.exports = router;

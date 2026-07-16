const jwt = require('jsonwebtoken');

/**
 * Verifikasi token JWT dan lampirkan payload ke req.user
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, tipe: 'admin' | 'alumni' }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token tidak valid atau kedaluwarsa' });
  }
}

/**
 * Hanya izinkan role admin (super_admin / admin)
 */
function isAdmin(req, res, next) {
  if (req.user?.tipe !== 'admin') {
    return res.status(403).json({ success: false, message: 'Akses khusus admin' });
  }
  next();
}

/**
 * Hanya izinkan super_admin
 */
function isSuperAdmin(req, res, next) {
  if (req.user?.tipe !== 'admin' || req.user?.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Akses khusus super admin' });
  }
  next();
}

/**
 * Hanya izinkan alumni yang sudah login
 */
function isAlumni(req, res, next) {
  if (req.user?.tipe !== 'alumni') {
    return res.status(403).json({ success: false, message: 'Akses khusus alumni' });
  }
  next();
}

module.exports = { verifyToken, isAdmin, isSuperAdmin, isAlumni };

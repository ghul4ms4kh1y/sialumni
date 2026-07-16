require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const alumniRoutes = require('./routes/alumniRoutes');
const eventRoutes = require('./routes/eventRoutes');
const lowonganRoutes = require('./routes/lowonganRoutes');
const forumRoutes = require('./routes/forumRoutes');
const donasiRoutes = require('./routes/donasiRoutes');
const pengumumanRoutes = require('./routes/pengumumanRoutes');
const statistikRoutes = require('./routes/statistikRoutes');

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file untuk foto/upload
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SIALUMNI API is running 🚀',
    version: '1.0.0'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/lowongan', lowonganRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/donasi', donasiRoutes);
app.use('/api/pengumuman', pengumumanRoutes);
app.use('/api/statistik', statistikRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});

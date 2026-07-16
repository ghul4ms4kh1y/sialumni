-- =========================================================
-- SIALUMNI - Sistem Informasi Alumni Sekolah
-- Skema Database MySQL
-- =========================================================

-- CREATE DATABASE IF NOT EXISTS sialumni
--   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- USE sialumni;

-- =========================================================
-- Tabel Admin
-- =========================================================
CREATE TABLE IF NOT EXISTS admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('super_admin','admin') NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================================
-- Tabel Angkatan / Kelas (data master, opsional tapi membantu)
-- =========================================================
CREATE TABLE IF NOT EXISTS angkatan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tahun_lulus YEAR NOT NULL UNIQUE,
  keterangan VARCHAR(255)
) ENGINE=InnoDB;

-- =========================================================
-- Tabel Alumni (Core)
-- =========================================================
CREATE TABLE IF NOT EXISTS alumni (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nis VARCHAR(50) UNIQUE,
  nama VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  jenis_kelamin ENUM('L','P') DEFAULT NULL,
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE,
  tahun_masuk YEAR,
  tahun_lulus YEAR NOT NULL,
  kelas_terakhir VARCHAR(50),
  no_hp VARCHAR(20),
  alamat TEXT,
  kota_domisili VARCHAR(100),
  foto VARCHAR(255),
  media_sosial VARCHAR(255),
  status_verifikasi ENUM('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  privasi_kontak ENUM('publik','privat') NOT NULL DEFAULT 'privat',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tahun_lulus (tahun_lulus),
  INDEX idx_status_verifikasi (status_verifikasi)
) ENGINE=InnoDB;

-- =========================================================
-- Tabel Pendidikan Lanjutan
-- =========================================================
CREATE TABLE IF NOT EXISTS pendidikan_lanjutan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumni_id INT NOT NULL,
  jenjang VARCHAR(50) NOT NULL, -- SMP, SMA, D3, S1, S2, dst
  nama_institusi VARCHAR(150) NOT NULL,
  jurusan VARCHAR(150),
  tahun_mulai YEAR,
  tahun_selesai YEAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- Tabel Pekerjaan
-- =========================================================
CREATE TABLE IF NOT EXISTS pekerjaan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumni_id INT NOT NULL,
  nama_perusahaan VARCHAR(150) NOT NULL,
  posisi VARCHAR(150),
  bidang_industri VARCHAR(150),
  tahun_mulai YEAR,
  tahun_selesai YEAR NULL, -- NULL = masih bekerja di sana
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- Tabel Event / Reuni
-- =========================================================
CREATE TABLE IF NOT EXISTS event (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(200) NOT NULL,
  deskripsi TEXT,
  lokasi VARCHAR(255),
  tanggal_mulai DATETIME NOT NULL,
  tanggal_selesai DATETIME,
  banner VARCHAR(255),
  dibuat_oleh INT, -- admin id
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dibuat_oleh) REFERENCES admin(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================================================
-- Tabel RSVP Event
-- =========================================================
CREATE TABLE IF NOT EXISTS event_peserta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  alumni_id INT NOT NULL,
  status_rsvp ENUM('hadir','tidak_hadir','mungkin') NOT NULL DEFAULT 'mungkin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_event_alumni (event_id, alumni_id),
  FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
  FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- Tabel Lowongan Kerja
-- =========================================================
CREATE TABLE IF NOT EXISTS lowongan_kerja (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumni_id INT NOT NULL, -- yang memposting
  judul VARCHAR(200) NOT NULL,
  nama_perusahaan VARCHAR(150),
  lokasi VARCHAR(150),
  deskripsi TEXT,
  link_lamaran VARCHAR(255),
  status ENUM('aktif','ditutup') NOT NULL DEFAULT 'aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- Tabel Forum Post (diskusi per angkatan / umum)
-- =========================================================
CREATE TABLE IF NOT EXISTS forum_post (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumni_id INT NOT NULL,
  angkatan YEAR, -- NULL = forum umum, diisi = khusus angkatan
  judul VARCHAR(200),
  isi TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- Tabel Komentar Forum
-- =========================================================
CREATE TABLE IF NOT EXISTS forum_komentar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  alumni_id INT NOT NULL,
  isi TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES forum_post(id) ON DELETE CASCADE,
  FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- Tabel Donasi
-- =========================================================
CREATE TABLE IF NOT EXISTS donasi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumni_id INT NOT NULL,
  jumlah DECIMAL(15,2) NOT NULL,
  tujuan VARCHAR(255),
  catatan TEXT,
  bukti_transfer VARCHAR(255),
  status ENUM('pending','terverifikasi','ditolak') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- Tabel Pengumuman (dari sekolah/admin ke alumni)
-- =========================================================
CREATE TABLE IF NOT EXISTS pengumuman (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(200) NOT NULL,
  isi TEXT NOT NULL,
  dibuat_oleh INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dibuat_oleh) REFERENCES admin(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================================================
-- Catatan: Data admin default TIDAK di-seed lewat SQL ini
-- karena password perlu di-hash dengan bcrypt.
-- Jalankan: npm run seed  (lihat database/seed.js)
-- =========================================================

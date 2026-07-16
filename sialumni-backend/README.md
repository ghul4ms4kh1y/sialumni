# SIALUMNI Backend API

Backend REST API untuk **Sistem Informasi Alumni Sekolah** (SD/SMP/SMA), dibangun dengan **Express.js** dan **MySQL**.

## 🧩 Fitur

- Autentikasi Admin & Alumni (JWT)
- Registrasi alumni + verifikasi oleh admin
- CRUD data alumni (profil, pendidikan lanjutan, pekerjaan)
- Pencarian & filter alumni (nama, tahun lulus, kota domisili)
- Event/Reuni + RSVP
- Lowongan kerja (posting antar alumni)
- Forum diskusi + komentar (per angkatan/umum)
- Donasi alumni + verifikasi admin
- Pengumuman dari sekolah
- Dashboard statistik (untuk admin)
- Upload foto profil

## 🛠️ Teknologi

- Node.js + Express.js
- MySQL (mysql2)
- JWT (jsonwebtoken) untuk autentikasi
- bcryptjs untuk hashing password
- multer untuk upload file

## 📦 Instalasi

### 1. Extract & masuk folder project

```bash
cd sialumni-backend
npm install
```

### 2. Setup Database

Buat database MySQL, lalu import skema:

```bash
mysql -u root -p < database/schema.sql
```

Atau jalankan isi `database/schema.sql` lewat phpMyAdmin/MySQL Workbench.

### 3. Konfigurasi Environment

Duplikat file `.env.example` menjadi `.env`, lalu sesuaikan:

```bash
cp .env.example .env
```

Isi variabel berikut sesuai konfigurasi MySQL Anda:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=sialumni
JWT_SECRET=ganti_dengan_secret_key_yang_kuat
```

### 4. Buat Akun Admin Default

```bash
node database/seed.js
```

Akun default:
- Email: `admin@sekolah.sch.id`
- Password: `admin123`

⚠️ **Segera ganti password setelah login pertama.**

### 5. Jalankan Server

```bash
# mode development (auto-reload)
npm run dev

# mode production
npm start
```

Server berjalan di `http://localhost:3000`

---

## 📚 Dokumentasi Endpoint API

Semua response berformat JSON: `{ success, message, data }`.
Endpoint yang butuh login mengirim header:
`Authorization: Bearer <token>`

### Auth
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| POST | `/api/auth/register` | Publik | Registrasi alumni baru |
| POST | `/api/auth/login/alumni` | Publik | Login alumni |
| POST | `/api/auth/login/admin` | Publik | Login admin |
| GET | `/api/auth/me` | Login | Info user yang sedang login |

### Alumni
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/alumni` | Login | List + cari/filter alumni (`?search=&tahun_lulus=&kota_domisili=`) |
| GET | `/api/alumni/:id` | Login | Detail alumni + pendidikan & pekerjaan |
| PUT | `/api/alumni/:id` | Pemilik/Admin | Update profil |
| POST | `/api/alumni/:id/foto` | Pemilik/Admin | Upload foto profil |
| PATCH | `/api/alumni/:id/verifikasi` | Admin | Verifikasi/tolak alumni |
| DELETE | `/api/alumni/:id` | Admin | Hapus data alumni |
| POST | `/api/alumni/:id/pendidikan` | Pemilik/Admin | Tambah pendidikan lanjutan |
| DELETE | `/api/alumni/:id/pendidikan/:pendidikanId` | Pemilik/Admin | Hapus pendidikan lanjutan |
| POST | `/api/alumni/:id/pekerjaan` | Pemilik/Admin | Tambah riwayat pekerjaan |
| DELETE | `/api/alumni/:id/pekerjaan/:pekerjaanId` | Pemilik/Admin | Hapus riwayat pekerjaan |

### Event
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/event` | Login | List event |
| GET | `/api/event/:id` | Login | Detail event + peserta |
| POST | `/api/event` | Admin | Buat event |
| PUT | `/api/event/:id` | Admin | Update event |
| DELETE | `/api/event/:id` | Admin | Hapus event |
| POST | `/api/event/:id/rsvp` | Alumni | RSVP kehadiran |

### Lowongan Kerja
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/lowongan` | Login | List lowongan (`?status=aktif`) |
| GET | `/api/lowongan/:id` | Login | Detail lowongan |
| POST | `/api/lowongan` | Alumni | Posting lowongan |
| PUT | `/api/lowongan/:id` | Pemilik | Update lowongan |
| DELETE | `/api/lowongan/:id` | Pemilik | Hapus lowongan |

### Forum
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/forum` | Login | List postingan (`?angkatan=2020`) |
| GET | `/api/forum/:id` | Login | Detail + komentar |
| POST | `/api/forum` | Alumni | Buat postingan |
| DELETE | `/api/forum/:id` | Pemilik/Admin | Hapus postingan |
| POST | `/api/forum/:id/komentar` | Alumni | Tambah komentar |
| DELETE | `/api/forum/komentar/:komentarId` | Pemilik/Admin | Hapus komentar |

### Donasi
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/donasi` | Login | List donasi (alumni: milik sendiri, admin: semua) |
| GET | `/api/donasi/ringkasan` | Login | Total donasi terkumpul |
| POST | `/api/donasi` | Alumni | Catat donasi baru |
| PATCH | `/api/donasi/:id/verifikasi` | Admin | Verifikasi/tolak donasi |

### Pengumuman
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/pengumuman` | Login | List pengumuman |
| POST | `/api/pengumuman` | Admin | Buat pengumuman |
| DELETE | `/api/pengumuman/:id` | Admin | Hapus pengumuman |

### Statistik
| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/api/statistik/dashboard` | Admin | Ringkasan statistik alumni |

---

## 📁 Struktur Folder

```
sialumni-backend/
├── config/
│   └── db.js                 # Koneksi MySQL
├── controllers/               # Logic bisnis tiap modul
├── database/
│   ├── schema.sql             # Skema database
│   └── seed.js                # Seed akun admin default
├── middleware/
│   ├── auth.js                # Verifikasi JWT & role
│   └── upload.js               # Upload file (multer)
├── routes/                    # Definisi endpoint
├── uploads/                   # Folder penyimpanan file upload
├── .env.example
├── package.json
└── server.js                  # Entry point aplikasi
```

## 🔒 Catatan Keamanan

- Ganti `JWT_SECRET` di `.env` dengan string acak yang kuat sebelum produksi
- Ganti password admin default setelah instalasi
- Gunakan HTTPS di lingkungan produksi
- Batasi ukuran & tipe file upload (sudah diatur max 2MB, hanya gambar)

## 🚀 Pengembangan Selanjutnya

- Tambah rate limiting (misal `express-rate-limit`) untuk mencegah brute force login
- Tambah validasi input lebih ketat dengan `express-validator`
- Tambah fitur reset password via email
- Tambah pagination di endpoint forum & lowongan

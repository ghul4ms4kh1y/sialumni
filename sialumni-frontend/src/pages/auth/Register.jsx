import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerAlumni } from '../../api';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    nis: '',
    jenis_kelamin: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    tahun_masuk: '',
    tahun_lulus: '',
    kelas_terakhir: '',
    no_hp: '',
    alamat: '',
    kota_domisili: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerAlumni(form);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Pendaftaran Berhasil!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
            Akun Anda telah terdaftar dan sedang menunggu verifikasi dari admin sekolah.
            Anda akan dapat login setelah akun diverifikasi.
          </p>
          <button className="btn btn-primary btn-full" onClick={() => navigate('/login')}>
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: 40, paddingBottom: 40 }}>
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <div className="auth-logo">
          <div className="logo-icon">🎓</div>
          <h1>Daftar Alumni</h1>
          <p>Isi data diri Anda untuk bergabung</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          {[1, 2].map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
                background: step >= s ? 'var(--gradient)' : 'var(--bg-card)',
                color: step >= s ? 'white' : 'var(--text-muted)',
                border: step >= s ? 'none' : '1px solid var(--border)',
              }}>
                {s}
              </div>
              <span style={{ fontSize: 13, color: step >= s ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step >= s ? 600 : 400 }}>
                {s === 1 ? 'Data Akun' : 'Data Pribadi'}
              </span>
              {s < 2 && <div style={{ flex: 1, height: 1, background: step > s ? 'var(--accent-1)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); setStep(2); }}>
          {step === 1 && (
            <>
              <div className="form-group">
                <label className="form-label">Nama Lengkap *</label>
                <input name="nama" type="text" className="form-input" placeholder="Nama lengkap" value={form.nama} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input name="email" type="email" className="form-input" placeholder="email@example.com" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input name="password" type="password" className="form-input" placeholder="Minimal 6 karakter" value={form.password} onChange={handleChange} required minLength={6} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">NIS</label>
                  <input name="nis" type="text" className="form-input" placeholder="Nomor Induk Siswa" value={form.nis} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tahun Lulus *</label>
                  <select name="tahun_lulus" className="form-input" value={form.tahun_lulus} onChange={handleChange} required>
                    <option value="">Pilih tahun</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8 }}>
                Lanjut →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Jenis Kelamin</label>
                  <select name="jenis_kelamin" className="form-input" value={form.jenis_kelamin} onChange={handleChange}>
                    <option value="">Pilih</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Kelas Terakhir</label>
                  <input name="kelas_terakhir" type="text" className="form-input" placeholder="Contoh: XII IPA 1" value={form.kelas_terakhir} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tempat Lahir</label>
                  <input name="tempat_lahir" type="text" className="form-input" placeholder="Kota" value={form.tempat_lahir} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tanggal Lahir</label>
                  <input name="tanggal_lahir" type="date" className="form-input" value={form.tanggal_lahir} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">No. HP</label>
                  <input name="no_hp" type="text" className="form-input" placeholder="08xx" value={form.no_hp} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Kota Domisili</label>
                  <input name="kota_domisili" type="text" className="form-input" placeholder="Kota saat ini" value={form.kota_domisili} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Alamat</label>
                <textarea name="alamat" className="form-input" placeholder="Alamat lengkap" value={form.alamat} onChange={handleChange} style={{ minHeight: 80 }} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>
                  ← Kembali
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                  {loading ? '⏳ Mendaftar...' : '✅ Daftar Sekarang'}
                </button>
              </div>
            </>
          )}
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          Sudah punya akun?{' '}
          <Link to="/login" style={{ color: 'var(--accent-1)', fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

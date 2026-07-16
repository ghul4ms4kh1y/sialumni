import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginAlumni } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function LoginAlumni() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginAlumni(form.email, form.password);
      login(res.data.token, res.data.alumni, 'alumni');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">🎓</div>
          <h1>SIALUMNI</h1>
          <p>Sistem Informasi Alumni Sekolah</p>
        </div>

        <div className="auth-tabs">
          <button className="auth-tab active">Alumni</button>
          <Link to="/admin/login" className="auth-tab" style={{ textAlign: 'center', display: 'block' }}>
            Admin
          </Link>
        </div>

        {error && (
          <div className="alert alert-error">⚠️ {error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="form-input-icon">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                className="form-input"
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-icon">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? '⏳ Memproses...' : '🚀 Masuk'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          Belum punya akun?{' '}
          <Link to="/register" style={{ color: 'var(--accent-1)', fontWeight: 600 }}>
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}

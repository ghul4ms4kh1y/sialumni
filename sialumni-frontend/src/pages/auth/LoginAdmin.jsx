import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginAdmin } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function LoginAdmin() {
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
      const res = await loginAdmin(form.email, form.password);
      login(res.data.token, res.data.admin, 'admin');
      navigate('/admin/dashboard');
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
          <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>
            🛡️
          </div>
          <h1 style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Panel Admin
          </h1>
          <p>SIALUMNI — Sistem Informasi Alumni</p>
        </div>

        <div className="auth-tabs">
          <Link to="/login" className="auth-tab" style={{ textAlign: 'center', display: 'block' }}>
            Alumni
          </Link>
          <button className="auth-tab active">Admin</button>
        </div>

        {error && (
          <div className="alert alert-error">⚠️ {error}</div>
        )}

        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          🔑 Default: <strong>admin@sekolah.sch.id</strong> / <strong>admin123</strong>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Admin</label>
            <div className="form-input-icon">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                className="form-input"
                placeholder="admin@sekolah.sch.id"
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
            className="btn btn-lg btn-full"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: 'white', boxShadow: '0 4px 15px rgba(139,92,246,0.3)', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? '⏳ Memproses...' : '🛡️ Masuk Admin'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          Login sebagai alumni?{' '}
          <Link to="/login" style={{ color: 'var(--accent-1)', fontWeight: 600 }}>
            Klik di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

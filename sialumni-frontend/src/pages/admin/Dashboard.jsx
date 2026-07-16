import { useState, useEffect } from 'react';
import { getDashboardStatistik } from '../../api';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStatistik()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const s = stats || {};

  return (
    <div className="page-container" style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div>
          <h1>Dashboard Admin</h1>
          <p>Ringkasan statistik SIALUMNI</p>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          📅 {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="stat-card indigo">
          <div className="stat-icon">🎓</div>
          <div className="stat-value">{s.total_alumni ?? '-'}</div>
          <div className="stat-label">Total Alumni</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{s.alumni_pending ?? '-'}</div>
          <div className="stat-label">Menunggu Verifikasi</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{s.alumni_verified ?? '-'}</div>
          <div className="stat-label">Alumni Terverifikasi</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{s.total_event ?? '-'}</div>
          <div className="stat-label">Total Event</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">💝</div>
          <div className="stat-value">{s.total_donasi_pending ?? '-'}</div>
          <div className="stat-label">Donasi Pending</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title" style={{ marginBottom: 20 }}>⚡ Aksi Cepat</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { to: '/admin/alumni', icon: '🎓', label: 'Kelola Alumni', desc: 'Verifikasi & hapus' },
            { to: '/admin/event', icon: '📅', label: 'Buat Event', desc: 'Tambah event baru' },
            { to: '/admin/donasi', icon: '💝', label: 'Verifikasi Donasi', desc: 'Cek donasi masuk' },
            { to: '/admin/pengumuman', icon: '📢', label: 'Pengumuman', desc: 'Kirim pengumuman' },
          ].map((item) => (
            <Link key={item.to} to={item.to} style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              textDecoration: 'none',
              transition: 'var(--transition)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
            >
              <span style={{ fontSize: 28 }}>{item.icon}</span>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Summary */}
      {s.alumni_per_tahun && s.alumni_per_tahun.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">📊 Alumni per Angkatan</div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tahun Lulus</th>
                  <th>Jumlah Alumni</th>
                  <th>Proporsi</th>
                </tr>
              </thead>
              <tbody>
                {s.alumni_per_tahun.slice(0, 10).map((row) => {
                  const pct = s.total_alumni > 0 ? ((row.jumlah / s.total_alumni) * 100).toFixed(1) : 0;
                  return (
                    <tr key={row.tahun_lulus}>
                      <td><strong>Angkatan {row.tahun_lulus}</strong></td>
                      <td><span className="badge badge-info">{row.jumlah} alumni</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--gradient)', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)', minWidth: 40 }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

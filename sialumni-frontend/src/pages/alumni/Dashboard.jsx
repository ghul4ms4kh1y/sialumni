import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEvents, getPengumuman } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DashboardAlumni() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [pengumuman, setPengumuman] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getEvents(), getPengumuman()])
      .then(([evRes, pRes]) => {
        setEvents((evRes.data || []).slice(0, 3));
        setPengumuman((pRes.data || []).slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const initials = user?.nama?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <div className="page-container" style={{ animation: 'fadeInUp 0.4s ease' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'var(--gradient)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px 36px',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -20, top: -20, fontSize: 120,
          opacity: 0.08, userSelect: 'none', lineHeight: 1,
        }}>🎓</div>
        <div className="profile-avatar-large" style={{ background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)', fontSize: 28, color: 'white' }}>
          {user?.foto ? <img src={`/uploads/${user.foto}`} alt={user.nama} /> : initials}
        </div>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 }}>{greeting()},</p>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 4 }}>{user?.nama}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
            Angkatan {user?.tahun_lulus} • {user?.kota_domisili || 'Lokasi belum diisi'}
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Link to="/profil" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}>
            ✏️ Edit Profil
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { to: '/direktori', icon: '🎓', label: 'Direktori Alumni', color: '#6366f1' },
          { to: '/event', icon: '📅', label: 'Event & Reuni', color: '#8b5cf6' },
          { to: '/lowongan', icon: '💼', label: 'Lowongan Kerja', color: '#06b6d4' },
          { to: '/forum', icon: '💬', label: 'Forum Diskusi', color: '#10b981' },
          { to: '/donasi', icon: '💝', label: 'Donasi', color: '#f59e0b' },
          { to: '/pengumuman', icon: '📢', label: 'Pengumuman', color: '#ef4444' },
        ].map((item) => (
          <Link key={item.to} to={item.to} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            transition: 'var(--transition)',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
          >
            <span style={{ fontSize: 28 }}>{item.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid-2">
        {/* Upcoming Events */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📅 Event Mendatang</div>
              <div className="card-subtitle">Acara & reuni terbaru</div>
            </div>
            <Link to="/event" className="btn btn-secondary btn-sm">Lihat Semua</Link>
          </div>
          {events.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-icon">📅</div>
              <p>Belum ada event</p>
            </div>
          ) : (
            events.map((ev) => (
              <div key={ev.id} style={{
                padding: '14px 0', borderBottom: '1px solid var(--border)',
                display: 'flex', gap: 14, alignItems: 'flex-start'
              }}>
                <div style={{
                  background: 'rgba(99,102,241,0.15)', borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px', textAlign: 'center', minWidth: 52, flexShrink: 0
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-1)' }}>
                    {new Date(ev.tanggal_mulai).getDate()}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    {new Date(ev.tanggal_mulai).toLocaleString('id-ID', { month: 'short' })}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{ev.judul}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📍 {ev.lokasi || 'TBD'}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pengumuman */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📢 Pengumuman</div>
              <div className="card-subtitle">Informasi dari sekolah</div>
            </div>
            <Link to="/pengumuman" className="btn btn-secondary btn-sm">Lihat Semua</Link>
          </div>
          {pengumuman.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-icon">📢</div>
              <p>Belum ada pengumuman</p>
            </div>
          ) : (
            pengumuman.map((p) => (
              <div key={p.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{p.judul}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.isi}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

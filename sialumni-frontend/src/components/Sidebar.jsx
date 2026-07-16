import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const alumniLinks = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/profil', icon: '👤', label: 'Profil Saya' },
  { to: '/direktori', icon: '🎓', label: 'Direktori Alumni' },
  { to: '/event', icon: '📅', label: 'Event & Reuni' },
  { to: '/lowongan', icon: '💼', label: 'Lowongan Kerja' },
  { to: '/forum', icon: '💬', label: 'Forum Diskusi' },
  { to: '/donasi', icon: '💝', label: 'Donasi' },
  { to: '/pengumuman', icon: '📢', label: 'Pengumuman' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/admin/alumni', icon: '🎓', label: 'Data Alumni' },
  { to: '/admin/event', icon: '📅', label: 'Kelola Event' },
  { to: '/admin/donasi', icon: '💝', label: 'Kelola Donasi' },
  { to: '/admin/pengumuman', icon: '📢', label: 'Pengumuman' },
];

export default function Sidebar() {
  const { user, tipe, logout } = useAuth();
  const navigate = useNavigate();
  const links = tipe === 'admin' ? adminLinks : alumniLinks;
  const label = tipe === 'admin' ? 'Panel Admin' : 'Portal Alumni';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = user?.nama
    ? user.nama.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">🎓</div>
          <div>
            <div className="logo-text">SIALUMNI</div>
            <span className="logo-sub">{label}</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu Utama</div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">
            {user?.foto ? (
              <img src={`/uploads/${user.foto}`} alt={user.nama} />
            ) : (
              initials
            )}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.nama || 'User'}</div>
            <div className="user-role">{tipe === 'admin' ? `Admin • ${user?.role}` : `Angkatan ${user?.tahun_lulus || '-'}`}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            🚪
          </button>
        </div>
      </div>
    </aside>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';

import LoginAlumni from './pages/auth/LoginAlumni';
import LoginAdmin from './pages/auth/LoginAdmin';
import Register from './pages/auth/Register';

import DashboardAlumni from './pages/alumni/Dashboard';
import Profil from './pages/alumni/Profil';
import Direktori from './pages/alumni/Direktori';
import Event from './pages/alumni/Event';
import Lowongan from './pages/alumni/Lowongan';
import Forum from './pages/alumni/Forum';
import Donasi from './pages/alumni/Donasi';
import Pengumuman from './pages/alumni/Pengumuman';

import AdminDashboard from './pages/admin/Dashboard';
import AdminAlumni from './pages/admin/Alumni';
import AdminEvent from './pages/admin/Event';
import AdminDonasi from './pages/admin/Donasi';
import AdminPengumuman from './pages/admin/Pengumuman';

// Route guard: perlu login
function PrivateRoute({ children, allowedTipe }) {
  const { user, tipe, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedTipe && tipe !== allowedTipe) {
    return <Navigate to={tipe === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }
  return children;
}

// Layout dengan sidebar + navbar
function AppLayout({ children, title }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user, tipe, loading } = useAuth();
  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to={tipe === 'admin' ? '/admin/dashboard' : '/dashboard'} replace /> : <LoginAlumni />} />
      <Route path="/admin/login" element={user ? <Navigate to="/admin/dashboard" replace /> : <LoginAdmin />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Alumni routes */}
      <Route path="/dashboard" element={<PrivateRoute allowedTipe="alumni"><AppLayout><DashboardAlumni /></AppLayout></PrivateRoute>} />
      <Route path="/profil" element={<PrivateRoute allowedTipe="alumni"><AppLayout><Profil /></AppLayout></PrivateRoute>} />
      <Route path="/direktori" element={<PrivateRoute allowedTipe="alumni"><AppLayout><Direktori /></AppLayout></PrivateRoute>} />
      <Route path="/event" element={<PrivateRoute allowedTipe="alumni"><AppLayout><Event /></AppLayout></PrivateRoute>} />
      <Route path="/lowongan" element={<PrivateRoute allowedTipe="alumni"><AppLayout><Lowongan /></AppLayout></PrivateRoute>} />
      <Route path="/forum" element={<PrivateRoute allowedTipe="alumni"><AppLayout><Forum /></AppLayout></PrivateRoute>} />
      <Route path="/donasi" element={<PrivateRoute allowedTipe="alumni"><AppLayout><Donasi /></AppLayout></PrivateRoute>} />
      <Route path="/pengumuman" element={<PrivateRoute allowedTipe="alumni"><AppLayout><Pengumuman /></AppLayout></PrivateRoute>} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<PrivateRoute allowedTipe="admin"><AppLayout><AdminDashboard /></AppLayout></PrivateRoute>} />
      <Route path="/admin/alumni" element={<PrivateRoute allowedTipe="admin"><AppLayout><AdminAlumni /></AppLayout></PrivateRoute>} />
      <Route path="/admin/event" element={<PrivateRoute allowedTipe="admin"><AppLayout><AdminEvent /></AppLayout></PrivateRoute>} />
      <Route path="/admin/donasi" element={<PrivateRoute allowedTipe="admin"><AppLayout><AdminDonasi /></AppLayout></PrivateRoute>} />
      <Route path="/admin/pengumuman" element={<PrivateRoute allowedTipe="admin"><AppLayout><AdminPengumuman /></AppLayout></PrivateRoute>} />

      {/* Default redirect */}
      <Route path="/" element={
        !user ? <Navigate to="/login" replace /> :
        tipe === 'admin' ? <Navigate to="/admin/dashboard" replace /> :
        <Navigate to="/dashboard" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

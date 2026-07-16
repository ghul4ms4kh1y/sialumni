import { useState, useEffect } from 'react';
import { getAlumniList, verifikasiAlumni, deleteAlumni } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminAlumni() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [tahun, setTahun] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [msg, setMsg] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (tahun) params.tahun_lulus = tahun;
      const res = await getAlumniList(params);
      let data = res.data || [];
      if (filterStatus) data = data.filter(a => a.status_verifikasi === filterStatus);
      setAlumni(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleVerifikasi(id, status) {
    setActionLoading(id + status);
    try {
      await verifikasiAlumni(id, status);
      setMsg({ type: 'success', text: `Alumni berhasil di-${status === 'verified' ? 'verifikasi' : 'tolak'}!` });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMsg(null), 3000);
    }
  }

  async function handleDelete(id, nama) {
    if (!confirm(`Hapus data alumni "${nama}"? Aksi ini tidak dapat dibatalkan.`)) return;
    try {
      await deleteAlumni(id);
      setMsg({ type: 'success', text: 'Data alumni berhasil dihapus' });
      load();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const statusBadge = (s) => {
    if (s === 'verified') return <span className="badge badge-success">✅ Terverifikasi</span>;
    if (s === 'rejected') return <span className="badge badge-danger">❌ Ditolak</span>;
    return <span className="badge badge-warning">⏳ Pending</span>;
  };

  return (
    <div className="page-container" style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div><h1>Manajemen Alumni</h1><p>Kelola dan verifikasi data alumni</p></div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 16px', fontSize: 14, color: 'var(--text-secondary)' }}>
          {alumni.length} alumni
        </div>
      </div>

      {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 2, minWidth: 180 }}>
            <label className="form-label">Cari Nama / Email</label>
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label className="form-label">Status</label>
            <select className="form-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '10px 12px' }}>
              <option value="">Semua Status</option>
              <option value="pending">⏳ Pending</option>
              <option value="verified">✅ Terverifikasi</option>
              <option value="rejected">❌ Ditolak</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <label className="form-label">Tahun Lulus</label>
            <select className="form-input" value={tahun} onChange={e => setTahun(e.target.value)} style={{ padding: '10px 12px' }}>
              <option value="">Semua</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '10px 20px' }} onClick={load}>Cari</button>
          <button className="btn btn-secondary" style={{ alignSelf: 'flex-end', padding: '10px 16px' }}
            onClick={() => { setSearch(''); setFilterStatus(''); setTahun(''); load(); }}>Reset</button>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['', '📋 Semua'], ['pending', '⏳ Pending'], ['verified', '✅ Verified'], ['rejected', '❌ Ditolak']].map(([val, label]) => (
          <button key={val} className={`btn btn-sm ${filterStatus === val ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus(val)}>{label}</button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : alumni.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎓</div>
          <h3>Tidak ada alumni</h3>
          <p>Coba ubah filter pencarian</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Alumni</th>
                <th>Angkatan</th>
                <th>Kontak</th>
                <th>Kota</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {alumni.map((a) => {
                const initials = a.nama?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';
                return (
                  <tr key={a.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{a.nama}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-info">{a.tahun_lulus}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a.no_hp || '-'}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a.kota_domisili || '-'}</td>
                    <td>{statusBadge(a.status_verifikasi)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {a.status_verifikasi !== 'verified' && (
                          <button
                            className="btn btn-success btn-sm"
                            disabled={actionLoading === a.id + 'verified'}
                            onClick={() => handleVerifikasi(a.id, 'verified')}
                          >✅ Verifikasi</button>
                        )}
                        {a.status_verifikasi !== 'rejected' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            disabled={actionLoading === a.id + 'rejected'}
                            onClick={() => handleVerifikasi(a.id, 'rejected')}
                          >❌ Tolak</button>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(a.id, a.nama)}
                        >🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

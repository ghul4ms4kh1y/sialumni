import { useState, useEffect } from 'react';
import { getDonasi, getRingkasanDonasi, verifikasiDonasi } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDonasi() {
  const [list, setList] = useState([]);
  const [ringkasan, setRingkasan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [msg, setMsg] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [dRes, rRes] = await Promise.all([getDonasi(), getRingkasanDonasi()]);
      setList(dRes.data || []);
      setRingkasan(rRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleVerifikasi(id, status) {
    setActionLoading(id + status);
    try {
      await verifikasiDonasi(id, status);
      setMsg({ type: 'success', text: `Donasi berhasil di-${status === 'terverifikasi' ? 'verifikasi' : 'tolak'}!` });
      load();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    finally {
      setActionLoading(null);
      setTimeout(() => setMsg(null), 3000);
    }
  }

  const formatRp = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);

  const statusBadge = (s) => {
    if (s === 'terverifikasi') return <span className="badge badge-success">✅ Terverifikasi</span>;
    if (s === 'ditolak') return <span className="badge badge-danger">❌ Ditolak</span>;
    return <span className="badge badge-warning">⏳ Pending</span>;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container" style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div><h1>Kelola Donasi</h1><p>Verifikasi donasi dari alumni</p></div>
      </div>

      {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}

      {/* Summary Cards */}
      {ringkasan && (
        <div className="stat-cards" style={{ marginBottom: 24 }}>
          <div className="stat-card green">
            <div className="stat-icon">💰</div>
            <div className="stat-value" style={{ fontSize: 22 }}>{formatRp(ringkasan.total_terverifikasi || 0)}</div>
            <div className="stat-label">Total Terkumpul</div>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{ringkasan.donasi_pending || 0}</div>
            <div className="stat-label">Menunggu Verifikasi</div>
          </div>
          <div className="stat-card indigo">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{ringkasan.jumlah_donatur || 0}</div>
            <div className="stat-label">Jumlah Donatur</div>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Nama Alumni</th>
              <th>Jumlah</th>
              <th>Tujuan</th>
              <th>Catatan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                Belum ada donasi masuk
              </td></tr>
            ) : list.map((d) => (
              <tr key={d.id}>
                <td style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{d.nama_alumni || '-'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.email_alumni || ''}</div>
                </td>
                <td style={{ fontWeight: 700, color: 'var(--success)', fontSize: 15 }}>{formatRp(d.jumlah)}</td>
                <td style={{ fontSize: 13 }}>{d.tujuan || '-'}</td>
                <td style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 200 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.catatan || '-'}</div>
                </td>
                <td>{statusBadge(d.status)}</td>
                <td>
                  {d.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-success btn-sm"
                        disabled={!!actionLoading}
                        onClick={() => handleVerifikasi(d.id, 'terverifikasi')}
                      >✅ Verifikasi</button>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={!!actionLoading}
                        onClick={() => handleVerifikasi(d.id, 'ditolak')}
                      >❌ Tolak</button>
                    </div>
                  )}
                  {d.status !== 'pending' && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

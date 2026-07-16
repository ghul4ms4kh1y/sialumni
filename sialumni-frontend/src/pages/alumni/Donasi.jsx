import { useState, useEffect } from 'react';
import { getDonasi, getRingkasanDonasi, createDonasi } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';

export default function Donasi() {
  const [list, setList] = useState([]);
  const [ringkasan, setRingkasan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ jumlah: '', tujuan: '', catatan: '' });
  const [msg, setMsg] = useState(null);

  async function load() {
    try {
      const [donRes, ringRes] = await Promise.all([getDonasi(), getRingkasanDonasi()]);
      setList(donRes.data || []);
      setRingkasan(ringRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createDonasi({ ...form, jumlah: parseFloat(form.jumlah) });
      setShowModal(false);
      setForm({ jumlah: '', tujuan: '', catatan: '' });
      setMsg({ type: 'success', text: 'Donasi berhasil dicatat! Menunggu verifikasi admin.' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
    setTimeout(() => setMsg(null), 4000);
  }

  if (loading) return <LoadingSpinner />;

  const formatRp = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);

  const statusBadge = (s) => {
    if (s === 'terverifikasi') return <span className="badge badge-success">✅ Terverifikasi</span>;
    if (s === 'ditolak') return <span className="badge badge-danger">❌ Ditolak</span>;
    return <span className="badge badge-warning">⏳ Pending</span>;
  };

  return (
    <div className="page-container" style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div><h1>Donasi</h1><p>Berkontribusi untuk almamater</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>💝 Donasi Sekarang</button>
      </div>

      {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}

      {/* Ringkasan */}
      {ringkasan && (
        <div className="donasi-summary" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>💰 Total Donasi Terkumpul</div>
          <div className="amount">{formatRp(ringkasan.total_terverifikasi || ringkasan.total || 0)}</div>
          <div className="label">dari {ringkasan.jumlah_donatur || 0} donatur alumni</div>
        </div>
      )}

      {/* Riwayat Donasi */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 Riwayat Donasi Saya</div>
        </div>
        {list.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 0' }}>
            <div className="empty-icon">💝</div>
            <h3>Belum ada donasi</h3>
            <p>Mulai berkontribusi untuk sekolah kita bersama</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Donasi Pertama</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Jumlah</th>
                  <th>Tujuan</th>
                  <th>Status</th>
                  <th>Catatan</th>
                </tr>
              </thead>
              <tbody>
                {list.map((d) => (
                  <tr key={d.id}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      {new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>{formatRp(d.jumlah)}</td>
                    <td>{d.tujuan || '-'}</td>
                    <td>{statusBadge(d.status)}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{d.catatan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="💝 Catat Donasi Baru"
        actions={<>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
          <button className="btn btn-primary" form="form-donasi" type="submit">Catat Donasi</button>
        </>}>
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          ℹ️ Setelah donasi dicatat, admin akan memverifikasi berdasarkan bukti transfer Anda.
        </div>
        <form id="form-donasi" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Jumlah Donasi (Rp) *</label>
            <input className="form-input" type="number" min="1000" placeholder="100000" value={form.jumlah} onChange={e => setForm({ ...form, jumlah: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Tujuan Donasi</label>
            <input className="form-input" placeholder="Renovasi perpustakaan, beasiswa, dst." value={form.tujuan} onChange={e => setForm({ ...form, tujuan: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Catatan / Pesan</label>
            <textarea className="form-input" placeholder="Pesan atau catatan untuk admin..." value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

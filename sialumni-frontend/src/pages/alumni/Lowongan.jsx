import { useState, useEffect } from 'react';
import { getLowongan, createLowongan, deleteLowongan } from '../../api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';

export default function Lowongan() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('aktif');
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ judul: '', nama_perusahaan: '', lokasi: '', deskripsi: '', link_lamaran: '', status: 'aktif' });

  async function load() {
    setLoading(true);
    try {
      const res = await getLowongan(filterStatus ? { status: filterStatus } : {});
      setList(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filterStatus]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createLowongan(form);
      setShowModal(false);
      setForm({ judul: '', nama_perusahaan: '', lokasi: '', deskripsi: '', link_lamaran: '', status: 'aktif' });
      setMsg({ type: 'success', text: 'Lowongan berhasil diposting!' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
    setTimeout(() => setMsg(null), 3000);
  }

  async function handleDelete(id) {
    if (!confirm('Hapus lowongan ini?')) return;
    try { await deleteLowongan(id); load(); } catch (err) { setMsg({ type: 'error', text: err.message }); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container" style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div>
          <h1>Lowongan Kerja</h1>
          <p>Info karier dari sesama alumni</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Posting Lowongan</button>
      </div>

      {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['aktif', '✅ Aktif'], ['ditutup', '🔒 Ditutup'], ['', '📋 Semua']].map(([val, label]) => (
          <button key={val} className={`btn btn-sm ${filterStatus === val ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus(val)}>{label}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💼</div>
          <h3>Belum ada lowongan</h3>
          <p>Jadilah yang pertama memposting lowongan kerja!</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Posting Sekarang</button>
        </div>
      ) : (
        <div className="grid-auto">
          {list.map((l) => (
            <div key={l.id} className="card" style={{ gap: 12, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 44, height: 44, background: 'var(--gradient)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💼</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{l.judul}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>🏢 {l.nama_perusahaan || '-'}</div>
                  </div>
                </div>
                <span className={`badge ${l.status === 'aktif' ? 'badge-success' : 'badge-default'}`}>
                  {l.status === 'aktif' ? '✅ Aktif' : '🔒 Ditutup'}
                </span>
              </div>
              {l.lokasi && <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📍 {l.lokasi}</div>}
              {l.deskripsi && (
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {l.deskripsi}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', flex: 1 }}>
                  👤 {l.nama_poster || 'Alumni'} • {new Date(l.created_at).toLocaleDateString('id-ID')}
                </div>
                {l.link_lamaran && (
                  <a href={l.link_lamaran} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                    Lamar →
                  </a>
                )}
                {l.alumni_id === user?.id && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l.id)}>Hapus</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Posting Lowongan Kerja"
        actions={<>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
          <button className="btn btn-primary" form="form-lowongan" type="submit">Posting</button>
        </>}>
        <form id="form-lowongan" onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Judul Posisi *</label>
            <input className="form-input" placeholder="Software Engineer, Marketing Manager, dst." value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Nama Perusahaan</label>
              <input className="form-input" placeholder="PT. ..." value={form.nama_perusahaan} onChange={e => setForm({ ...form, nama_perusahaan: e.target.value })} />
            </div>
            <div className="form-group"><label className="form-label">Lokasi</label>
              <input className="form-input" placeholder="Jakarta, Remote, dst." value={form.lokasi} onChange={e => setForm({ ...form, lokasi: e.target.value })} />
            </div>
          </div>
          <div className="form-group"><label className="form-label">Deskripsi</label>
            <textarea className="form-input" placeholder="Deskripsi posisi dan kualifikasi..." value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} />
          </div>
          <div className="form-group"><label className="form-label">Link Lamaran</label>
            <input className="form-input" type="url" placeholder="https://..." value={form.link_lamaran} onChange={e => setForm({ ...form, link_lamaran: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { getPengumuman, createPengumuman, deletePengumuman } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';

export default function AdminPengumuman() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ judul: '', isi: '' });
  const [msg, setMsg] = useState(null);

  async function load() {
    try {
      const res = await getPengumuman();
      setList(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createPengumuman(form);
      setShowModal(false);
      setForm({ judul: '', isi: '' });
      setMsg({ type: 'success', text: 'Pengumuman berhasil dibuat!' });
      load();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    setTimeout(() => setMsg(null), 3000);
  }

  async function handleDelete(id, judul) {
    if (!confirm(`Hapus pengumuman "${judul}"?`)) return;
    try { await deletePengumuman(id); load(); } catch (err) { setMsg({ type: 'error', text: err.message }); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container" style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div><h1>Pengumuman</h1><p>Kirim informasi ke seluruh alumni</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Buat Pengumuman</button>
      </div>

      {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}

      {list.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📢</div>
          <h3>Belum ada pengumuman</h3>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Buat Pengumuman Pertama</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {list.map((p) => (
            <div key={p.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 16, flex: 1 }}>
                  <div style={{ width: 48, height: 48, background: 'var(--gradient)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                    📢
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{p.judul}</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>{p.isi}</p>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      📅 {new Date(p.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" style={{ flexShrink: 0, marginLeft: 16 }} onClick={() => handleDelete(p.id, p.judul)}>
                  🗑️ Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="📢 Buat Pengumuman Baru"
        actions={<>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
          <button className="btn btn-primary" form="form-pengumuman" type="submit">Kirim Pengumuman</button>
        </>}>
        <form id="form-pengumuman" onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Judul Pengumuman *</label>
            <input className="form-input" placeholder="Judul pengumuman..." value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} required />
          </div>
          <div className="form-group"><label className="form-label">Isi Pengumuman *</label>
            <textarea className="form-input" placeholder="Tulis isi pengumuman di sini..." value={form.isi} onChange={e => setForm({ ...form, isi: e.target.value })} required style={{ minHeight: 160 }} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

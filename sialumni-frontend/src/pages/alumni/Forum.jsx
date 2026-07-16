import { useState, useEffect } from 'react';
import { getForumPosts, createForumPost, deleteForumPost, getForumDetail, addKomentar, deleteKomentar } from '../../api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';

export default function Forum() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postDetail, setPostDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState({ judul: '', isi: '', angkatan: '' });
  const [komentar, setKomentar] = useState('');
  const [msg, setMsg] = useState(null);

  async function load() {
    try {
      const res = await getForumPosts();
      setPosts(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function loadDetail(id) {
    setDetailLoading(true);
    try {
      const res = await getForumDetail(id);
      setPostDetail(res.data);
    } catch (e) { console.error(e); }
    finally { setDetailLoading(false); }
  }

  function openPost(post) {
    setSelectedPost(post);
    loadDetail(post.id);
  }

  async function handleCreatePost(e) {
    e.preventDefault();
    try {
      await createForumPost(form);
      setShowModal(false);
      setForm({ judul: '', isi: '', angkatan: '' });
      setMsg({ type: 'success', text: 'Postingan berhasil dibuat!' });
      load();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    setTimeout(() => setMsg(null), 3000);
  }

  async function handleDeletePost(id) {
    if (!confirm('Hapus postingan ini?')) return;
    try { await deleteForumPost(id); setSelectedPost(null); load(); } catch (err) { setMsg({ type: 'error', text: err.message }); }
  }

  async function handleAddKomentar(e) {
    e.preventDefault();
    if (!komentar.trim()) return;
    try {
      await addKomentar(selectedPost.id, komentar);
      setKomentar('');
      loadDetail(selectedPost.id);
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
  }

  async function handleDeleteKomentar(kid) {
    if (!confirm('Hapus komentar?')) return;
    try { await deleteKomentar(kid); loadDetail(selectedPost.id); } catch (err) { setMsg({ type: 'error', text: err.message }); }
  }

  if (loading) return <LoadingSpinner />;

  const initials = (nama) => nama?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div className="page-container" style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div><h1>Forum Diskusi</h1><p>Diskusi antar alumni</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Buat Post</button>
      </div>

      {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}

      <div className="grid-2">
        {/* Post List */}
        <div>
          {posts.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">💬</div><h3>Belum ada diskusi</h3>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>Mulai Diskusi</button>
            </div>
          ) : posts.map((p) => (
            <div key={p.id}
              className="forum-post"
              style={{ cursor: 'pointer', border: selectedPost?.id === p.id ? '1px solid var(--accent-1)' : '1px solid var(--border)' }}
              onClick={() => openPost(p)}
            >
              <div className="forum-meta">
                <div className="forum-author">
                  <div className="avatar-sm" style={{ background: 'var(--gradient)', color: 'white', fontWeight: 700 }}>
                    {initials(p.nama_alumni || 'A')}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.nama_alumni || 'Alumni'}</div>
                    {p.angkatan && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Angkatan {p.angkatan}</div>}
                  </div>
                </div>
                <span className="forum-time">{new Date(p.created_at).toLocaleDateString('id-ID')}</span>
              </div>
              {p.judul && <div className="forum-title-text">{p.judul}</div>}
              <div className="forum-body">{p.isi}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                💬 {p.jumlah_komentar || 0} komentar
              </div>
            </div>
          ))}
        </div>

        {/* Post Detail */}
        <div>
          {!selectedPost ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
              <p style={{ color: 'var(--text-secondary)' }}>Pilih postingan untuk membaca diskusi</p>
            </div>
          ) : (
            <div className="card" style={{ position: 'sticky', top: 80 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div className="forum-author">
                  <div className="avatar-sm" style={{ background: 'var(--gradient)', color: 'white', fontWeight: 700 }}>
                    {initials(selectedPost.nama_alumni || 'A')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{selectedPost.nama_alumni || 'Alumni'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(selectedPost.created_at).toLocaleDateString('id-ID')}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {selectedPost.alumni_id === user?.id && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeletePost(selectedPost.id)}>Hapus</button>
                  )}
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedPost(null)}>✕</button>
                </div>
              </div>
              {selectedPost.judul && <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{selectedPost.judul}</h3>}
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>{selectedPost.isi}</p>

              <div className="comment-section">
                <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>
                  💬 Komentar {detailLoading ? '...' : `(${postDetail?.komentar?.length || 0})`}
                </div>
                {detailLoading ? <LoadingSpinner text="Memuat komentar..." /> : (
                  (postDetail?.komentar || []).map((k) => (
                    <div key={k.id} className="comment">
                      <div className="avatar-sm" style={{ background: 'var(--gradient)', color: 'white', fontWeight: 700, fontSize: 11, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {initials(k.nama_alumni || 'A')}
                      </div>
                      <div className="comment-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <div className="comment-author">{k.nama_alumni || 'Alumni'}</div>
                          {k.alumni_id === user?.id && (
                            <button className="btn btn-danger" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => handleDeleteKomentar(k.id)}>✕</button>
                          )}
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>{k.isi}</p>
                      </div>
                    </div>
                  ))
                )}
                <form onSubmit={handleAddKomentar} style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <input
                    className="form-input"
                    placeholder="Tulis komentar..."
                    value={komentar}
                    onChange={(e) => setKomentar(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px' }}
                  />
                  <button type="submit" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>Kirim</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Buat Postingan Forum"
        actions={<>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
          <button className="btn btn-primary" form="form-forum" type="submit">Post</button>
        </>}>
        <form id="form-forum" onSubmit={handleCreatePost}>
          <div className="form-group"><label className="form-label">Judul (opsional)</label>
            <input className="form-input" placeholder="Judul diskusi..." value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} />
          </div>
          <div className="form-group"><label className="form-label">Isi Postingan *</label>
            <textarea className="form-input" placeholder="Apa yang ingin Anda diskusikan?" value={form.isi} onChange={e => setForm({ ...form, isi: e.target.value })} required style={{ minHeight: 120 }} />
          </div>
          <div className="form-group"><label className="form-label">Khusus Angkatan (kosongkan untuk umum)</label>
            <input className="form-input" type="number" placeholder="Contoh: 2020" value={form.angkatan} onChange={e => setForm({ ...form, angkatan: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

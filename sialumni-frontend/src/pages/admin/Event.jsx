import { useState, useEffect } from 'react';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';

const emptyForm = { judul: '', deskripsi: '', lokasi: '', tanggal_mulai: '', tanggal_selesai: '' };

export default function AdminEvent() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState(null);

  async function load() {
    try {
      const res = await getEvents();
      setEvents(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setForm(emptyForm); setEditEvent(null); setShowModal(true); }
  function openEdit(ev) {
    setEditEvent(ev);
    setForm({
      judul: ev.judul, deskripsi: ev.deskripsi || '', lokasi: ev.lokasi || '',
      tanggal_mulai: ev.tanggal_mulai?.slice(0, 16) || '',
      tanggal_selesai: ev.tanggal_selesai?.slice(0, 16) || '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editEvent) {
        await updateEvent(editEvent.id, form);
        setMsg({ type: 'success', text: 'Event berhasil diperbarui!' });
      } else {
        await createEvent(form);
        setMsg({ type: 'success', text: 'Event berhasil dibuat!' });
      }
      setShowModal(false);
      load();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    setTimeout(() => setMsg(null), 3000);
  }

  async function handleDelete(id, judul) {
    if (!confirm(`Hapus event "${judul}"?`)) return;
    try { await deleteEvent(id); load(); } catch (err) { setMsg({ type: 'error', text: err.message }); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container" style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div><h1>Kelola Event</h1><p>Buat dan kelola event reuni alumni</p></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Buat Event</button>
      </div>

      {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}

      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>Belum ada event</h3>
          <button className="btn btn-primary" onClick={openCreate}>Buat Event Pertama</button>
        </div>
      ) : (
        <div className="grid-auto">
          {events.map((ev) => {
            const start = new Date(ev.tanggal_mulai);
            const isUpcoming = start > new Date();
            return (
              <div key={ev.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{
                      background: isUpcoming ? 'var(--gradient)' : 'var(--bg-card)',
                      borderRadius: 'var(--radius-sm)', padding: '10px 14px', textAlign: 'center', minWidth: 56, flexShrink: 0
                    }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: isUpcoming ? 'white' : 'var(--text-secondary)' }}>{start.getDate()}</div>
                      <div style={{ fontSize: 10, color: isUpcoming ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        {start.toLocaleString('id-ID', { month: 'short' })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{ev.judul}</div>
                      {ev.lokasi && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>📍 {ev.lokasi}</div>}
                    </div>
                  </div>
                  <span className={`badge ${isUpcoming ? 'badge-success' : 'badge-default'}`}>
                    {isUpcoming ? '⏰ Mendatang' : '✓ Selesai'}
                  </span>
                </div>
                {ev.deskripsi && (
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ev.deskripsi}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(ev)}>✏️ Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ev.id, ev.judul)}>🗑️ Hapus</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editEvent ? 'Edit Event' : 'Buat Event Baru'}
        actions={<>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
          <button className="btn btn-primary" form="form-event" type="submit">{editEvent ? 'Simpan' : 'Buat Event'}</button>
        </>}>
        <form id="form-event" onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Judul Event *</label>
            <input className="form-input" placeholder="Reuni Akbar 2025" value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} required />
          </div>
          <div className="form-group"><label className="form-label">Lokasi</label>
            <input className="form-input" placeholder="Aula Sekolah / Online" value={form.lokasi} onChange={e => setForm({ ...form, lokasi: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Tanggal Mulai *</label>
              <input className="form-input" type="datetime-local" value={form.tanggal_mulai} onChange={e => setForm({ ...form, tanggal_mulai: e.target.value })} required />
            </div>
            <div className="form-group"><label className="form-label">Tanggal Selesai</label>
              <input className="form-input" type="datetime-local" value={form.tanggal_selesai} onChange={e => setForm({ ...form, tanggal_selesai: e.target.value })} />
            </div>
          </div>
          <div className="form-group"><label className="form-label">Deskripsi</label>
            <textarea className="form-input" placeholder="Deskripsi event..." value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

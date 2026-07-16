import { useState, useEffect } from 'react';
import { getEvents, rsvpEvent } from '../../api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Event() {
  const { tipe } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(null);
  const [msg, setMsg] = useState(null);

  async function load() {
    try {
      const res = await getEvents();
      setEvents(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleRSVP(eventId, status) {
    setRsvpLoading(eventId);
    try {
      await rsvpEvent(eventId, status);
      setMsg({ type: 'success', text: `RSVP berhasil: ${status}` });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setRsvpLoading(null);
      setTimeout(() => setMsg(null), 3000);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container" style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div>
          <h1>Event & Reuni</h1>
          <p>Agenda kegiatan dan reuni alumni</p>
        </div>
      </div>

      {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}

      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>Belum ada event</h3>
          <p>Admin belum membuat event apapun</p>
        </div>
      ) : (
        <div className="grid-auto">
          {events.map((ev) => {
            const start = new Date(ev.tanggal_mulai);
            const isUpcoming = start > new Date();
            return (
              <div key={ev.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden' }}>
                {/* Date Banner */}
                <div style={{ background: 'var(--gradient)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 36, fontWeight: 900, color: 'white', lineHeight: 1 }}>{start.getDate()}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {start.toLocaleString('id-ID', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{ev.judul}</div>
                    {isUpcoming ? (
                      <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '2px 10px', borderRadius: 99, fontSize: 12, marginTop: 4, display: 'inline-block' }}>
                        ⏰ Mendatang
                      </span>
                    ) : (
                      <span style={{ background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.7)', padding: '2px 10px', borderRadius: 99, fontSize: 12, marginTop: 4, display: 'inline-block' }}>
                        ✓ Selesai
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ padding: '20px 24px', flex: 1 }}>
                  {ev.deskripsi && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {ev.deskripsi}
                    </p>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {ev.lokasi && (
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>📍</span> {ev.lokasi}
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>🕐</span>
                      {start.toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {tipe === 'alumni' && isUpcoming && (
                  <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-success btn-sm"
                      style={{ flex: 1 }}
                      disabled={rsvpLoading === ev.id}
                      onClick={() => handleRSVP(ev.id, 'hadir')}
                    >
                      ✅ Hadir
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                      disabled={rsvpLoading === ev.id}
                      onClick={() => handleRSVP(ev.id, 'mungkin')}
                    >
                      🤔 Mungkin
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ flex: 1 }}
                      disabled={rsvpLoading === ev.id}
                      onClick={() => handleRSVP(ev.id, 'tidak_hadir')}
                    >
                      ❌ Tidak
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { getPengumuman } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Pengumuman() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getPengumuman()
      .then((res) => setList(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container" style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div><h1>Pengumuman</h1><p>Informasi resmi dari sekolah</p></div>
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📢</div>
          <h3>Belum ada pengumuman</h3>
          <p>Admin belum membuat pengumuman apapun</p>
        </div>
      ) : (
        <div className="grid-2">
          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {list.map((p) => (
              <div key={p.id}
                className="card"
                style={{ cursor: 'pointer', border: selected?.id === p.id ? '1px solid var(--accent-1)' : '1px solid var(--border)', padding: '16px 20px' }}
                onClick={() => setSelected(p)}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-sm)',
                    background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 22, flexShrink: 0
                  }}>📢</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{p.judul}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.isi}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                      {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          <div>
            {!selected ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px', position: 'sticky', top: 80 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📢</div>
                <p style={{ color: 'var(--text-secondary)' }}>Pilih pengumuman untuk membaca selengkapnya</p>
              </div>
            ) : (
              <div className="card" style={{ position: 'sticky', top: 80 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📢</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>{selected.judul}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {new Date(selected.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div style={{ width: '100%', height: 1, background: 'var(--border)', marginBottom: 20 }} />
                <div style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {selected.isi}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

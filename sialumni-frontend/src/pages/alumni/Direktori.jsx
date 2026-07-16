import { useState, useEffect } from 'react';
import { getAlumniList } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Direktori() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tahun, setTahun] = useState('');
  const [kota, setKota] = useState('');

  async function load(params = {}) {
    setLoading(true);
    try {
      const res = await getAlumniList(params);
      setAlumni(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function handleSearch(e) {
    e.preventDefault();
    const params = {};
    if (search) params.search = search;
    if (tahun) params.tahun_lulus = tahun;
    if (kota) params.kota_domisili = kota;
    load(params);
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="page-container" style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div>
          <h1>Direktori Alumni</h1>
          <p>Temukan dan terhubung dengan sesama alumni</p>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 16px', fontSize: 14, color: 'var(--text-secondary)' }}>
          {alumni.length} alumni ditemukan
        </div>
      </div>

      {/* Search & Filter */}
      <div className="card" style={{ marginBottom: 24 }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 2, minWidth: 200 }}>
              <label className="form-label">Cari Nama</label>
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Nama alumni..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label className="form-label">Tahun Lulus</label>
              <select className="form-input" value={tahun} onChange={(e) => setTahun(e.target.value)} style={{ padding: '10px 16px' }}>
                <option value="">Semua angkatan</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label className="form-label">Kota Domisili</label>
              <input className="form-input" placeholder="Kota..." value={kota} onChange={(e) => setKota(e.target.value)} style={{ padding: '10px 16px' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', alignSelf: 'flex-end' }}>
              🔍 Cari
            </button>
            <button type="button" className="btn btn-secondary" style={{ padding: '10px 16px', alignSelf: 'flex-end' }}
              onClick={() => { setSearch(''); setTahun(''); setKota(''); load(); }}>
              Reset
            </button>
          </div>
        </form>
      </div>

      {loading ? <LoadingSpinner /> : alumni.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Tidak ada hasil</h3>
          <p>Coba ubah kata kunci pencarian Anda</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {alumni.map((a) => {
            const initials = a.nama?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';
            return (
              <div key={a.id} className="card" style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="alumni-card-avatar">
                  {a.foto ? <img src={`/uploads/${a.foto}`} alt={a.nama} /> : initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="alumni-card-name">{a.nama}</div>
                  <div className="alumni-card-meta">
                    <span>🎓 {a.tahun_lulus}</span>
                    {a.kota_domisili && <span>📍 {a.kota_domisili}</span>}
                  </div>
                  {a.media_sosial && a.privasi_kontak === 'publik' && (
                    <a href={a.media_sosial} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: 'var(--accent-1)', marginTop: 6, display: 'block' }}>
                      🔗 Media Sosial
                    </a>
                  )}
                </div>
                <span className="badge badge-success" style={{ flexShrink: 0 }}>✓</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

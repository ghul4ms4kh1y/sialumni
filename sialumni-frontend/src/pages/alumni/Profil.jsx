import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getAlumniDetail,
  updateAlumni,
  uploadFotoAlumni,
  tambahPendidikan,
  hapusPendidikan,
  tambahPekerjaan,
  hapusPekerjaan,
} from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';

export default function Profil() {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profil');
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showPendidikanModal, setShowPendidikanModal] = useState(false);
  const [showPekerjaanModal, setShowPekerjaanModal] = useState(false);
  const [pendidikanForm, setPendidikanForm] = useState({ jenjang: '', nama_institusi: '', jurusan: '', tahun_mulai: '', tahun_selesai: '' });
  const [pekerjaanForm, setPekerjaanForm] = useState({ nama_perusahaan: '', posisi: '', bidang_industri: '', tahun_mulai: '', tahun_selesai: '', is_current: false });

  async function load() {
    try {
      const res = await getAlumniDetail(user.id);
      setData(res.data);
      const u = res.data.alumni;
      setEditForm({
        nama: u.nama || '', no_hp: u.no_hp || '', kota_domisili: u.kota_domisili || '',
        alamat: u.alamat || '', media_sosial: u.media_sosial || '', privasi_kontak: u.privasi_kontak || 'privat',
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAlumni(user.id, editForm);
      setMsg({ type: 'success', text: 'Profil berhasil diperbarui!' });
      updateUser({ ...user, ...editForm });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 3000);
    }
  }

  async function handleFotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('foto', file);
    try {
      await uploadFotoAlumni(user.id, fd);
      setMsg({ type: 'success', text: 'Foto berhasil diupload!' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  }

  async function handleTambahPendidikan(e) {
    e.preventDefault();
    try {
      await tambahPendidikan(user.id, pendidikanForm);
      setShowPendidikanModal(false);
      setPendidikanForm({ jenjang: '', nama_institusi: '', jurusan: '', tahun_mulai: '', tahun_selesai: '' });
      load();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
  }

  async function handleHapusPendidikan(pid) {
    if (!confirm('Hapus data pendidikan ini?')) return;
    try { await hapusPendidikan(user.id, pid); load(); } catch (err) { setMsg({ type: 'error', text: err.message }); }
  }

  async function handleTambahPekerjaan(e) {
    e.preventDefault();
    try {
      await tambahPekerjaan(user.id, { ...pekerjaanForm, is_current: pekerjaanForm.is_current ? 1 : 0 });
      setShowPekerjaanModal(false);
      setPekerjaanForm({ nama_perusahaan: '', posisi: '', bidang_industri: '', tahun_mulai: '', tahun_selesai: '', is_current: false });
      load();
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
  }

  async function handleHapusPekerjaan(pid) {
    if (!confirm('Hapus data pekerjaan ini?')) return;
    try { await hapusPekerjaan(user.id, pid); load(); } catch (err) { setMsg({ type: 'error', text: err.message }); }
  }

  if (loading) return <LoadingSpinner />;

  const alumni = data?.alumni;
  const initials = alumni?.nama?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div className="page-container" style={{ animation: 'fadeInUp 0.4s ease' }}>
      <div className="page-header">
        <div>
          <h1>Profil Saya</h1>
          <p>Kelola informasi pribadi dan riwayat Anda</p>
        </div>
      </div>

      {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="profile-header">
          <div className="profile-avatar-large" style={{ position: 'relative' }}>
            {alumni?.foto ? <img src={`/uploads/${alumni.foto}`} alt={alumni.nama} /> : initials}
            <label htmlFor="foto-upload" style={{
              position: 'absolute', bottom: 0, right: 0, background: 'var(--accent-1)',
              borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', fontSize: 14,
            }}>📷</label>
            <input id="foto-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFotoUpload} />
          </div>
          <div className="profile-info">
            <h2>{alumni?.nama}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{alumni?.email}</p>
            <div className="profile-tags">
              <span className="badge badge-info">Angkatan {alumni?.tahun_lulus}</span>
              <span className={`badge ${alumni?.status_verifikasi === 'verified' ? 'badge-success' : alumni?.status_verifikasi === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                {alumni?.status_verifikasi === 'verified' ? '✅ Terverifikasi' : alumni?.status_verifikasi === 'pending' ? '⏳ Menunggu' : '❌ Ditolak'}
              </span>
              {alumni?.kota_domisili && <span className="badge badge-default">📍 {alumni.kota_domisili}</span>}
            </div>
          </div>
        </div>

        <div className="tabs">
          {[['profil', '👤 Profil'], ['pendidikan', '🎓 Pendidikan'], ['pekerjaan', '💼 Pekerjaan']].map(([key, label]) => (
            <button key={key} className={`tab-btn ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'profil' && (
          <form onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input className="form-input" value={editForm.nama || ''} onChange={e => setEditForm({ ...editForm, nama: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">No. HP</label>
                <input className="form-input" value={editForm.no_hp || ''} onChange={e => setEditForm({ ...editForm, no_hp: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Kota Domisili</label>
                <input className="form-input" value={editForm.kota_domisili || ''} onChange={e => setEditForm({ ...editForm, kota_domisili: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Media Sosial</label>
                <input className="form-input" placeholder="Link Instagram/LinkedIn" value={editForm.media_sosial || ''} onChange={e => setEditForm({ ...editForm, media_sosial: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Alamat</label>
              <textarea className="form-input" value={editForm.alamat || ''} onChange={e => setEditForm({ ...editForm, alamat: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Privasi Kontak</label>
              <select className="form-input" value={editForm.privasi_kontak || 'privat'} onChange={e => setEditForm({ ...editForm, privasi_kontak: e.target.value })}>
                <option value="publik">Publik (dapat dilihat semua alumni)</option>
                <option value="privat">Privat (hanya admin)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
            </button>
          </form>
        )}

        {activeTab === 'pendidikan' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowPendidikanModal(true)}>+ Tambah Pendidikan</button>
            </div>
            {(data?.pendidikan || []).length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🎓</div><p>Belum ada data pendidikan lanjutan</p></div>
            ) : (
              data.pendidikan.map((p) => (
                <div key={p.id} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{p.nama_institusi}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{p.jenjang} — {p.jurusan}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{p.tahun_mulai} — {p.tahun_selesai || 'Sekarang'}</div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => handleHapusPendidikan(p.id)}>Hapus</button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'pekerjaan' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowPekerjaanModal(true)}>+ Tambah Pekerjaan</button>
            </div>
            {(data?.pekerjaan || []).length === 0 ? (
              <div className="empty-state"><div className="empty-icon">💼</div><p>Belum ada data pekerjaan</p></div>
            ) : (
              data.pekerjaan.map((p) => (
                <div key={p.id} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{p.posisi}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>🏢 {p.nama_perusahaan} • {p.bidang_industri}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{p.tahun_mulai} — {p.is_current ? 'Sekarang' : (p.tahun_selesai || '-')}</div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => handleHapusPekerjaan(p.id)}>Hapus</button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal Pendidikan */}
      <Modal isOpen={showPendidikanModal} onClose={() => setShowPendidikanModal(false)} title="Tambah Pendidikan Lanjutan"
        actions={<>
          <button className="btn btn-secondary" onClick={() => setShowPendidikanModal(false)}>Batal</button>
          <button className="btn btn-primary" form="form-pendidikan" type="submit">Simpan</button>
        </>}>
        <form id="form-pendidikan" onSubmit={handleTambahPendidikan}>
          <div className="form-group"><label className="form-label">Jenjang *</label>
            <select className="form-input" value={pendidikanForm.jenjang} onChange={e => setPendidikanForm({ ...pendidikanForm, jenjang: e.target.value })} required>
              <option value="">Pilih jenjang</option>
              {['SMP','SMA/SMK','D3','S1','S2','S3','Non-Formal'].map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Nama Institusi *</label>
            <input className="form-input" placeholder="Nama universitas/sekolah" value={pendidikanForm.nama_institusi} onChange={e => setPendidikanForm({ ...pendidikanForm, nama_institusi: e.target.value })} required />
          </div>
          <div className="form-group"><label className="form-label">Jurusan</label>
            <input className="form-input" placeholder="Program studi/jurusan" value={pendidikanForm.jurusan} onChange={e => setPendidikanForm({ ...pendidikanForm, jurusan: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Tahun Mulai</label>
              <input className="form-input" type="number" placeholder="2020" value={pendidikanForm.tahun_mulai} onChange={e => setPendidikanForm({ ...pendidikanForm, tahun_mulai: e.target.value })} />
            </div>
            <div className="form-group"><label className="form-label">Tahun Selesai</label>
              <input className="form-input" type="number" placeholder="2024" value={pendidikanForm.tahun_selesai} onChange={e => setPendidikanForm({ ...pendidikanForm, tahun_selesai: e.target.value })} />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Pekerjaan */}
      <Modal isOpen={showPekerjaanModal} onClose={() => setShowPekerjaanModal(false)} title="Tambah Riwayat Pekerjaan"
        actions={<>
          <button className="btn btn-secondary" onClick={() => setShowPekerjaanModal(false)}>Batal</button>
          <button className="btn btn-primary" form="form-pekerjaan" type="submit">Simpan</button>
        </>}>
        <form id="form-pekerjaan" onSubmit={handleTambahPekerjaan}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Nama Perusahaan *</label>
              <input className="form-input" placeholder="PT. ..." value={pekerjaanForm.nama_perusahaan} onChange={e => setPekerjaanForm({ ...pekerjaanForm, nama_perusahaan: e.target.value })} required />
            </div>
            <div className="form-group"><label className="form-label">Posisi/Jabatan</label>
              <input className="form-input" placeholder="Software Engineer" value={pekerjaanForm.posisi} onChange={e => setPekerjaanForm({ ...pekerjaanForm, posisi: e.target.value })} />
            </div>
          </div>
          <div className="form-group"><label className="form-label">Bidang Industri</label>
            <input className="form-input" placeholder="Teknologi, Perbankan, dst." value={pekerjaanForm.bidang_industri} onChange={e => setPekerjaanForm({ ...pekerjaanForm, bidang_industri: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Tahun Mulai</label>
              <input className="form-input" type="number" value={pekerjaanForm.tahun_mulai} onChange={e => setPekerjaanForm({ ...pekerjaanForm, tahun_mulai: e.target.value })} />
            </div>
            <div className="form-group"><label className="form-label">Tahun Selesai</label>
              <input className="form-input" type="number" value={pekerjaanForm.tahun_selesai} onChange={e => setPekerjaanForm({ ...pekerjaanForm, tahun_selesai: e.target.value })} disabled={pekerjaanForm.is_current} />
            </div>
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={pekerjaanForm.is_current} onChange={e => setPekerjaanForm({ ...pekerjaanForm, is_current: e.target.checked, tahun_selesai: '' })} />
              Masih bekerja di sini
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Base URL - menggunakan proxy dari vite.config.js
const BASE_URL = '/api';

export function getToken() {
  return localStorage.getItem('sialumni_token');
}

export function setToken(token) {
  localStorage.setItem('sialumni_token', token);
}

export function removeToken() {
  localStorage.removeItem('sialumni_token');
  localStorage.removeItem('sialumni_user');
  localStorage.removeItem('sialumni_tipe');
}

export function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Terjadi kesalahan');
  }
  return data;
}

// =========================================================
// AUTH
// =========================================================
export async function loginAlumni(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login/alumni`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function loginAdmin(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function registerAlumni(data) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function getMe() {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

// =========================================================
// ALUMNI
// =========================================================
export async function getAlumniList(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/alumni${qs ? `?${qs}` : ''}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function getAlumniDetail(id) {
  const res = await fetch(`${BASE_URL}/alumni/${id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function updateAlumni(id, data) {
  const res = await fetch(`${BASE_URL}/alumni/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function uploadFotoAlumni(id, formData) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/alumni/${id}/foto`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(res);
}

export async function verifikasiAlumni(id, status) {
  const res = await fetch(`${BASE_URL}/alumni/${id}/verifikasi`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status_verifikasi: status }),
  });
  return handleResponse(res);
}

export async function deleteAlumni(id) {
  const res = await fetch(`${BASE_URL}/alumni/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function tambahPendidikan(id, data) {
  const res = await fetch(`${BASE_URL}/alumni/${id}/pendidikan`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function hapusPendidikan(alumniId, pendidikanId) {
  const res = await fetch(`${BASE_URL}/alumni/${alumniId}/pendidikan/${pendidikanId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function tambahPekerjaan(id, data) {
  const res = await fetch(`${BASE_URL}/alumni/${id}/pekerjaan`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function hapusPekerjaan(alumniId, pekerjaanId) {
  const res = await fetch(`${BASE_URL}/alumni/${alumniId}/pekerjaan/${pekerjaanId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

// =========================================================
// EVENT
// =========================================================
export async function getEvents() {
  const res = await fetch(`${BASE_URL}/event`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function getEventDetail(id) {
  const res = await fetch(`${BASE_URL}/event/${id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function createEvent(data) {
  const res = await fetch(`${BASE_URL}/event`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateEvent(id, data) {
  const res = await fetch(`${BASE_URL}/event/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteEvent(id) {
  const res = await fetch(`${BASE_URL}/event/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function rsvpEvent(id, status_rsvp) {
  const res = await fetch(`${BASE_URL}/event/${id}/rsvp`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status_rsvp }),
  });
  return handleResponse(res);
}

// =========================================================
// LOWONGAN
// =========================================================
export async function getLowongan(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/lowongan${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function getLowonganDetail(id) {
  const res = await fetch(`${BASE_URL}/lowongan/${id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function createLowongan(data) {
  const res = await fetch(`${BASE_URL}/lowongan`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateLowongan(id, data) {
  const res = await fetch(`${BASE_URL}/lowongan/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteLowongan(id) {
  const res = await fetch(`${BASE_URL}/lowongan/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

// =========================================================
// FORUM
// =========================================================
export async function getForumPosts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/forum${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function getForumDetail(id) {
  const res = await fetch(`${BASE_URL}/forum/${id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function createForumPost(data) {
  const res = await fetch(`${BASE_URL}/forum`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteForumPost(id) {
  const res = await fetch(`${BASE_URL}/forum/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function addKomentar(postId, isi) {
  const res = await fetch(`${BASE_URL}/forum/${postId}/komentar`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ isi }),
  });
  return handleResponse(res);
}

export async function deleteKomentar(komentarId) {
  const res = await fetch(`${BASE_URL}/forum/komentar/${komentarId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

// =========================================================
// DONASI
// =========================================================
export async function getDonasi() {
  const res = await fetch(`${BASE_URL}/donasi`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function getRingkasanDonasi() {
  const res = await fetch(`${BASE_URL}/donasi/ringkasan`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function createDonasi(data) {
  const res = await fetch(`${BASE_URL}/donasi`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function verifikasiDonasi(id, status) {
  const res = await fetch(`${BASE_URL}/donasi/${id}/verifikasi`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}

// =========================================================
// PENGUMUMAN
// =========================================================
export async function getPengumuman() {
  const res = await fetch(`${BASE_URL}/pengumuman`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function createPengumuman(data) {
  const res = await fetch(`${BASE_URL}/pengumuman`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deletePengumuman(id) {
  const res = await fetch(`${BASE_URL}/pengumuman/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

// =========================================================
// STATISTIK
// =========================================================
export async function getDashboardStatistik() {
  const res = await fetch(`${BASE_URL}/statistik/dashboard`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

/**
 * InterPrep frontend REST client.
 *
 * Talks to the Express + MongoDB backend. In dev, Vite proxies `/api` to
 * `http://localhost:4000` (configurable via `VITE_DEV_API_PROXY`). In prod,
 * we use `VITE_API_BASE_URL` if set, otherwise same-origin (useful when the
 * frontend and backend are served from the same domain).
 *
 * Auth: a JWT token is stored in localStorage under `interprep:auth:token`.
 * Every request automatically attaches it as `Authorization: Bearer <token>`.
 */

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const TOKEN_KEY = 'interprep:auth:token';
const UNAUTHORIZED_EVENT = 'interprep:unauthorized';

/* ─── Token management ──────────────────────────────────────────── */

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) || null; } catch { return null; }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* ignore */ }
}

export function clearToken() {
  setToken(null);
}

/** Subscribe to global 401 events so the app can force a logout. */
export function onUnauthorized(cb) {
  const handler = () => cb();
  window.addEventListener(UNAUTHORIZED_EVENT, handler);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
}

/* ─── Low-level fetch wrapper ───────────────────────────────────── */

function url(path) {
  if (!path.startsWith('/')) path = `/${path}`;
  return `${BASE}${path}`;
}

class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(method, path, { body, query, auth = true, headers = {} } = {}) {
  const finalUrl = new URL(url(path), window.location.origin);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      finalUrl.searchParams.set(k, v);
    });
  }

  const reqHeaders = { 'Accept': 'application/json', ...headers };
  if (body !== undefined) reqHeaders['Content-Type'] = 'application/json';
  if (auth) {
    const tok = getToken();
    if (tok) reqHeaders.Authorization = `Bearer ${tok}`;
  }

  let res;
  try {
    res = await fetch(finalUrl.toString().replace(window.location.origin, ''), {
      method,
      headers: reqHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new ApiError(e.message || 'Network error', 0, 'NETWORK');
  }

  if (res.status === 204) return null;

  const text = await res.text();
  let payload = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = { error: { message: text } }; }

  if (!res.ok) {
    const err = payload?.error || {};
    if (res.status === 401) {
      // Surface globally so AuthContext can flush state.
      try { window.dispatchEvent(new Event(UNAUTHORIZED_EVENT)); } catch { /* ignore */ }
    }
    throw new ApiError(err.message || `Request failed (${res.status})`, res.status, err.code, err.details);
  }
  return payload;
}

const api = {
  get:    (p, q)     => request('GET',    p, { query: q }),
  post:   (p, b, q)  => request('POST',   p, { body: b, query: q }),
  patch:  (p, b)     => request('PATCH',  p, { body: b }),
  put:    (p, b)     => request('PUT',    p, { body: b }),
  delete: (p)        => request('DELETE', p),
};

export { ApiError };

/* ─── Auth ──────────────────────────────────────────────────────── */

export async function signup({ name, email, password }) {
  const { user, token } = await api.post('/api/auth/signup', { name, email, password });
  setToken(token);
  return { user, token };
}

export async function login({ email, password }) {
  const { user, token } = await api.post('/api/auth/login', { email, password });
  setToken(token);
  return { user, token };
}

export async function logout() {
  try { await api.post('/api/auth/logout'); } catch { /* swallow */ }
  clearToken();
}

export async function fetchMe() {
  const { user } = await api.get('/api/auth/me');
  return user;
}

/* ─── User profile ──────────────────────────────────────────────── */

export async function updateProfile(patch) {
  const { user } = await api.patch('/api/users/me', patch);
  return user;
}

export async function changePassword({ currentPassword, newPassword }) {
  await api.post('/api/users/me/password', { currentPassword, newPassword });
}

export async function deleteAccount() {
  await api.delete('/api/users/me');
  clearToken();
}

/* ─── Domains ───────────────────────────────────────────────────── */

export async function listDomains() {
  const { domains } = await api.get('/api/domains');
  return domains;
}

/* ─── Questions ─────────────────────────────────────────────────── */

export async function listQuestions(params = {}) {
  return api.get('/api/questions', params);
}

export async function createQuestion(payload) {
  const { question } = await api.post('/api/questions', payload);
  return question;
}

export async function updateQuestion(id, patch) {
  const { question } = await api.patch(`/api/questions/${id}`, patch);
  return question;
}

export async function deleteQuestion(id) {
  await api.delete(`/api/questions/${id}`);
}

/* ─── Interviews / analyze ─────────────────────────────────────── */

export async function analyzeAndPersist(payload) {
  const { interview } = await api.post('/api/interviews/analyze', payload);
  return interview;
}

export async function listMyInterviews(params = {}) {
  return api.get('/api/interviews', params);
}

export async function getInterview(id) {
  const { interview } = await api.get(`/api/interviews/${id}`);
  return interview;
}

export async function deleteInterview(id) {
  await api.delete(`/api/interviews/${id}`);
}

export async function myStats() {
  return api.get('/api/interviews/stats');
}

/* ─── Admin ─────────────────────────────────────────────────────── */

export async function adminStats() {
  return api.get('/api/admin/stats');
}

export async function adminListUsers(params = {}) {
  return api.get('/api/admin/users', params);
}

export async function adminUpdateUserRole(id, role) {
  const { user } = await api.patch(`/api/admin/users/${id}/role`, { role });
  return user;
}

export async function adminDeleteUser(id) {
  await api.delete(`/api/admin/users/${id}`);
}

export async function adminListInterviews(params = {}) {
  return api.get('/api/admin/interviews', params);
}

/* ─── Health ────────────────────────────────────────────────────── */

export async function ping() {
  try { return await api.get('/api/health'); }
  catch (e) { return { ok: false, error: e.message }; }
}

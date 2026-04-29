const TOKEN_KEY = 'plai_token';
const USER_KEY = 'plai_user_profile';
const MOCK_TOKEN = 'mock_token_dev';

function fallbackName(email) {
  return (email || 'User').split('@')[0] || 'User';
}

export function normalizeUser(user = {}) {
  const email = user.email || '';
  return {
    id: user.id || null,
    email,
    name: (user.name || fallbackName(email)).trim(),
    avatarDataUrl: user.avatarDataUrl || null,
    createdAt: user.createdAt || null,
  };
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isMockToken(token = getAuthToken()) {
  return token === MOCK_TOKEN;
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return normalizeUser(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  const normalizedUser = normalizeUser(user);
  localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
  return normalizedUser;
}

export function storeAuthSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  if (user) setStoredUser(user);
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getInitials(name, email) {
  const source = (name || fallbackName(email)).trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function defaultMockUser() {
  return normalizeUser({
    id: 'mock-user',
    email: 'demo@plai.local',
    name: 'Demo User',
    avatarDataUrl: null,
  });
}

async function jsonRequest(path, options = {}) {
  const token = getAuthToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const rawText = await res.text();
  let data = {};

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { error: rawText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() };
    }
  }

  if (!res.ok) {
    const message = data.error || 'Request failed';
    if (message.includes('Cannot PATCH /api/auth/me') || message.includes('Cannot GET /api/auth/me')) {
      throw new Error('Profile API unavailable. Restart the backend server.');
    }
    throw new Error(message);
  }
  return data;
}

export async function fetchCurrentUser() {
  if (isMockToken()) {
    return getStoredUser() || setStoredUser(defaultMockUser());
  }

  const data = await jsonRequest('/api/auth/me', { method: 'GET' });
  return setStoredUser(data.user);
}

export async function updateCurrentUser(profile) {
  if (isMockToken()) {
    return setStoredUser({ ...(getStoredUser() || defaultMockUser()), ...profile });
  }

  const data = await jsonRequest('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(profile),
  });
  return setStoredUser(data.user);
}

export async function changeCurrentPassword(currentPassword, newPassword) {
  if (isMockToken()) return { message: 'Password updated' };

  return jsonRequest('/api/auth/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function deleteCurrentUser(password) {
  if (isMockToken()) {
    clearAuthSession();
    return { message: 'Account deleted' };
  }

  return jsonRequest('/api/auth/me', {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  });
}

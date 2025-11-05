const STORAGE_KEY = 'betty2.session';

function generateId(prefix) {
  return `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10)}`;
}

export function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Unable to parse session from storage', error);
    return null;
  }
}

export function setSession({ userId, username }) {
  const session = {
    user_id: userId,
    username,
    session_id: generateId('sess'),
    created_at: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function requireSession() {
  const session = getSession();
  if (!session) {
    window.location.replace('./index.html');
    throw new Error('Session not found. Redirecting to login.');
  }
  return session;
}

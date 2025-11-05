import { loginOrCreate } from '../api/datasource.contract.js';
import { setSession } from '../state/session.js';

const form = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const statusEl = document.getElementById('login-status');

const mockMode = window.APP_FLAGS?.MOCK_MODE;
statusEl.textContent = mockMode ? 'MOCK_MODE active' : 'Supabase mode (pending implementation)';

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = usernameInput.value.trim();
  if (!username) {
    statusEl.textContent = 'Enter a username to continue.';
    return;
  }
  form.classList.add('is-loading');
  statusEl.textContent = 'Signing in...';
  try {
    const { user_id } = await loginOrCreate(username);
    const session = setSession({ userId: user_id, username });
    statusEl.textContent = `Session established (${session.session_id}). Redirecting...`;
    setTimeout(() => {
      window.location.href = './profile.html';
    }, 300);
  } catch (error) {
    console.error(error);
    statusEl.textContent = 'Login failed. Try again.';
  } finally {
    form.classList.remove('is-loading');
  }
});
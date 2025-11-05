import { requireSession, clearSession } from '../state/session.js';
import { fetchProfile, subscribeProfile } from '../api/datasource.contract.js';
import { formatCurrency, formatNumber } from '../utils/format.js';
import { subscribe as subscribeStore } from '../state/store.js';
import { formatRelativeTime } from '../utils/time.js';

const session = requireSession();

const greetingEl = document.getElementById('profile-greeting');
const walletEl = document.getElementById('wallet-balance');
const chipsContainer = document.getElementById('score-chips');
const feedEl = document.getElementById('telemetry-feed');
const logoutButton = document.getElementById('logout-button');
const playButton = document.getElementById('play-games');

let unsubscribeProfile = null;
let profilesCache = {
  risk_score: 0,
  pace_score: 0,
  volatility_score: 0
};

const CHIP_DEFS = [
  { key: 'risk_score', label: 'Risk Score' },
  { key: 'pace_score', label: 'Pace Score' },
  { key: 'volatility_score', label: 'Volatility Score' }
];

function ensureChipElements() {
  if (chipsContainer.children.length) return;
  CHIP_DEFS.forEach(({ key, label }) => {
    const chip = document.createElement('article');
    chip.className = 'score-chip';
    chip.setAttribute('tabindex', '0');
    chip.dataset.key = key;

    const labelEl = document.createElement('p');
    labelEl.className = 'label';
    labelEl.textContent = label;

    const valueEl = document.createElement('p');
    valueEl.className = 'value';
    valueEl.textContent = '--';

    const trendEl = document.createElement('p');
    trendEl.className = 'trend';
    trendEl.textContent = '+0.0 pts';

    chip.append(labelEl, valueEl, trendEl);
    chipsContainer.appendChild(chip);
  });
}

function updateChips(profile) {
  ensureChipElements();
  CHIP_DEFS.forEach(({ key }) => {
    const chip = chipsContainer.querySelector(`.score-chip[data-key="${key}"]`);
    if (!chip) return;
    const valueEl = chip.querySelector('.value');
    const trendEl = chip.querySelector('.trend');
    const value = Number(profile[key] ?? 0);
    valueEl.textContent = formatNumber(value);
    const deltaValue = Number(profile[`delta_${key}`] ?? 0);
    const sign = deltaValue >= 0 ? '+' : '-';
    trendEl.textContent = `${sign}${Math.abs(deltaValue).toFixed(1)} pts (${formatRelativeTime(profile.updated_at)})`;
  });
}

function addTelemetryEvent(event) {
  if (event.user_id && event.user_id !== session.user_id) {
    return;
  }
  const item = document.createElement('li');
  const summary = event.summary || 'Update';
  item.innerHTML = `<strong>${event.type.toUpperCase()}</strong> - ${summary} <span style="color: rgba(160, 176, 176, 0.7);">(${formatRelativeTime(event.created_at)})</span>`;
  feedEl.prepend(item);
  while (feedEl.children.length > 10) {
    feedEl.removeChild(feedEl.lastChild);
  }
}

async function loadProfile() {
  greetingEl.textContent = `Commander ${session.username}`;
  const profile = await fetchProfile(session.user_id);
  profilesCache = {
    risk_score: profile.risk_score,
    pace_score: profile.pace_score,
    volatility_score: profile.volatility_score
  };
  walletEl.textContent = formatCurrency(profile.wallet_balance);
  updateChips(profile);
}

async function init() {
  await loadProfile();
  unsubscribeProfile = await subscribeProfile(session.user_id, (update) => {
    CHIP_DEFS.forEach(({ key }) => {
      const previous = profilesCache[key];
      const next = Number(update[key] ?? previous ?? 0);
      update[`delta_${key}`] = Number.isFinite(previous) ? next - previous : 0;
      profilesCache[key] = next;
    });
    walletEl.textContent = formatCurrency(update.wallet_balance);
    updateChips(update);
  });
}

logoutButton?.addEventListener('click', () => {
  clearSession();
  window.location.href = './index.html';
});

playButton?.addEventListener('click', () => {
  window.location.href = './menu.html';
});

subscribeStore('telemetry:event', addTelemetryEvent, { emitImmediately: false });

init().catch((error) => {
  console.error('Failed to initialize profile page', error);
});

window.addEventListener('beforeunload', () => {
  if (typeof unsubscribeProfile === 'function') {
    unsubscribeProfile();
  }
});
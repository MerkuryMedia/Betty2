import { requireSession, clearSession } from '../state/session.js';
import { subscribe } from '../state/store.js';
import { formatCurrency, formatNumber } from '../utils/format.js';
import { formatRelativeTime } from '../utils/time.js';

requireSession();

const logoutButton = document.getElementById('logout-button');
const statsContainer = document.getElementById('admin-stats');
const wagersList = document.getElementById('admin-wagers');
const sessionsBody = document.getElementById('admin-sessions');
const playersBody = document.getElementById('admin-players');

function renderStats(stats) {
  statsContainer.innerHTML = '';
  const cards = [
    { label: 'Total Wagers', value: formatNumber(stats.totalWagers ?? 0) },
    { label: 'Total Stake', value: formatCurrency(stats.totalStake ?? 0) },
    { label: 'Last Updated', value: stats.lastUpdated ? formatRelativeTime(stats.lastUpdated) : '-' }
  ];
  cards.forEach((card) => {
    const el = document.createElement('div');
    el.className = 'stat-card';
    el.innerHTML = `<p class="label">${card.label}</p><p class="value">${card.value}</p>`;
    statsContainer.appendChild(el);
  });
}

function renderWagers(entries = []) {
  wagersList.innerHTML = '';
  entries.forEach((entry) => {
    const li = document.createElement('li');
    const netColor = entry.net >= 0 ? 'rgba(94, 192, 230, 0.9)' : 'rgba(255, 120, 120, 0.9)';
    li.innerHTML = `
      <strong>${entry.game_id}</strong> - ${formatCurrency(entry.stake)} stake -
      <span style="color:${netColor};">net ${formatCurrency(entry.net)}</span>
      <br/><span style="color: rgba(160, 176, 176, 0.7);">${formatRelativeTime(entry.created_at)}</span>
    `;
    wagersList.appendChild(li);
  });
}

function renderSessions(list = []) {
  sessionsBody.innerHTML = '';
  list.forEach((session) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${session.username}</td>
      <td>${session.session_id}</td>
      <td>${session.last_wager_at ? formatRelativeTime(session.last_wager_at) : '-'}</td>
    `;
    sessionsBody.appendChild(row);
  });
}

function renderPlayers(list = []) {
  playersBody.innerHTML = '';
  list.forEach((player) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${player.username}</td>
      <td>${formatNumber(player.risk_score)}</td>
      <td>${formatNumber(player.pace_score)}</td>
      <td>${formatNumber(player.volatility_score)}</td>
      <td>${formatCurrency(player.wallet_balance)}</td>
    `;
    playersBody.appendChild(row);
  });
}

logoutButton?.addEventListener('click', () => {
  clearSession();
  window.location.href = './index.html';
});

subscribe('admin:stats', renderStats);
subscribe('admin:wagers', renderWagers);
subscribe('admin:sessions', renderSessions);
subscribe('admin:players', renderPlayers);
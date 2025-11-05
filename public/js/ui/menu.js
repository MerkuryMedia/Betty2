import { requireSession, clearSession } from '../state/session.js';
import { fetchGames, submitWager } from '../api/datasource.contract.js';
import { formatCurrency, formatPercent } from '../utils/format.js';
import { publish } from '../state/store.js';
import { nowIso } from '../utils/time.js';

const session = requireSession();

const logoutButton = document.getElementById('logout-button');
const openSlotsButton = document.getElementById('open-slots');
const gameListEl = document.getElementById('game-list');
const modalEl = document.getElementById('slots-modal');
const modalBackdrop = modalEl.querySelector('[data-dismiss="modal"]');
const stakeInput = document.getElementById('slots-stake');
const spinButton = document.getElementById('slots-spin');
const dismissButtons = modalEl.querySelectorAll('[data-dismiss="modal"]');

function renderGame(game) {
  const item = document.createElement('li');
  item.innerHTML = `
    <header style="display:flex;justify-content:space-between;align-items:center;">
      <strong style="font-family: var(--font-heading); letter-spacing: 0.08em; text-transform: uppercase;">${game.name}</strong>
      <span style="color: rgba(160, 176, 176, 0.7);">${game.game_id}</span>
    </header>
    <p style="margin: 12px 0 4px; color: var(--color-soft-steel);">
      Win Ref: ${formatPercent(game.p_win_ref)} | Tempo: ${game.tpm_ref} TPM
    </p>
    <p style="margin: 0; color: rgba(240, 240, 240, 0.7);">
      Stakes ${formatCurrency(game.min_bet)} - ${formatCurrency(game.max_bet)}
    </p>
  `;
  return item;
}

async function loadGames() {
  const games = await fetchGames();
  games.forEach((game) => {
    gameListEl.appendChild(renderGame(game));
  });
}

function openModal() {
  modalEl.hidden = false;
  stakeInput.focus();
}

function closeModal() {
  modalEl.hidden = true;
}

async function spinSlots() {
  const stake = Number(stakeInput.value);
  if (Number.isNaN(stake) || stake <= 0) {
    stakeInput.focus();
    return;
  }
  spinButton.disabled = true;
  spinButton.textContent = 'Spinning...';
  try {
    const result = await submitWager({
      user_id: session.user_id,
      session_id: session.session_id,
      game_id: 'slots-alpha',
      stake,
      created_at: nowIso()
    });
    publish('telemetry:event', {
      type: 'wager',
      user_id: session.user_id,
      session_id: session.session_id,
      game_id: 'slots-alpha',
      created_at: nowIso(),
      summary: `Slots spin completed. Result ${formatCurrency(result.result_amount || 0)}.`,
      net: (result.result_amount || 0) - stake
    });
    closeModal();
  } catch (error) {
    console.error('Spin failed', error);
  } finally {
    spinButton.disabled = false;
    spinButton.textContent = 'Spin';
  }
}

logoutButton?.addEventListener('click', () => {
  clearSession();
  window.location.href = './index.html';
});

openSlotsButton?.addEventListener('click', openModal);
spinButton?.addEventListener('click', spinSlots);

dismissButtons.forEach((btn) => btn.addEventListener('click', closeModal));
modalBackdrop.addEventListener('click', closeModal);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modalEl.hidden) {
    closeModal();
  }
});

loadGames().catch((error) => console.error('Failed to load games', error));
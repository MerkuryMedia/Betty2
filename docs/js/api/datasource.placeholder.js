import { CONFIG } from '../config.js';
import { setState, publish } from '../state/store.js';
import { ema, clamp, randomAround } from '../utils/math.js';
import { nowIso } from '../utils/time.js';

const profileSeedUrl = new URL('../data/mock-profile.json', import.meta.url);
const gamesSeedUrl = new URL('../data/games.seed.json', import.meta.url);

const [profileSeed, gamesSeed] = await Promise.all([
  fetch(profileSeedUrl).then((res) => res.json()),
  fetch(gamesSeedUrl).then((res) => res.json())
]);

const profiles = new Map();
const usernameIndex = new Map();
const sessions = new Map();
const wagers = [];
const subscribers = new Map();
const tickers = new Map();

function primeSeedProfile() {
  const seedProfile = {
    ...profileSeed,
    updated_at: nowIso()
  };
  profiles.set(seedProfile.user_id, seedProfile);
  usernameIndex.set(seedProfile.username.toLowerCase(), seedProfile.user_id);
}

primeSeedProfile();
setState('admin:wagers', wagers);
setState('admin:players', Array.from(profiles.values()));
setState('admin:sessions', Array.from(sessions.values()));
setState('admin:stats', {
  totalWagers: 0,
  totalStake: 0,
  lastUpdated: nowIso()
});

function cloneProfile(userId) {
  const profile = profiles.get(userId);
  if (!profile) {
    throw new Error(`Profile not found for user_id ${userId}`);
  }
  return { ...profile };
}

function createProfile(username) {
  const id = `commander-${Math.random().toString(36).slice(2, 8)}`;
  const base = cloneProfile(profileSeed.user_id);
  const next = {
    ...base,
    user_id: id,
    username,
    wallet_balance: 1000 + Math.round(Math.random() * 500),
    risk_score: Math.round(randomAround(60, 10)),
    pace_score: Math.round(randomAround(50, 10)),
    volatility_score: Math.round(randomAround(65, 12)),
    updated_at: nowIso()
  };
  profiles.set(id, next);
  usernameIndex.set(username.toLowerCase(), id);
  refreshAdminPlayers();
  return next;
}

function getSubscriberSet(userId) {
  if (!subscribers.has(userId)) {
    subscribers.set(userId, new Set());
  }
  return subscribers.get(userId);
}

function refreshAdminPlayers() {
  setState('admin:players', Array.from(profiles.values()).map((profile) => ({
    user_id: profile.user_id,
    username: profile.username,
    wallet_balance: profile.wallet_balance,
    risk_score: profile.risk_score,
    pace_score: profile.pace_score,
    volatility_score: profile.volatility_score,
    updated_at: profile.updated_at
  })));
}

function refreshAdminStats() {
  const totalStake = wagers.reduce((sum, wager) => sum + wager.stake, 0);
  setState('admin:stats', {
    totalWagers: wagers.length,
    totalStake,
    lastUpdated: nowIso()
  });
}

function refreshAdminWagers() {
  setState('admin:wagers', wagers.slice(-12).reverse());
}

function refreshAdminSessions() {
  setState('admin:sessions', Array.from(sessions.values()));
}

function notifyProfile(userId, update) {
  const profile = profiles.get(userId);
  if (!profile) return;
  const nextProfile = {
    ...profile,
    ...update,
    updated_at: nowIso()
  };
  profiles.set(userId, nextProfile);
  const subs = getSubscriberSet(userId);
  subs.forEach((callback) => {
    try {
      callback({ ...nextProfile, ...update });
    } catch (error) {
      console.error('Profile subscriber error', error);
    }
  });
  refreshAdminPlayers();
}

function scheduleTicker(userId) {
  if (tickers.has(userId)) {
    return;
  }
  const interval = setInterval(() => randomTick(userId), CONFIG.mockTickIntervalMs);
  tickers.set(userId, interval);
}

function clearTicker(userId) {
  const interval = tickers.get(userId);
  if (interval) {
    clearInterval(interval);
    tickers.delete(userId);
  }
}

function randomTick(userId) {
  const profile = profiles.get(userId);
  if (!profile) return;
  const drift = {
    risk_score: clamp(Math.round(ema(profile.risk_score, randomAround(profile.risk_score, 4), 0.18)), 5, 95),
    pace_score: clamp(Math.round(ema(profile.pace_score, randomAround(profile.pace_score, 5), 0.2)), 5, 95),
    volatility_score: clamp(Math.round(ema(profile.volatility_score, randomAround(profile.volatility_score, 6), 0.22)), 5, 95),
    wallet_balance: Math.max(250, Math.round(profile.wallet_balance + randomAround(0, 12)))
  };
  notifyProfile(userId, drift);
  publish('telemetry:event', {
    type: 'tick',
    user_id: userId,
    created_at: nowIso(),
    summary: 'Synthetic telemetry tick applied.'
  });
}

async function delay(ms = CONFIG.mockLatencyMs) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const placeholderDatasource = {
  async loginOrCreate(username) {
    const trimmed = username.trim();
    if (!trimmed) {
      throw new Error('Username is required.');
    }
    await delay();
    const key = trimmed.toLowerCase();
    let userId = usernameIndex.get(key);
    if (!userId) {
      const profile = createProfile(trimmed);
      userId = profile.user_id;
    }
    publish('telemetry:event', {
      type: 'login',
      user_id: userId,
      created_at: nowIso(),
      summary: `${trimmed} authenticated.`
    });
    return { user_id: userId };
  },

  async fetchProfile(userId) {
    await delay(180);
    return cloneProfile(userId);
  },

  async subscribeProfile(userId, onUpdate) {
    const subs = getSubscriberSet(userId);
    subs.add(onUpdate);
    try {
      onUpdate(cloneProfile(userId));
    } catch (error) {
      console.error('Initial profile dispatch failed', error);
    }
    scheduleTicker(userId);
    return () => {
      subs.delete(onUpdate);
      if (subs.size === 0) {
        clearTicker(userId);
      }
    };
  },

  async submitWager(payload) {
    const { user_id, session_id, game_id, stake } = payload;
    if (!user_id || !session_id || !game_id || !stake) {
      throw new Error('submitWager payload missing fields.');
    }
    const profile = cloneProfile(user_id);
    await delay(220);
    const resultAmount = typeof payload.result_amount === 'number'
      ? payload.result_amount
      : Math.round((Math.random() - 0.4) * stake * 1.5);
    const net = resultAmount - stake;
    const updated = {
      wallet_balance: Math.max(0, profile.wallet_balance + net),
      risk_score: clamp(Math.round(ema(profile.risk_score, randomAround(profile.risk_score + Math.sign(net) * 3, 6), 0.25)), 5, 95),
      pace_score: clamp(Math.round(ema(profile.pace_score, randomAround(profile.pace_score + 2, 4), 0.22)), 5, 95),
      volatility_score: clamp(Math.round(ema(profile.volatility_score, randomAround(profile.volatility_score + Math.sign(net) * 4, 8), 0.28)), 5, 95)
    };

    const wagerEntry = {
      id: `${session_id}-${Date.now()}`,
      user_id,
      session_id,
      game_id,
      stake,
      result_amount: resultAmount,
      net,
      created_at: nowIso()
    };
    wagers.push(wagerEntry);
    if (wagers.length > 48) {
      wagers.shift();
    }
    sessions.set(session_id, {
      session_id,
      user_id,
      username: profile.username,
      started_at: sessions.get(session_id)?.started_at ?? nowIso(),
      last_wager_at: nowIso()
    });

    notifyProfile(user_id, updated);
    refreshAdminStats();
    refreshAdminWagers();
    refreshAdminSessions();

    publish('telemetry:event', {
      type: 'wager',
      user_id,
      session_id,
      game_id,
      created_at: nowIso(),
      summary: `${profile.username} wagered $${stake}`,
      net
    });

    return { ok: true, result_amount: resultAmount };
  },

  async fetchGames() {
    await delay(120);
    return gamesSeed.map((game) => ({ ...game }));
  }
};
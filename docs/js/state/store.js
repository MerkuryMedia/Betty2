const listeners = new Map();
const state = new Map();

function getListeners(key) {
  const existing = listeners.get(key);
  if (existing) return existing;
  const set = new Set();
  listeners.set(key, set);
  return set;
}

export function setState(key, value) {
  state.set(key, value);
  const subs = getListeners(key);
  subs.forEach((listener) => {
    try {
      listener(value);
    } catch (error) {
      console.error('Store listener error', error);
    }
  });
}

export function getState(key) {
  return state.get(key);
}

export function subscribe(key, listener, { emitImmediately = true } = {}) {
  const subs = getListeners(key);
  subs.add(listener);
  if (emitImmediately && state.has(key)) {
    try {
      listener(state.get(key));
    } catch (error) {
      console.error('Store listener error', error);
    }
  }
  return () => {
    subs.delete(listener);
  };
}

export function publish(event, payload) {
  const subs = getListeners(event);
  subs.forEach((listener) => {
    try {
      listener(payload);
    } catch (error) {
      console.error('Store publish listener error', error);
    }
  });
}

let implementation = null;

export function setDatasourceImplementation(ds) {
  implementation = ds;
}

function ensureImplementation() {
  if (!implementation) {
    throw new Error('Datasource implementation not registered. Call setDatasourceImplementation first.');
  }
  return implementation;
}

export async function loginOrCreate(username) {
  return ensureImplementation().loginOrCreate(username);
}

export async function fetchProfile(userId) {
  return ensureImplementation().fetchProfile(userId);
}

export async function subscribeProfile(userId, onUpdate) {
  return ensureImplementation().subscribeProfile(userId, onUpdate);
}

export async function submitWager(payload) {
  return ensureImplementation().submitWager(payload);
}

export async function fetchGames() {
  return ensureImplementation().fetchGames();
}

export const CONTRACT_SHAPES = Object.freeze({
  loginOrCreate: 'loginOrCreate(username: string) => Promise<{ user_id: string }>',
  fetchProfile: 'fetchProfile(userId: string) => Promise<Profile>',
  subscribeProfile: 'subscribeProfile(userId: string, onUpdate: (ProfileUpdate) => void) => () => void',
  submitWager: 'submitWager({ user_id, session_id, game_id, stake, result_amount }) => Promise<{ ok: boolean }>',
  fetchGames: 'fetchGames() => Promise<GameDefinition[]>'
});
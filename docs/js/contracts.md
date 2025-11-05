# Data Contracts

All UI modules must interact with data exclusively through the functions described below. Implementations may change (mock vs. Supabase) without altering these signatures.

## Auth / Session

- `loginOrCreate(username: string) => Promise<{ user_id: string }>`
  - Creates a new profile if the username does not exist. Returns a canonical `user_id` string.

## Profile

- `fetchProfile(userId: string) => Promise<Profile>`
  - Resolves to `{ username, wallet_balance, risk_score, pace_score, volatility_score, updated_at }`.
- `subscribeProfile(userId: string, onUpdate: (ProfileUpdate) => void) => Unsubscribe`
  - Streams profile updates. Returns a function that tears down the listener.

## Wagering

- `submitWager({ user_id, session_id, game_id, stake, result_amount }) => Promise<{ ok: boolean }>`
  - Persists the wager attempt and triggers derived metric updates.

## Catalog

- `fetchGames() => Promise<GameDefinition[]>`
  - Retrieves the list of games with reference metadata.

### Types

```
type Profile = {
  user_id: string;
  username: string;
  wallet_balance: number;
  risk_score: number;
  pace_score: number;
  volatility_score: number;
  updated_at: string;
};

type ProfileUpdate = Partial<Profile> & { updated_at: string };

type GameDefinition = {
  game_id: string;
  name: string;
  p_win_ref: number;
  tpm_ref: number;
  min_bet: number;
  max_bet: number;
};
```

Implementations must validate inputs and reject with informative errors when the contract is violated.
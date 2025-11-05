# Supabase Integration TODO

This checklist captures the steps required to replace the mock datasource with a Supabase-backed implementation while leaving the UI untouched.

## 1. Provision Supabase Resources

- Create a Supabase project and note the Project URL and anon key.
- Define the following tables (names can be adjusted, keep the contract shapes):
  - `profiles` with `id`, `username`, `wallet_balance`, `risk_score`, `pace_score`, `volatility_score`, `updated_at`.
  - `games` with `id`, `name`, `p_win_ref`, `tpm_ref`, `min_bet`, `max_bet`.
  - `wagers` with `id`, `user_id`, `session_id`, `game_id`, `stake`, `result_amount`, `created_at`.
- Enable Row Level Security policies to permit anon reads on `games` and authenticated access for profile/wager data.

## 2. Populate Reference Data

- Seed initial game rows using the template in `public/js/data/games.seed.json`.
- (Optional) Seed sample profiles for internal testing.

## 3. Create API Helpers (Supabase Edge Functions or RPC Optional)

- Implement RPCs or SQL views to compute derived risk, pace, and volatility metrics if they cannot be performed client-side.
- Ensure there is a realtime channel (e.g., `realtime:public:profiles` or a dedicated `profile_updates` channel) that streams updates per user.

## 4. Wire Up `datasource.supabase.js`

- Create a new module `public/js/api/datasource.supabase.js` that imports `@supabase/supabase-js` (or a lighter fetch client if preferred).
- Implement the contract functions outlined in `datasource.contract.js`:
  - `loginOrCreate` should upsert a profile for the provided username and return `{ user_id }`.
  - `fetchProfile` should query the profile row and any computed metrics.
  - `submitWager` should insert a wager and trigger any recalculation pipeline.
  - `subscribeProfile` should listen to Supabase Realtime and invoke the callback on changes.
  - `fetchGames` should read the `games` table.
- Export the implementation as `supabaseDatasource`.

## 5. Update Bootstrap Logic

- Modify `public/js/bootstrap.js` to dynamically import `datasource.supabase.js` when `MOCK_MODE === false`.
- Ensure the module gracefully handles credential issues (e.g., display a toast or log an error) and falls back to the mock datasource if loading fails.

## 6. Testing

- Run through the flows with Supabase credentials in `public/js/env.local.js`.
- Verify realtime updates propagate to the Profile and Admin screens.
- Confirm that all contract calls resolve without modifying UI code.
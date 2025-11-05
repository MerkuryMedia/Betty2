# datasource.supabase.todo.md

This placeholder documents how the Supabase-backed datasource will map onto the contract.

- Create `datasource.supabase.js` in this folder.
- Import `createClient` from `@supabase/supabase-js` using credentials loaded through `config.js`.
- Implement and export `supabaseDatasource` with the same shape as `placeholderDatasource`:
  - `loginOrCreate`
  - `fetchProfile`
  - `subscribeProfile`
  - `submitWager`
  - `fetchGames`
- Ensure each method validates the contract payloads before calling Supabase.
- Wire the module into `bootstrap.js` once Supabase credentials are available.
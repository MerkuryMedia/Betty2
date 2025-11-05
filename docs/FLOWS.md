# User Flows

## Login -> Profile

1. User lands on `index.html`.
2. Enters a username and submits the form.
3. `loginOrCreate` (mock datasource) returns `{ user_id }`.
4. `session.js` stores the `user_id` and generates a `session_id` in `localStorage`.
5. Browser navigates to `profile.html`.

## Profile -> Live Updates

1. `profile.js` loads the active session and calls `fetchProfile`.
2. Score chips render Risk, Pace, and Volatility values pulled from `mock-profile.json`.
3. `subscribeProfile` registers a mock timer that nudges chip values and wallet balance.
4. UI updates animate subtly to mimic realtime data.

## Navigate to Menu -> Wager Simulation

1. User taps "Play Games" and moves to `menu.html`.
2. Menu loads seed data via `fetchGames` to display available experiences.
3. Opening the Slots modal allows the user to enter a stake and hit "Spin".
4. `submitWager` records the stake, applies lightweight analytics (EMA), and dispatches an update event.
5. Profile screen will reflect the updated values on the next visit or via the live subscription.

## Admin Monitoring

1. `admin.html` polls the mock datasource for recent wagers and active sessions every few seconds.
2. Summary cards and tables display synthetic telemetry.
3. The feed illustrates how Supabase Realtime could later drive operational insights.

## Session End

1. Logging out clears the `localStorage` keys via `session.js`.
2. User returns to the login screen, ready to start a new mock session.

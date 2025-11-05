# Overview

Betty2 Casino Demo is a static prototype that showcases a streamlined wagering flow using Ordo Ignis-inspired styling. The demo renders four core surfaces:

- **Login:** Lightweight username capture that seeds a local session.
- **Profile:** Live-feeling risk, pace, and volatility chips plus wallet state.
- **Menu:** Game discovery and a Slots stub that records mock wagers.
- **Admin:** Read-only operational monitoring surface.

All data calls run through an abstract contract layer. For now the contract is fulfilled by in-memory mocks that make the UI feel alive. When Supabase is introduced, only the data source implementation and configuration files should change—UI logic, styling, and contracts remain untouched.

## Design Tenets

- Deliver a premium, high-contrast visual language using the Night Navy ? Deep Slate palette.
- Keep interactions smooth and legible with rounded sans typography and subtle glow cues.
- Modularize logic with small ES modules to ease future Supabase integration.

## Key Modules

- `bootstrap.js` initializes environment flags and registers the mock data source.
- `datasource.contract.js` houses the canonical API surface for UI code.
- `datasource.placeholder.js` fulfills the contract with seeded JSON and ephemeral state.
- `store.js` and `session.js` provide minimal shared state mechanics without external dependencies.

## Future Work

- Swap the placeholder datasource with a Supabase-backed implementation using the plan in `docs/SUPABASE_INTEGRATION_TODO.md`.
- Skin the individual game UIs (reserved for a later phase).
- Layer in analytics, auth hardening, and Supabase Realtime once credentials are available.
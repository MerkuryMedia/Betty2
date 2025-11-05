# Betty2 Casino Demo

A static UI prototype for the Betty2 wager experience. The demo renders login, profile, menu, and admin screens with premium "Ordo Ignis" styling while operating entirely in MOCK_MODE. All data access flows through a contract layer that will be swapped with Supabase later.

## Getting Started

1. Serve the `docs/` folder with any static server (VS Code Live Server, `python -m http.server`, etc.).
2. Open `http://localhost:PORT/index.html`.
3. Use the login page to create a mock session and explore the profile, menu, and admin screens.

> The project is framework-free: HTML, CSS, and ES modules only.

## Project Structure

```
docs/
  css/            # Global tokens and page-level rules
  js/             # Config, contracts, placeholder data, UI scripts
  *.html          # Login, profile, menu, admin screens
  .nojekyll       # Keeps GitHub Pages from running Jekyll
  *.md            # Overview, flows, Supabase integration plan
```

Key entry points:

- `docs/js/config.js`: Loads env placeholders and exposes `MOCK_MODE`.
- `docs/js/api/datasource.contract.js`: Contract signatures that the UI uses.
- `docs/js/api/datasource.placeholder.js`: In-memory mock implementation.
- `docs/js/bootstrap.js`: Boots the correct data source and exposes `APP_FLAGS`.

## Mock Mode and Future Supabase Integration

The app ships with placeholder Supabase credentials in `docs/js/env.example.js`. If those placeholders remain, `MOCK_MODE` stays `true` and the UI uses in-memory data backed by JSON seeds. When real credentials are supplied via `docs/js/env.local.js` (gitignored), `MOCK_MODE` flips to `false` and Supabase wiring can be enabled using the steps in `docs/SUPABASE_INTEGRATION_TODO.md`.

## Brand Style Summary

- **Typography:** Headings use a bold, rounded sans (Montserrat Alternates / Poppins); body text uses Inter/Helvetica.
- **Palette:** Night Navy background gradient, Deep Slate panels, Steel Blue-Gray borders, Ice Silver headlines, Soft Steel secondary copy, Cyan Glow accents.
- **Effects:** Subtle inner/outer shadows, bevel hints on titles/buttons, cyan focus rings.
- **Layout:** 12-column fluid grid capped at 1280px, generous outer padding, tight control spacing.

## Deployment

Deploy from `/docs` (GitHub Pages: main + /docs).

## Documentation

- `docs/OVERVIEW.md` explains the system at a high level.
- `docs/FLOWS.md` maps user journeys (Login -> Profile -> Menu -> Wager -> Live updates).
- `docs/SUPABASE_INTEGRATION_TODO.md` provides the exact checklist to replace the mock data source with Supabase.

## License

Released under the MIT License. See `LICENSE` for details.
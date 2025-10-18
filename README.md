[![Profile](https://img.shields.io/badge/Author-Craig_Beveridge-2b3137?style=flat&logo=github)](https://github.com/cbeveridge74/SkillsSummary)
[![View Skills Summary](https://img.shields.io/badge/View%20My-Skills%20Summary-blue?style=flat&logo=markdown)](https://github.com/cbeveridge74/SkillsSummary)

# Bitcoin Blockchain Browser

A small single-page React app that shows the latest Bitcoin block information (current + previous), with polling, local persistence, dark mode, and a tidy developer scaffold.

This README has two short paths depending on your audience:

- Quick Start (non-technical): get the app running locally in a couple of commands.
- Developer Guide (technical): architecture, scripts, configuration, tests, and where to change things.

---

## Quick Start (non-technical)

Requirements: Node.js 18+ and npm.

1. Clone the repo (if not already) and install dependencies:

```bash
npm install
```

2. Start the app in development mode and open http://localhost:5173:

```bash
npm run dev
```

3. Run the test suite:

```bash
npm run test
```

That's it — the UI shows the latest Bitcoin block and a previous block for quick comparisons.

---

## Developer Guide (technical)

Project stack
- Vite (fast dev server + bundler)
- React 18 + TypeScript
- Zustand for lightweight state management
- Vitest + Testing Library for tests (fast, Vite-native)

Key scripts (package.json)
- `npm run dev` — start Vite dev server
- `npm run build` — build production bundle
- `npm run preview` — serve a production build locally
- `npm run test` — run Vitest test suite
- `npm run lint` / `npm run format` — lint and format helpers

Important files and directories
- `index.html` — app entry (favicon is in `public/favicon.svg`)
- `src/main.tsx` — React entry point
- `src/App.tsx` — main UI wiring
- `src/api/blockchain.ts` — Blockstream REST helpers
- `src/store/useBlockchain.ts` — Zustand store for block state + polling + persistence
- `src/context/ThemeContext.tsx` and `src/components/ThemeToggle.tsx` — theme provider and toggle
- `src/index.css` — CSS variables for theming and small UI styles
- `tests/` — test files (Vitest + Testing Library)

Path alias
- `@` is mapped to `src/` via `tsconfig.json` and `vite.config.ts`. Examples in imports:

```ts
import useBlockchain from '@/store/useBlockchain'
```

Environment
- The app reads `VITE_BLOCKSTREAM_API_BASE` to choose the Blockstream REST base URL. By default it uses `https://blockstream.info/api`.

Create a `.env` in the project root to override:

```
VITE_BLOCKSTREAM_API_BASE=https://blockstream.info/api
```

Behavior and features
- Polling: the store exposes `refresh`, `startPolling(ms)`, and `stopPolling()` for automated refresh.
- Persistence: the store persists the last known `block` and `previousBlock` to `localStorage` (key: `btc-browser:lastBlock`) and restores on load for immediate UI content.
- Theme: dark/light mode with OS `prefers-color-scheme` fallback and user persistence (key: `btc-browser:theme`).
- Favicon: placed at `public/favicon.svg` (orange Bitcoin-style icon).

Testing
- Run tests with `npm run test` (Vitest). Tests use `@testing-library/react` and `user-event` for user interaction.
- Tests live in `tests/` to keep `src/` clean. Vitest is configured in `vite.config.ts`.

Notes for contributors
- Prefer Vitest when adding tests — it's faster and integrates with Vite. If you want Jest specifically, we can reintroduce it but it requires more config.
- When adding new providers (context, router), consider adding a `tests/test-utils.tsx` with a custom `render` that wraps the common providers.

Troubleshooting
- If the dev server complains about the Vite CJS Node API deprecation, upgrade to a newer Vite or ignore (it's a dev warning). The app still runs.
- If tests fail due to theme context, wrap tested components with `ThemeProvider` (tests already do this).

Contributing / housekeeping
- This repo intentionally keeps a small surface area. If you remove a store or test file, delete both implementation and tests to avoid test discovery issues.

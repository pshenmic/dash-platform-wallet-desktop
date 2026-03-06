# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Start in development mode (electron-vite dev)
yarn build        # Typecheck + build (outputs to out/)
yarn typecheck    # Run TypeScript type checking only
yarn start        # Preview built app

yarn build:mac    # Build macOS distributable
yarn build:win    # Build Windows distributable
yarn build:linux  # Build Linux distributable
```

No test runner is configured yet (`test` script exits with error).

## Architecture

This is an **Electron desktop wallet** for Dash Platform, built with electron-vite, React, and TypeScript. The app has three Electron processes:

### Main process (`src/main/src/`)
The Node.js backend. Entry point is `backend.ts`, which:
1. Creates `~/.dash-platform-wallet/` and a SQLite database (`storage.db`) via Knex
2. Runs Knex migrations from `src/main/migrations/`
3. Initializes `DashPlatformSDK`
4. Registers IPC handlers via `routes.ts` (controller-style) and `handlers.ts` (ad-hoc handlers)

**Layer structure:**
- `api/` — IPC handler classes (e.g. `WalletAPI`). Each method signature is `(event, ...args)` to match `ipcMain.handle`.
- `database/` — DAO classes using Knex (e.g. `WalletDAO`). Plain SQL queries against SQLite.
- `services/` — Service layer (currently stubbed: `WalletService`).
- `types/` — Domain model types (e.g. `Wallet` with `fromRow` factory).
- `controllers/` — Controller classes that wire API + DAO + SDK (referenced but deleted in current branch — use `WalletAPI` directly instead).
- `routes.ts` — Maps IPC channel names to handler functions via `ipcMain.handle`.
- `handlers.ts` — Secondary handler registration (currently registers the `foobar` test handler).

> **Note:** `WalletController` was deleted and the git status shows `WalletAPI.ts` as the active handler class. `routes.ts` still references `WalletController` — this is an in-progress refactor.

### Preload (`src/preload/`)
- `index.ts` — Exposes APIs to the renderer via `contextBridge`:
  - `window.electron` — `@electron-toolkit/preload` standard API
  - `window.electronAPI` — app-specific IPC calls (defined in `definitions.ts`)
  - `window.darkMode` — theme control
- `definitions.ts` — Typed wrappers around `ipcRenderer.invoke(channelName, ...)`. **Every new IPC channel must be added here** to be accessible from the renderer.

### Renderer (`src/renderer/src/`)
React SPA with React Router v7. Auth state is managed locally in `App.tsx`:
- Unauthenticated: shows `/` (Login) or `/create-wallet`
- Authenticated: shows full wallet UI with a `<Sidebar>` + `<Layout>` wrapping the route pages

Pages: `Transactions`, `Send`, `Withdraw`, `Tokens`, `Names`, `Support`, `Settings`.

UI uses `dash-ui-kit` (Dash design system) + Tailwind CSS v4. The `@renderer` alias resolves to `src/renderer/src/`.

## Adding a new IPC endpoint

1. Add the handler method to the appropriate class in `src/main/src/api/`
2. Register the channel in `src/main/src/routes.ts` (or `handlers.ts` for standalone handlers)
3. Add the typed wrapper in `src/preload/definitions.ts`
4. Call `window.electronAPI.yourMethod(...)` from the renderer

## Database

SQLite via Knex. Migrations live in `src/main/migrations/` (numbered `0000_`, `0001_`, etc.). Tables: `wallet`, transaction tables (L1/L2), `identities`.
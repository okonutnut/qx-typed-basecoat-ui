# Copilot instructions for qx-typed-basecoat-ui

This file helps future Copilot sessions understand how to build, run, and reason about this repository.

---

## Build / Run / Serve

- Compile TypeScript to the single AMD output used by index.html:
  - npx tsc
- For live recompilation during development:
  - npx tsc --watch --preserveWatchOutput
- Serve the app locally (index.html expects `lib/application.js` and `resource/qooxdoo.js`):
  - npx http-server .

Notes:
- The TypeScript compiler options (module: AMD, outFile: `lib/application.js`) are configured in `tsconfig.json`.
- There are no test or lint scripts in package.json and no test files in the repository. If tests are added later, list how to run a single test here.

---

## High-level architecture

- This is a single-page demo app using the Qooxdoo UI framework.
- TypeScript source is under `src/` and compiled into a single bundle at `lib/application.js` (tsc outFile). `index.html` loads Qooxdoo (`resource/qooxdoo.js`) and then `lib/application.js`.
- Entry point: `src/application.ts` exports the qooxdoo main method (`qooxdooMain`) which is registered with `qx.registry.registerMainMethod`.
- Pages & navigation:
  - `src/pages/app-pages.ts` contains `PAGE_DEFINITIONS` and `SIDEBAR_DEFINITIONS` which define available pages and sidebar structure.
  - Each page is produced by a factory (e.g., `() => new ButtonsPage()`) so pages are instantiated on demand and cached by label.
  - Labels in `PAGE_DEFINITIONS` are used as keys in the `pageMap` and must match sidebar labels for navigation to work.
- Layouts & shell:
  - `src/layouts/main.ts` implements `MainLayout` which composes the sidebar, navbar, and main content region and handles responsive/mobile drawer behavior.
  - `src/layouts/login.ts` implements the login layout used when authentication is active.
- Components:
  - Reusable UI components live under `src/components/` (notably `src/components/ui`). Many are thin wrappers around Qooxdoo widgets and Basecoat UI styling.
- Types & typings:
  - `src/qooxdoo.d.ts` provides Qooxdoo TypeScript declarations used throughout the codebase.

---

## Key conventions and patterns

- Page factory pattern: `PAGE_DEFINITIONS` exposes pages as zero-argument factories returning a `qx.ui.core.Widget`. The registry and caching expect factories rather than single shared instances.
- Label-as-key: Page labels (human strings) are the authoritative keys for navigation and caching. Keep labels stable when renaming pages or update all references.
- Sidebar normalization: `manipulateSidebarItems` in `app-pages.ts` filters/normalizes sidebar items and will drop leaf items that don't have a corresponding page factory. Keep sidebar definitions in sync with `PAGE_DEFINITIONS`.
- Global content setter: `globalThis.setContent(contentOrFactory, title)` is used by the layout to replace main content; callers may pass either a widget or a factory.
- Component naming: UI components follow folder/class conventions: `components/ui/*` contain shared widgets; pages are named `*Page` and extend Qooxdoo widgets (e.g., `MainPage extends qx.ui.container.Composite`).
- Event pattern: Layouts and components often declare `static events = { ... }` and expose higher-level callbacks (e.g., `.onAction`) — follow existing patterns when adding new components.
- Keep AMD module settings in mind: code is compiled to a single AMD outFile; do not assume ES module bundling or tree-shaking.

---

## AI assistant / tooling files scanned

- Existing repository files checked for assistant rules/configs: none of CLAUDE.md, .cursorrules, AGENTS.md, .windsurfrules, CONVENTIONS.md, .clinerules were found.

---

## Quick checklist for Copilot sessions

- Look at `tsconfig.json` for module/outFile settings before suggesting build changes.
- Use `src/application.ts` and `src/pages/app-pages.ts` to understand navigation & page factories.
- When suggesting new pages, add a factory to `PAGE_DEFINITIONS` and a corresponding sidebar entry; ensure label strings match.
- Keep the `lib/application.js` artifact in mind: changes to `tsconfig.json` or the build step affect what `index.html` loads.

---

---

## Playwright end-to-end (E2E) testing

- Playwright config: `playwright.config.js` (webServer starts a local server on port 8080 using the existing `http-server` dependency).
- Install Playwright browsers and runner: npm run playwright:install
- Run all E2E tests: npm run test:e2e
- Run a single test file: npx playwright test tests/playwright/example.spec.js
- Run a single test in Chromium: npx playwright test tests/playwright/example.spec.js --project=chromium

## MCP Servers

- Playwright is configured as an E2E test server via `playwright.config.js`. It launches `npx http-server -p 8080 .` and runs tests against `http://localhost:8080`.
- Tests live under `tests/playwright/`.

If this repository gains additional tests or linting, update the scripts and instructions here.

# AGENTS.md

This file provides guidance for AI coding agents working in this repository.

---

## Build / Run / Serve

| Command | Description |
|---------|-------------|
| `npx tsc` | Compile TypeScript to single AMD bundle at `lib/application.js` |
| `npx tsc --watch --preserveWatchOutput` | Watch mode for development |
| `npx http-server .` | Serve the app locally (port 8080) |
| `npm run build` | Alias for `npx tsc` |
| `npm run watch` | Alias for watch mode |
| `npm run serve` | Alias for http-server |

---

## Testing

| Command | Description |
|---------|-------------|
| `npm run test:e2e` | Run all Playwright E2E tests |
| `npm run test:e2e:headed` | Run tests with browser visible |
| `npx playwright test tests/playwright/example.spec.js` | Run single test file |
| `npx playwright test tests/playwright/example.spec.js --project=chromium` | Run single test in Chromium |

**Note:** There are no unit tests or lint scripts. Tests live under `tests/playwright/`. Playwright config starts http-server on port 8080 automatically.

---

## High-level Architecture

- **Single-page app** using Qooxdoo UI framework
- TypeScript compiles to single AMD bundle: `lib/application.js`
- Entry point: `src/application.ts` exports `qooxdooMain`
- `index.html` loads `resource/qooxdoo.js` then `lib/application.js`

### Key Directories

```
src/
  application.ts          # Main entry point
  pages/
    app-pages.ts          # PAGE_DEFINITIONS & SIDEBAR_DEFINITIONS
    *-page.ts             # Individual page components
  components/ui/          # Reusable UI widgets (BsButton, BsCard, etc.)
  layouts/                # Main and login layouts
  dialogs/                # Dialog components
  interfaces/             # TypeScript interfaces
  types/                  # Type definitions
lib/                      # Compiled output (AMD bundle)
resource/                 # Static assets (images, qooxdoo.js)
tests/playwright/         # E2E tests
```

---

## Code Style Guidelines

### Naming Conventions

- **Classes**: PascalCase (e.g., `BsButton`, `AvatarPage`, `MainLayout`)
- **Private members**: Double underscore prefix (e.g., `__responsiveWidth`, `__onResize`)
- **Type aliases**: PascalCase with descriptive suffix (e.g., `BsAvatarShape`, `PageDefinition`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `PAGE_DEFINITIONS`, `SIDEBAR_DEFINITIONS`)
- **Files**: kebab-case (e.g., `avatar-page.ts`, `app-pages.ts`)

### Patterns

- **Page factory pattern**: Pages are zero-argument factories returning `qx.ui.core.Widget`
- **Label-as-key**: Page labels in `PAGE_DEFINITIONS` must match sidebar labels
- **Widget composition**: Extend Qooxdoo base classes (`qx.ui.container.Composite`, etc.)
- **Layout pattern**: Use `new qx.ui.layout.VBox(spacing)` or `HBox(spacing)` with `.set({ alignX: "center" })` for alignment

### Component Structure

```typescript
class BsComponent extends qx.ui.baseClass {
  // Private fields with __ prefix
  private __field: type;

  constructor(param?: type) {
    super();
    // Initialize
  }

  private __privateMethod(): void {
    // Implementation
  }

  public setSomething(value: type): this {
    // Setter returning this for chaining
    return this;
  }
}
```

### TypeScript

- No explicit imports needed (AMD single-file output, global namespace)
- Use `// @ts-ignore` sparingly for Qooxdoo internals
- Prefer `this` return type for setters to enable chaining
- Use nullish coalescing (`??`) for defaults
- Type unions for limited value sets (e.g., `"full" | "rounded" | "square"`)

### Layout & Styling

- Use Tailwind CSS classes for styling (applied via `className` parameter or HTML)
- Qooxdoo layout classes: `VBox`, `HBox`, `Grow`, `Grid`
- Spacing: pass numeric value to layout constructor (e.g., `new VBox(20)`)
- Alignment: use `.set({ alignX: "center", alignY: "middle" })`
- Responsive: check `this.__responsiveWidth < 768` for mobile breakpoint

### Resource Paths

- Images: `resource/app/filename.png`
- Icons use `InlineSvgIcon(name, size)` class

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/pages/app-pages.ts` | Page registry and sidebar definitions |
| `src/application.ts` | App entry point |
| `src/qooxdoo.d.ts` | Qooxdoo TypeScript declarations |
| `tsconfig.json` | Compiler options (AMD module, ES6 target) |
| `playwright.config.js` | E2E test configuration |

---

## Adding New Pages

1. Create `src/pages/my-page.ts` with class `MyPage extends qx.ui.container.Composite`
2. Add to `PAGE_DEFINITIONS` in `app-pages.ts`:
   ```typescript
   { label: "My Page", iconName: "icon-name", element: () => new MyPage() }
   ```
3. Add to `SIDEBAR_DEFINITIONS` under appropriate parent
4. Ensure label strings match exactly between definitions

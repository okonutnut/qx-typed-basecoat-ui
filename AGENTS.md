# AGENTS.md

Compact guidance for OpenCode sessions working in this repository.

---

## Build / Run

| Command | What it does |
|---------|-------------|
| `npx tsc` | Compile TS to AMD bundle `lib/application.js` |
| `npx tsc --watch --preserveWatchOutput` | Watch mode |
| `npx http-server .` | Serve app (port 8080) |
| `npm run build` | Alias for `npx tsc` |
| `npm run watch` | Alias for watch mode |
| `npm run serve` | Alias for http-server |

No lint, test, or typecheck commands exist. Only compile step.

---

## Architecture

- **SPA**: Qooxdoo framework + custom Basecoat UI components (shadcn-style)
- TypeScript compiles to **single AMD bundle** at `lib/application.js` via `tsconfig.json` (`module: "amd"`, `outFile`)
- Entry point: `src/application.ts` — registers `qooxdooMain` via `qx.registry.registerMainMethod(qooxdooMain)`
- Load order: `resource/qooxdoo.js` → `lib/application.js` (RequireJS)
- Two layout modes: `"main"` (sidebar + navbar + content) and `"fullscreen"` (login card), toggled by events, both in `src/components/Layout.ts`
- `globalThis.setContent(widgetOrFactory, title)` replaces main content area — defined in `MainLayout`

### Page Routing

- Single source of truth: `AppPages.ROUTE_DEFINITIONS` in `src/components/AppPages.ts`
- Nested tree with top-level groups. Pages created on demand via `element: () => new SomePage()` and cached by label in `pageMap`
- `manipulateSidebarItems()` drops leaf items with no matching page factory
- Labels are authoritative keys for navigation, caching, and sidebar matching — **must be kept in sync**

### Orphaned Pages

- `src/pages/buttons.ts` defines `ButtonsPage` but **no route references it** — both Qooxdoo UI "Buttons" and Basecoat UI "Button" route to `ButtonPage` (from `button-page.ts`)
- `src/pages/tree.ts` is a standalone function (not a page class) with no route reference

---

## Conventions

### Naming

- **Classes**: PascalCase (`BsButton`, `AvatarPage`, `MainLayout`)
- **Private members**: Double underscore prefix (`__responsiveWidth`, `__onResize`)
- **Files**: kebab-case (`avatar-page.ts`, `button-page.ts`)
- **Basecoat components**: `Bs` prefix (`BsButton`, `BsCard`, `BsInput`)

### Code Patterns

- **No ES imports/exports** — AMD single outFile means global namespace only
- **Setters return `this`** for chaining
- **Static events**: `static events = { execute: "qx.event.type.Event" }`, then convenience methods like `onClick(fn): this`
- **`// @ts-ignore` is needed extensively** (36+ occurrences) for Qooxdoo API calls due to incomplete type declarations in `src/qooxdoo.d.ts`
- **Widget composition**: Extend `qx.ui.basic.Atom` (label+icon) or `qx.ui.container.Composite`
- **`_setLayout`** (protected) when extending `Atom`; **`setLayout`** (public) when extending `Composite`
- **ResizeObserver** pattern used in input/control widgets for layout sync

### Basecoat UI specifics

- `BsToast` is a **static class** — requires `<div id="toaster"></div>` in DOM (present in `index.html`) for mount target
- `BsAlertDialog` is a **singleton static class** — call `BsAlertDialog.show(config)`
- API reference: `src/basecoatui.api.md` (381 lines, covers all 18 component files in `src/components/ui/`)
- Type declarations for Basecoat widgets: `src/types/custom-components.d.ts`

### Layout & Styling

- **Qooxdoo layouts**: `new VBox(spacing)`, `new HBox(spacing)`, `new Grow()`, `new Grid()`, `new Canvas()`
- **Alignment**: `.set({ alignX: "center", alignY: "middle" })`
- **Colors**: `AppColors` class resolves CSS custom properties (oklch values in `theme.css`) at runtime
- **Theming**: `theme.css` defines `:root` (light) and `.dark` (dark) CSS variables
- **Tailwind CSS**: CDN-loaded via `@tailwindcss/browser@4` in `index.html`
- **Basecoat CSS**: CDN-loaded `basecoat-css@0.3.11`, overridden by local `theme.css`
- **Icons**: `InlineSvgIcon(name, size)` fetches SVGs from `resource/app/icons/` at runtime (not bundled)
- **Resource paths**: Images at `resource/app/filename.png`
- **Responsive**: breakpoint at 768px, mobile sidebar uses `BsDrawer`

---

## Adding a New Page

1. Create `src/pages/my-page.ts` extending `BasePage` (class name `MyPage`)
2. Add to `ROUTE_DEFINITIONS` in `src/components/AppPages.ts`:
   ```typescript
   { label: "My Page", iconName: "icon-name", element: () => new MyPage() }
   ```
3. Add matching child under the appropriate parent in the nested tree
4. Label must match **exactly** between route definition and sidebar (trimmed, case-sensitive)

---

## OpenCode Skills

| Skill | When to use |
|-------|-------------|
| `qooxdoo` | Native Qooxdoo widgets, layouts, events, patterns |
| `basecoatui` | BsButton, BsCard, BsInput, BsDrawer, etc. — shadcn-style layer |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/components/AppPages.ts` | `AppPages.ROUTE_DEFINITIONS`, `AppPages.createSidebarItems()`, `AppPages.manipulateSidebarItems()` |
| `src/application.ts` | App entry point, layout switching, page map extraction |
| `src/components/Layout.ts` | `MainLayout` + `FullscreenLayout` |
| `src/qooxdoo.d.ts` | ~15k-line Qooxdoo TypeScript declarations |
| `src/basecoatui.api.md` | Basecoat UI component API reference |
| `src/types/custom-components.d.ts` | Basecoat UI widget type declarations |
| `src/components/ui/` | All 18 Basecoat UI component sources |
| `theme.css` | CSS custom properties, light/dark theme, Tailwind overrides |
| `tsconfig.json` | AMD module, ES6 target, single `outFile` |
| `basecoat-manifest.json` | File manifest consumed by `scripts/copy-basecoat.js` |
| `scripts/copy-basecoat.js` | Copies Basecoat UI to another qx-typed project |
| `BASEACOT-INTEGRATION.md` | Integration guide for consuming projects |

---

## Distribution

Basecoat UI is distributed as a copy-build module for in-house qx-typed projects.

| Command | What it does |
|---------|-------------|
| `node scripts/copy-basecoat.js <path>` | Copies all source, theme, icons, and assets to target project |
| Then `npx tsc` in target project | Compiles everything into one bundle |

**Source of truth**: `basecoat-manifest.json` lists every file, asset, and HTML requirement. The copy script reads this manifest; keep it in sync when adding/removing components.

**Updating consumers**: Re-run `node scripts/copy-basecoat.js <path>` after Basecoat changes. The script overwrites existing files and patches `tsconfig.json`.

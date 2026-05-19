# AGENTS.md

Guidance for AI coding agents working in this repository.

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

## Architecture

- **Single-page app** using Qooxdoo UI framework with custom Basecoat UI components
- TypeScript compiles to a single AMD bundle: `lib/application.js`
- Entry point: `src/application.ts` exports function registered via `qx.registry.registerMainMethod(qooxdooMain)`
- `index.html` loads Qooxdoo (`resource/qooxdoo.js`), Tailwind CSS (CDN), Basecoat CSS (CDN), then the compiled bundle
- **Two layout modes**: `"main"` (sidebar + navbar + content) and `"login"` (auth screen), toggled by events
- **PWA**: Service worker at `sw.js`, manifest at `manifest.webmanifest`

### Page Routing

- Single source of truth: `ROUTE_DEFINITIONS` in `src/pages/app-pages.ts` (not `PAGE_DEFINITIONS`)
- Nested tree with two top-level groups: **"Qooxdoo UI"** (native widgets) and **"Basecoat UI"** (custom `Bs*` components)
- Labels (human strings) are the authoritative keys for navigation, caching, and sidebar matching
- `manipulateSidebarItems()` drops leaf items that have no matching page factory -- keep labels in sync
- Sidebar: drill-down tree with search, back navigation, collapse/expand, and mobile drawer mode

### Two-Tier Pages

| Group | Page class convention | Files |
|-------|----------------------|-------|
| Qooxdoo UI | `ButtonsPage`, `ControlPage`, `FormPage`, `ToolBarPage`, `WindowsPage` | `src/pages/buttons.ts`, `control.ts`, etc. |
| Basecoat UI | `ButtonPage`, `CardPage`, `InputPage`, `SelectPage`, `TextareaPage`, `AvatarPage`, `AlertDialogPage`, `LabelPage`, `ToastPage`, `SliderPage`, `ComboboxPage`, `RadioGroupPage` | `src/pages/*-page.ts` (some omit `-page` suffix) |

---

## Key Conventions

### Naming

- **Classes**: PascalCase (`BsButton`, `AvatarPage`, `MainLayout`)
- **Private members**: Double underscore prefix (`__responsiveWidth`, `__onResize`)
- **Constants**: UPPER_SNAKE_CASE (`ROUTE_DEFINITIONS`)
- **Type aliases**: PascalCase with descriptive suffix (`BsButtonVariant`, `SidebarItem`)
- **Files**: kebab-case (`avatar-page.ts`, `app-pages.ts`)
- **Basecoat components**: `Bs` prefix (`BsButton`, `BsCard`, `BsInput`)

### Code Patterns

- **No ES imports/exports** -- AMD single-file output means all code shares the global namespace
- **Page factory pattern**: `ROUTE_DEFINITIONS` entries have `element: () => new SomePage()` -- pages are instantiated on demand and cached by label
- **Widget composition**: Extend Qooxdoo base classes (`qx.ui.container.Composite`, `qx.ui.basic.Atom`, etc.)
- **Inline HTML rendering**: Most Basecoat UI components render native HTML via `qx.ui.embed.Html` to apply Tailwind CSS classes directly (not via `className` parameter)
- **Static events**: `static events = { execute: "qx.event.type.Event" }` followed by convenience methods like `onClick(fn): this`
- **Setters return `this`** for chaining
- **`// @ts-ignore`** used sparingly for Qooxdoo internals (e.g., `new qx.bom.Font(...)`)
- **Dynamic theming**: `AppColors` class resolves CSS custom properties (oklch values in `theme.css`) at runtime
- **Icons**: `InlineSvgIcon(name, size)` fetches SVGs from `resource/app/icons/` and renders inline
- **Resource paths**: Images at `resource/app/filename.png`
- **Responsive**: `__responsiveWidth` field with resize listener, breakpoint at 768px

### Layout & Styling

- **Qooxdoo layouts**: `new VBox(spacing)`, `new HBox(spacing)`, `new Grow()`, `new Grid()`
- **Alignment**: `.set({ alignX: "center", alignY: "middle" })`
- **Tailwind classes** applied via HTML strings rendered in `qx.ui.embed.Html` widgets
- **Basecoat CSS**: CDN-loaded at `basecoat-css@0.3.11`, overridden by local `theme.css`

---

## Adding New Pages

1. Create page file under `src/pages/` with class extending `qx.ui.container.Composite` (name: `*Page`)
2. Add an entry to `ROUTE_DEFINITIONS` in `app-pages.ts`:
   ```typescript
   { label: "My Page", iconName: "icon-name", element: () => new MyPage() }
   ```
3. Add a matching child entry under the appropriate parent in the nested tree
4. Labels must match exactly between route definition and sidebar (they are the key)

---

## Key Files

| File | Purpose |
|------|---------|
| `src/pages/app-pages.ts` | `ROUTE_DEFINITIONS`, `createSidebarItems()`, `manipulateSidebarItems()` |
| `src/application.ts` | App entry point, layout switching |
| `src/qooxdoo.d.ts` | 15k-line Qooxdoo TypeScript declarations |
| `src/components/ui/` | Basecoat UI components (BsButton, BsCard, BsInput, etc.) |
| `src/app-colors.ts` | Runtime CSS variable resolution for theming |
| `src/sidebar.ts` | Sidebar navigation widget with search and drill-down |
| `src/layouts/main.ts` | Main layout (sidebar, navbar, content, responsive drawer) |
| `theme.css` | CSS custom properties (oklch colors), Tailwind variable mappings |
| `tsconfig.json` | AMD module, ES6 target, single `outFile` |

# AGENTS.md

Guidance for OpenCode sessions working in this repository.

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

- **SPA** using Qooxdoo framework + custom Basecoat UI components (shadcn-style)
- TypeScript compiles to **single AMD bundle** at `lib/application.js` via `tsconfig.json` (`module: "amd"`, `outFile`)
- Entry point: `src/application.ts` — registers `qooxdooMain` via `qx.registry.registerMainMethod(qooxdooMain)`
- Load order: `resource/qooxdoo.js` → `lib/application.js` (RequireJS)
- **Two layout modes**: `"main"` (sidebar + navbar + content area) and `"fullscreen"` (login/auth screen), toggled by events

### Page Routing

- Single source of truth: `ROUTE_DEFINITIONS` in `src/pages/app-pages.ts`
- Nested tree with top-level groups: "Qooxdoo UI" (native widgets) and "Basecoat UI" (custom `Bs*` components)
- Labels (human strings) are authoritative keys for navigation, caching, and sidebar matching — **must be kept in sync**
- `manipulateSidebarItems()` drops leaf items with no matching page factory
- Pages are instantiated on demand via factory `element: () => new SomePage()` and cached by label in `pageMap`

### Two-Tier Pages

| Group | Page classes | Convention |
|-------|-------------|------------|
| Qooxdoo UI | `ButtonsPage`, `ControlPage`, `FormPage`, `ToolBarPage`, `WindowsPage` | `src/pages/buttons.ts`, `control.ts`, etc. |
| Basecoat UI | `ButtonPage`, `CardPage`, `InputPage`, `SelectPage`, `TextareaPage`, `AvatarPage`, `AlertDialogPage`, `LabelPage`, `ToastPage`, `SliderPage`, `ComboboxPage`, `RadioGroupPage` | `src/pages/*-page.ts` (some omit suffix) |

---

## Conventions

### Naming

- **Classes**: PascalCase (`BsButton`, `AvatarPage`, `MainLayout`)
- **Private members**: Double underscore prefix (`__responsiveWidth`, `__onResize`)
- **Constants**: UPPER_SNAKE_CASE (`ROUTE_DEFINITIONS`, `DEFAULT_APP_CONFIG`)
- **Type aliases**: PascalCase with suffix (`BsButtonVariant`, `SidebarItem`)
- **Files**: kebab-case (`avatar-page.ts`, `app-pages.ts`)
- **Basecoat components**: `Bs` prefix (`BsButton`, `BsCard`, `BsInput`)

### Code Patterns

- **No ES imports/exports** — AMD single outFile means global namespace only (do not write `import`/`export`)
- **Setters return `this`** for chaining — always return `this` from setter methods
- **Static events**: `static events = { execute: "qx.event.type.Event" }` followed by convenience methods like `onClick(fn): this`
- **Inline HTML rendering**: Most Basecoat UI components render native HTML via `qx.ui.embed.Html` to apply Tailwind CSS classes directly
- **`// @ts-ignore`** needed above `new qx.bom.Font(...)` due to incomplete Qooxdoo type declarations in `src/qooxdoo.d.ts`
- **Widget composition**: Extend `qx.ui.basic.Atom` (label+icon) or `qx.ui.container.Composite` (container with layout)
- **`_setLayout`** (protected) when extending `Atom`; **`setLayout`** (public) when extending `Composite`
- **ResizeObserver** pattern used in most input/control widgets for layout sync

### Basecoat UI specifics

- `BsToast` is a **static class** — call `BsToast.show(...)` or convenience methods like `BsToast.info(...)`
- `BsAlertDialog` is a **singleton static class** — call `BsAlertDialog.show(config)`
- API reference available at `src/basecoatui.api.md`

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

1. Create `src/pages/my-page.ts` extending `qx.ui.container.Composite` (class name: `MyPage`)
2. Add to `ROUTE_DEFINITIONS` in `src/pages/app-pages.ts`:
   ```typescript
   { label: "My Page", iconName: "icon-name", element: () => new MyPage() }
   ```
3. Add matching child under appropriate parent in the nested tree
4. Label must match **exactly** between route definition and sidebar (trimmed, case-sensitive)

---

## OpenCode Skills

Two skills are already installed and should be consulted via `skill` tool:

| Skill | When to use |
|-------|-------------|
| `qooxdoo` | Native Qooxdoo widgets, layouts, events, patterns |
| `basecoatui` | BsButton, BsCard, BsInput, BsDrawer, etc. — shadcn-style layer |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/pages/app-pages.ts` | `ROUTE_DEFINITIONS`, `createSidebarItems()`, `manipulateSidebarItems()` |
| `src/application.ts` | App entry point, layout switching, page map extraction |
| `src/qooxdoo.d.ts` | ~15k-line Qooxdoo TypeScript declarations |
| `src/basecoatui.api.md` | Basecoat UI component API reference (constructors, methods, events) |
| `src/components/ui/` | Basecoat UI components (BsButton, BsCard, BsInput, etc.) |
| `src/interfaces/AppConfig.ts` | `AppConfig` interface and `DEFAULT_APP_CONFIG` |
| `src/interfaces/sidebar-item.ts` | `SidebarItem` interface |
| `src/app-colors.ts` | Runtime CSS variable resolution for theming |
| `src/sidebar.ts` | Sidebar navigation widget (search, drill-down, collapse, drawer mode) |
| `src/layouts/main.ts` | Main layout (sidebar, navbar, content, responsive drawer) |
| `src/layouts/fullscreen-layout.ts` | Fullscreen layout (login/auth screen) |
| `src/navbar.ts` | Navbar with page title and actions popup |
| `src/components/InlineSvgIcon.ts` | Inline SVG icon fetcher |
| `src/dialogs/about.ts` | About dialog |
| `theme.css` | CSS custom properties (oklch), light/dark theme, Tailwind mappings |
| `tsconfig.json` | AMD module, ES6 target, single `outFile` |

# Portable Qooxdoo Layout & Navigation Module

A self-contained, configurable module providing a responsive sidebar + navbar layout (`MainLayout`) and a centered card auth layout (`FullscreenLayout`) for Qooxdoo SPAs styled with Tailwind CSS + Basecoat CSS.

---

## Architecture

```
Your Application Entry Point (~15 lines)
└─ AppManager (automates layout setup, page map, sidebar)
   └─ AppConfig (configuration object)
      ├─ MainLayout (sidebar + navbar + scrollable content)
      │  ├─ Sidebar (navigation tree with drill-down, search, collapse)
      │  │  ├─ BsInput (search bar)
      │  │  ├─ BsSidebarButton (nav items)
      │  │  └─ BsSidebarAccount (footer user menu)
      │  ├─ Navbar (page title, toggle sidebar, actions popup)
      │  │  ├─ BsButton (toggle/actions triggers)
      │  │  └─ BsSidebarButton (action menu items)
      │  ├─ BsDrawer (mobile drawer overlay)
      │  └─ BsSidebarAccount (mobile top bar account)
      └─ FullscreenLayout (centered card for auth)
         ├─ BsInput (username)
         ├─ BsPassword (password field)
         └─ BsButton (sign-in submit)
```

All classes use the AMD global-namespace pattern (no ES imports/exports), compatible with Qooxdoo's single-file build (`outFile`).

---

## File Manifest

Copy these files from the source project into your target project:

### Core Layouts (required)
| Destination | Source |
|-------------|--------|
| `src/config/app-manager.ts` | `AppManager` — plug-and-play layout orchestrator |
| `src/config/app-pages.ts` | `AppPages` — route definitions, sidebar item helpers |
| `src/config/base-page.ts` | `BasePage` — page base class with responsive support |
| `src/config/main-page.ts` | `MainPage` — built-in default startup/welcome page (can be overridden) |
| `src/config/app-config.ts` | `AppConfig` — configuration interface + defaults |
| `src/layouts/main.ts` | `MainLayout` — responsive sidebar + navbar + content |
| `src/layouts/fullscreen-layout.ts` | `FullscreenLayout` — centered card screen |
| `src/navbar.ts` | `Navbar` — top bar with title, toggle, actions |
| `src/sidebar.ts` | `Sidebar` — drill-down navigation tree |

### Custom UI Components (required by layouts)
See `components/ui/README.md` for the full list of Bs* widgets.

### Supporting Files
| File | Purpose |
|------|---------|
| `src/interfaces/sidebar-item.ts` | `SidebarItem` type used by sidebar |
| `src/app-colors.ts` | `AppColors` — runtime CSS variable resolution |
| `components/InlineSvgIcon.ts` | Async SVG icon fetcher |

### Theme (required)
| File | Purpose |
|------|---------|
| `theme.css` | CSS custom properties (oklch), light/dark mode, Tailwind mappings |
| `basecoat-css` v0.3.11 | CDN: provides `btn-*`, `input` utility classes |
| Tailwind CSS v4 | CDN: utility classes for inline HTML |

---

## Configuration Reference

All hardcoded values are consolidated into the `AppConfig` interface.

```typescript
interface AppConfig {
  appName: string;          // Sidebar header
  appVersion: string;       // Sidebar version label
  resources: {
    logo: string;           // Path to app logo image
    userAvatar: string;     // Default user avatar image
    iconsBaseUrl: string;   // Base URL for InlineSvgIcon SVGs
  };
  user: {
    name: string;           // Default user display name
    role: string;           // Default user role/title
  };
  login: {
    title: string;          // FullscreenLayout heading
    subtitle: string;       // FullscreenLayout subheading
  };
  callbacks: {
    onLogout: () => void;   // Called when user logs out (required)
    onAbout?: () => void;   // Called from Navbar "About" action
    onSupport?: () => void; // Called from Navbar "Support" action
    onSettings?: () => void;
    onProfile?: () => void;
  };
  sidebar: {
    width: number;           // Expanded sidebar width (default 230)
    collapsedWidth: number;  // Collapsed sidebar width (default 56)
  };
}
```

`DEFAULT_APP_CONFIG` provides sensible defaults. Pass a `Partial<AppConfig>` to override only what you need.

---

## Integration Guide

### 1. HTML Setup

```html
<!-- Tailwind CSS (required for utility classes) -->
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

<!-- Basecoat UI (required for btn-*, input classes) -->
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/basecoat-css@0.3.11/dist/basecoat.cdn.min.css" />

<!-- Your theme overrides -->
<link rel="stylesheet" href="theme.css" />

<!-- Basecoat JS (optional, for interactive components) -->
<script src="https://cdn.jsdelivr.net/npm/basecoat-css@0.3.11/dist/js/all.min.js" defer></script>

<!-- Qooxdoo framework -->
<script src="resource/qooxdoo.js"></script>

<!-- Your compiled application -->
<script src="lib/application.js"></script>
```

### 2. Define Pages & Routes (project-specific)

The default startup page (`MainPage`) is **built-in** — it displays the app name, version, and user name from `AppConfig`. Each project can optionally override it by defining its own `class MainPage` anywhere in the source tree (AMD global namespace means your definition takes precedence).

```typescript
const ROUTE_DEFINITIONS: RouteDefinition[] = [
  {
    label: "Section",
    iconName: "folder",
    children: [
      { label: "Page 1", iconName: "file", element: () => new Page1() },
      { label: "Page 2", iconName: "file", element: () => new Page2() },
    ],
  },
];
```

> Note: `AppManager` handles `extractPageMap`, `createSidebarItems`, and `manipulateSidebarItems` internally. You only need to provide `ROUTE_DEFINITIONS`.

### 3. Create AppConfig

```typescript
const appConfig: AppConfig = {
  ...DEFAULT_APP_CONFIG,
  appName: "My App",
  appVersion: "1.0.0",
  user: { name: "Alice", role: "Admin" },
  login: {
    title: "Company Name",
    subtitle: "Location",
  },
  callbacks: {
    onLogout: () => appManager.setLayout("fullscreen"),
    onAbout: () => showMyAboutDialog(),
  },
};
```

### 4. Wire Layouts in Entry Point

`AppManager` replaces all the boilerplate — just pass config and routes:

```typescript
function qooxdooMain(app: qx.application.Standalone) {
  const root = <qx.ui.container.Composite>app.getRoot();

  const appManager = new AppManager(root, {
    appName: "My App",
    appVersion: "1.0.0",
    user: { name: "Alice", role: "Admin" },
    login: {
      title: "Company Name",
      subtitle: "Location",
    },
    callbacks: {
      onLogout: () => appManager.setLayout("fullscreen"),
      onAbout: () => showMyAboutDialog(),
    },
  }, ROUTE_DEFINITIONS);

  appManager.start();
}

qx.registry.registerMainMethod(qooxdooMain);
```

`AppManager` handles everything internally:
- Sets `InlineSvgIcon.iconsBaseUrl` from config
- Extracts page map from route definitions
- Builds and filters sidebar items
- Creates `MainLayout` with `MainPage` as initial content
- Creates `FullscreenLayout` on demand
- Wires login/logout event listeners
- Exposes `globalThis.appManager` for access from any page

> **Note**: `MainPage` is **built-in** and reads `AppConfig` to display the app name, version, and user name. To create a custom startup page, simply define `class MainPage` in your own source tree — it will silently override the default (AMD global namespace).

### 5. Access AppManager from Anywhere

`AppManager` is exposed globally after `start()`:

```typescript
// Any page or component can switch layouts
(globalThis as any).appManager.setLayout("fullscreen");

// Or typed via declaration:
declare global { var appManager: AppManager; }
appManager.setLayout("main");
```

### 6. Switch Content Pages at Runtime

`MainLayout` exposes a global function `globalThis.setContent(contentOrFactory, title)` to swap the main content area:

```typescript
globalThis.setContent(new MyPage(), "My Page");
// or with lazy factory:
globalThis.setContent(() => new MyPage(), "My Page");
```

The sidebar's `"select"` event automatically calls `setContent` using the page map.

---

## Key Behaviors

### Sidebar
- **Drill-down**: clicking a parent item pushes children onto a stack with animated slide transitions
- **Back navigation**: "Back" button appears when inside a nested level
- **Search**: filters all leaf items across the tree by label + path, click navigates directly
- **Collapse/expand**: animated width transition, hides text labels, shows compact icon-only mode
- **Drawer mode**: on mobile (<768px), sidebar becomes a bottom-sheet drawer via `BsDrawer`
- **Active state**: highlights the currently selected leaf button

### FullscreenLayout
- Centered card with logo, title, subtitle, username/password inputs, and submit button
- Fires `"login"` event on submit (Enter key also triggers within the card)
- Exposes `loginError` label for inline error messages

### MainPage (built-in default)
- Extends `BasePage` with a centered welcome card
- Displays user name, app name, and version from `AppConfig`
- Falls back to generic text when config values are empty
- Responsive width adapts to viewport
- **Override**: define your own `class MainPage` anywhere in the project to replace it

### MainLayout
- Responsive: automatically switches between desktop (sidebar + content) and mobile (drawer) at 768px breakpoint
- `Navbar` toggle button collapses sidebar on desktop, opens drawer on mobile
- Page caching: pages are instantiated once and cached by label
- Scrollable content area

### Navbar
- Left: hamburger button to toggle sidebar/drawer
- Center: page title (dynamic via `setPageTitle()`)
- Right: ellipsis actions menu (Support, About — configurable via callbacks)

---

## Class API Reference

### `AppManager`
```
constructor(
  root: qx.ui.container.Composite,
  config?: Partial<AppConfig>,
  routes?: RouteDefinition[]
)

Methods:
  setLayout(mode: "main" | "fullscreen")   — toggle between layouts
  start(initialMode?: "main" | "fullscreen") — init app, exposes globalThis.appManager
```

### `Sidebar`
```
constructor(
  sidebarItems: SidebarItem[],
  initialActiveLabel?: string,
  config?: Partial<AppConfig>
)

Events: select (Data — leaf label), action (Data — "logout")
Methods:
  setCollapsed(boolean)           — animate collapse/expand
  setDrawerMode(boolean)          — switch to drawer chrome
  isCollapsed(): boolean
```

### `MainLayout`
```
constructor(
  content: qx.ui.core.Widget,
  sidebarItems: SidebarItem[],
  pageMap: Map<string, () => qx.ui.core.Widget>,
  pageTitle?: string,
  config?: Partial<AppConfig>
)

Events: logout
Globals: globalThis.setContent(contentOrFactory, title)
```

### `FullscreenLayout`
```
constructor(config?: Partial<AppConfig>)

Events: login
```

### `Navbar`
```
constructor(
  pageTitle?: string,
  onToggleSidebar?: () => void,
  config?: Partial<AppConfig>
)

Methods:
  setPageTitle(value: string)
  setTitle(value: string)
```

### `InlineSvgIcon`
```
static iconsBaseUrl: string   // default "resource/app/icons/"

constructor(name: string, size?: number)

Methods:
  setIcon(name: string)
  setSize(size: number)
```

---

## Requirements

| Dependency | Version | Notes |
|------------|---------|-------|
| Qooxdoo | any (AMD build) | Framework |
| TypeScript | any (targeting ES6) | Build tool |
| Tailwind CSS | v4 | CDN, utility classes |
| Basecoat CSS | 0.3.11 | CDN, btn-*/input classes |
| theme.css | — | Local file, CSS variables |

### CSS Dependency Chain (Required in `index.html` `<head>`)

All Bs* UI components render inline HTML that uses Tailwind utility classes AND Basecoat CSS classes (like `btn-sm-ghost`, `input`, `primary`, `destructive`, etc.). Basecoat CSS itself is built on top of Tailwind. Therefore these two CDN links **must** be added to your `index.html` `<head>` **before** your app's compiled bundle:

```html
<!-- 1. Tailwind (required by Basecoat + Bs components) -->
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

<!-- 2. Basecoat CSS (provides btn-*, input, and other shadcn-style classes) -->
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/basecoat-css@0.3.11/dist/basecoat.cdn.min.css" />

<!-- 3. Your theme overrides (must come after Basecoat to override) -->
<link rel="stylesheet" href="theme.css" />
```

> **Important**: The order matters — Tailwind first, then Basecoat, then your custom `theme.css` on top. Without these, buttons, inputs, and sidebar items will have no visual styling.

---

## Responsive Breakpoints

| Range | Layout | Sidebar Mode |
|-------|--------|-------------|
| >= 768px | Desktop sidebar + navbar + scroll content | Collapsible inline |
| < 768px | Bottom-sheet drawer + mobile top bar + content | Drawer (BsDrawer) |

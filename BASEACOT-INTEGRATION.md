# Basecoat UI Integration Guide

Copy-build module that adds shadcn-style components (`BsButton`, `BsCard`, etc.)
and a responsive layout system (`MainLayout` + `FullscreenLayout`) to any
qx-typed project.

---

## Prerequisites

- A qx-typed project (fork of [github.com/jbaron/qx-typed](https://github.com/jbaron/qx-typed))
- TypeScript installed
- `http-server` or equivalent for serving

---

## Quick Start

### 1. Copy Basecoat files

From the Basecoat UI repository, run:

```bash
node scripts/copy-basecoat.js ../your-target-project
```

This copies:
- All 18 Bs\* component source files → `src/components/ui/`
- Layout system → `src/components/Layout.ts`, `src/navbar.ts`, `src/sidebar.ts`
- Utilities → `src/components/InlineSvgIcon.ts`, `src/app-colors.ts`
- Interfaces → `src/interfaces/AppConfig.ts`, `src/interfaces/sidebar-item.ts`
- Type declarations → `src/types/custom-components.d.ts`
- Theme → `theme.css`
- Icons + images → `resource/app/icons/`, `resource/app/user.png`, `resource/app/app_logo.png`
- Patches `tsconfig.json` to include the new files

### 2. Update `index.html`

Add these to `<head>` (order matters):

```html
<!-- Tailwind CSS (required for utility classes) -->
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

<!-- Basecoat CSS (provides btn-*, input classes) -->
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/basecoat-css@0.3.11/dist/basecoat.cdn.min.css" />

<!-- Your theme overrides (must come after Basecoat) -->
<link rel="stylesheet" href="theme.css" />

<!-- Basecoat JS (interactive components) -->
<script src="https://cdn.jsdelivr.net/npm/basecoat-css@0.3.11/dist/js/all.min.js" defer></script>
```

Add this to `<body>` (required by `BsToast`):

```html
<div id="toaster"></div>
```

### 3. Set icons base URL

In your `qooxdooMain()` or early setup:

```typescript
InlineSvgIcon.iconsBaseUrl = "resource/app/icons/";
```

### 4. Build

```bash
npx tsc
```

### 5. Use

```typescript
const btn = new BsButton("Click me", undefined, { variant: "default" });
const card = new BsCard("Title", "Description");
const layout = new MainLayout(content, sidebarItems, pageMap, title, config);
```

---

## File Reference

### Components (`src/components/ui/`)

| Class | File | Description |
|-------|------|-------------|
| `BsButton` | `Button.ts` | shadcn-style button (default, secondary, destructive, outline, ghost, link) |
| `BsCard` | `Card.ts` | Card with header, description, content slots |
| `BsInput` | `Input.ts` | Text input with leading icon support |
| `BsInputGroup` | `InputGroup.ts` | Labeled input group with error state |
| `BsPassword` | `Password.ts` | Password input with show/hide toggle |
| `BsTextarea` | `Textarea.ts` | Multi-line text input |
| `BsSelect` | `Select.ts` | Dropdown select |
| `BsCombobox` | `Combobox.ts` | Combobox with typeahead |
| `BsRadioGroup` | `RadioGroup.ts` | Radio button group |
| `BsSlider` | `Slider.ts` | Range slider |
| `BsLabel` | `Label.ts` | Styled label |
| `BsAvatar` | `Avatar.ts` | Avatar with image/fallback/shape |
| `BsSeparator` | `Separator.ts` | Visual divider |
| `BsDrawer` | `Drawer.ts` | Slide-in panel (used for mobile sidebar) |
| `BsAlertDialog` | `AlertDialog.ts` | Modal dialog (singleton) |
| `BsToast` | `Toast.ts` | Toast notification (static class) |
| `BsSidebarButton` | `SidebarButton.ts` | Sidebar navigation item |
| `BsSidebarAccount` | `SidebarAccount.ts` | Sidebar user account footer |

### Layout System

| Class | File | Description |
|-------|------|-------------|
| `MainLayout` | `src/components/Layout.ts` | Responsive sidebar + navbar + scrollable content |
| `FullscreenLayout` | `src/components/Layout.ts` | Centered card for login/auth |
| `Sidebar` | `src/sidebar.ts` | Drill-down navigation tree |
| `Navbar` | `src/navbar.ts` | Top bar with title, sidebar toggle, actions |

### Utilities

| Class | File | Description |
|-------|------|-------------|
| `InlineSvgIcon` | `src/components/InlineSvgIcon.ts` | Async SVG icon fetcher (Lucide icons) |
| `AppColors` | `src/app-colors.ts` | Runtime CSS variable resolution for theming |

### Interfaces

| Interface | File |
|-----------|------|
| `AppConfig` | `src/interfaces/AppConfig.ts` |
| `SidebarItem` | `src/interfaces/sidebar-item.ts` |

---

## Application Architecture

### Entry point pattern

```typescript
function qooxdooMain(app: qx.application.Standalone) {
  const root = app.getRoot();
  let currentLayout: AppLayoutMode = "main";

  InlineSvgIcon.iconsBaseUrl = "resource/app/icons/";

  const pageMap = extractPageMap(ROUTE_DEFINITIONS);
  const sidebarItems = manipulateSidebarItems(createSidebarItems(), pageMap);

  const appConfig: AppConfig = {
    ...DEFAULT_APP_CONFIG,
    appName: "My App",
    // ... customize
  };

  const createMainLayout = () => {
    const layout = new MainLayout(
      new WelcomePage(), sidebarItems, pageMap, "Welcome", appConfig
    );
    layout.addListener("logout", () => setLayout("fullscreen"));
    return layout;
  };

  const createFullscreenLayout = () => {
    const layout = new FullscreenLayout(appConfig);
    layout.addListener("login", () => setLayout("main"));
    return layout;
  };

  const setLayout = (mode: AppLayoutMode) => {
    root.removeAll();
    root.add(
      mode === "main" ? createMainLayout() : createFullscreenLayout(),
      { edge: 0 }
    );
  };

  setLayout("main");
}

qx.registry.registerMainMethod(qooxdooMain);
```

### Switching content

`MainLayout` exposes `globalThis.setContent(widgetOrFactory, title)`:

```typescript
globalThis.setContent(new MyPage(), "My Page");
```

The sidebar fires a `"select"` event that calls `setContent` automatically.

---

## Updating Basecoat

When the Basecoat UI repository gets updates:

```bash
cd basecoat-ui
# pull latest changes
git pull
# re-copy to consuming projects
node scripts/copy-basecoat.js ../your-target-project
```

The script overwrites existing files. Rebuild the consuming project after copying.

---

## HTML Requirements Summary

| Item | Required by | Notes |
|------|-------------|-------|
| Tailwind CSS v4 CDN | All Bs\* components | Renders utility classes |
| Basecoat CSS v0.3.11 CDN | All Bs\* components | Provides btn-\*, input classes |
| `theme.css` | Bs\* components, Layout | CSS variables (oklch), light/dark |
| Basecoat JS (deferred) | Interactive components | Optional but recommended |
| `<div id="toaster">` | `BsToast` | Mount point for toasts |

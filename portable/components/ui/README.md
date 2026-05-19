# UI Components

These custom Qooxdoo widgets (Bs-prefixed) are required by the portable layouts and navigation.
Copy the corresponding files from `src/components/ui/` when reusing in a new project.

| Component | File | Required By |
|-----------|------|-------------|
| `BsButton` | `src/components/ui/Button.ts` | Navbar, FullscreenLayout |
| `BsInput` | `src/components/ui/Input.ts` | Sidebar (search), FullscreenLayout |
| `BsPassword` | `src/components/ui/Password.ts` | FullscreenLayout |
| `BsSidebarButton` | `src/components/ui/SidebarButton.ts` | Sidebar, Navbar, SidebarAccount |
| `BsSidebarAccount` | `src/components/ui/SidebarAccount.ts` | Sidebar, MainLayout (mobile bar) |
| `BsDrawer` | `src/components/ui/Drawer.ts` | MainLayout (mobile drawer mode) |

Additional shared dependency:

| Component | File | Required By |
|-----------|------|-------------|
| `InlineSvgIcon` | `src/components/InlineSvgIcon.ts` | All of the above |

## Tailwind / Basecoat CSS Classes Used

These components render inline HTML with Tailwind + Basecoat CSS classes.
The consuming project must provide these via CDN (see index.html):

### From Basecoat CSS:
- `btn-*` variants: `primary`, `secondary`, `destructive`, `outline`, `ghost`, `link`
- Size prefixes: `btn-sm-*`, `btn-lg-*`, `btn-icon-*`, `btn-sm-icon-*`, `btn-lg-icon-*`
- `input` class for form inputs

### From Tailwind CSS (utility classes):
- Layout: `w-full`, `h-full`, `flex`, `items-center`, `justify-center`, `justify-start`, `gap-2`
- Sizing: `size-8`, `h-10`, `min-w-0`, `w-48`, `px-0`, `py-0`, `p-1`
- Typography: `truncate`, `text-sm`, `text-xs`, `font-medium`, `leading-tight`
- Visual: `rounded-md`, `rounded-full`, `overflow-hidden`, `opacity-50`, `opacity-75`, `select-none`
- Positioning: `relative`, `absolute`, `inset-0`, `top-1/2`, `left-3`, `-translate-y-1/2`
- Transitions: `transition`, `duration-200`, `ease-in-out`
- Color: `text-foreground`, `text-muted-foreground`, `bg-card`, `bg-muted`, `border-border`

### Custom theme.css variables:
- `--color-*` mappings (background, foreground, card, primary, border, sidebar, etc.)
- Light and dark mode classes

# UI Components & Design System — Sahara

Sahara implements a custom Apple Human Interface Guidelines (HIG) component layer with zero third-party component dependencies.

---

## 1. Tokens (`app/globals.css`)

- **Palette**:
  - Canvas: `#f5f5f7` (neutral warm gray)
  - Surface: `#ffffff`
  - Ink: `#1d1d1f` (primary body/headings)
  - Secondary Ink: `#6e6e73`
  - Accent: `#1d3529` (deep obsidian forest green)
  - Apple Blue: `#0071e3`
- **Hairlines**: `rgba(0, 0, 0, 0.08)` for high-density divider lines.
- **Backdrop Blur**: `backdrop-blur-md bg-white/80` for navigation bars and modals.
- **Focus Rings**: `0 0 0 4px rgba(0, 113, 227, 0.28)`.
- **Reduced Motion**: Automatically disables animations when `prefers-reduced-motion` is detected.

---

## 2. Primitive Components (`components/ui/**`)

### `Button` (`components/ui/Button.tsx`)
Pill-shaped or rounded button with built-in loading spinner state.
- **Variants**: `primary`, `secondary`, `danger`, `ghost`, `link`
- **Sizes**: `sm`, `md`, `lg` (all satisfying min 44px touch targets on mobile)

### `Badge` (`components/ui/Badge.tsx`)
Compact pill badge for discounts, status, and alerts.
- **Variants**: `neutral`, `accent`, `success`, `warning`, `error`

### `Stepper` (`components/ui/Stepper.tsx`)
Accessible quantity selector with min 44px tap targets for mobile usability.
- Supports `min`, `max`, `onChange`, and `aria-live` announcements.

### `Switch` (`components/ui/Switch.tsx`)
Classic iOS sliding toggle for instant status toggling (used in admin product active state).

### `Segmented` (`components/ui/Segmented.tsx`)
iOS segmented control tab bar for filtering or view switching.

### `Skeleton` (`components/ui/Skeleton.tsx`)
Shimmering placeholder used instead of spinners for content loading states.

### `EmptyState` (`components/ui/EmptyState.tsx`)
Friendly, warm placeholder for empty carts, zero search results, or fresh catalogs with a direct CTA.

### `Toast` (`components/ui/Toast.tsx`)
Non-intrusive floating feedback banner with automatic timeout and status icons.

### `Sheet` (`components/ui/Sheet.tsx`)
Bottom sheet drawer on mobile viewports with an iOS grab handle, and center modal on desktop. Handles Escape key and body scroll locks.

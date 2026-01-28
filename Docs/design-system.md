# Design System for VibeNotes

The design system defines UI patterns & styles for the generated frontend.

## 1. Visual Theme
### Light Theme
- Background: #fafafa
- Surface: #ffffff
- Text primary: #111111
- Text secondary: #555555
- Border: #e2e2e2
- Accent: #4f46e5 (indigo)

### Dark Theme
- Background: #0f0f0f
- Surface: #1c1c1c
- Text primary: #ffffff
- Text secondary: #b5b5b5
- Border: #2a2a2a
- Accent: #6366f1

## 2. Typography
- Base font: Inter / system-ui
- Heading: bold
- Body: regular
- Code/monospace: Menlo / JetBrains Mono

Font sizes:
- h1: 28px
- h2: 22px
- body: 16px
- small: 14px

## 3. Components
### Buttons
Variants:
- primary (solid accent)
- secondary
- ghost
- destructive

States:
- default
- hover
- disabled
- loading

### Inputs
- Rounded-md
- Focus ring using accent color
- Always include labels for accessibility

### Cards
- Rounded-lg
- Subtle shadow: `shadow-sm`
- Dark mode: `bg-surface-dark`

### Modals
- Centered container
- Click-overlay dismiss
- Escape key support
- Focus trap required

### Tags / Chips
- Pill shape
- Background: accent-light
- Color: accent-dark
- Small x-icon to remove

### List Items
- Use hover background
- Show timestamp
- Show pinned icon (if pinned)

## 4. Layout Guidelines
- Sidebar left (250px desktop, slide-in mobile)
- Content area responsive with max width 900px
- Sticky top bar with search & profile
- Use CSS Grid for two-column layout

## 5. Interaction Patterns
- Auto-save indicator (Saving… / Saved)
- Offline indicator (grey dot)
- Sync indicator (blue spinning dot)
- Error toast top-right

## 6. Shadows & Borders
- Border radius: `rounded-md` / `rounded-lg`
- Shadows: `sm` or `md`
- Avoid heavy shadows

## 7. Icons
Use Heroicons or Lucide icons.

## 8. Animation
- Minimal.
- Use fade transitions for modals.
- 150–200ms transitions max.


Gutzo Typography System — Poppins (single font family)

Overview
- This project uses a single font family: Poppins (weights 400, 500, 600, 700).
- The canonical styles are defined in `src/styles/typography.css` and loaded automatically.
- All new components/screens must use these tokens and classes. Do not add new fonts.

Primary classes & element mappings
- Headings:
  - h1 / .h1 => 28px (mobile) / 32px (desktop), fw 600
  - h2 / .h2 => 22px (mobile) / 26px (desktop), fw 600
  - h3 / .h3 => 18px (mobile) / 20px (desktop), fw 500
  - h4 / .h4 => 16px, fw 500

- Body & content:
  - .body-1, p => 16px, fw 400
  - .body-2 => 14px, fw 400

- Menu & prices:
  - .menu-item => 15px, fw 500
  - .price => 16px, fw 600
  - .price-small => 14px, fw 500

- Buttons & labels:
  - .btn-text => 15px, fw 600
  - .btn-small => 14px, fw 600
  - .caption => 12px, fw 400, opacity 0.7

Usage guidance
- Prefer semantic tags (h1..h4, p) for content when possible.
- For UI-specific labels (prices, menu items, button text), use the classes above (e.g., `<span class="price">₹99</span>`).
- For vertical rhythm use `.type-flow` or `.type-flow-sm` on containers.

Enforcement
- This file is the source of truth. Any change to typography must be approved by Maha (founder).
- Do not add new font imports. If a new weight is required, discuss and add it to `typography.css`.

Implementation notes
- `typography.css` includes Tailwind `@layer base` overrides so components that don't set text utilities will still render with Poppins.
- Colors and dark-mode are handled by the theme variables elsewhere; typography only controls family, weight, size, and line-height.


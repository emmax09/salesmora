# Salesmora Design System

**Status:** Proposed v1.0 design specification; implementation not yet started.  
**Brand direction:** Charcoal & Signal Orange  
**Target:** Professional, calm, high-density B2B SaaS product with light/dark parity, responsive patterns, and WCAG 2.2 AA compliance.

## 1. Identity and design principles

- Product name: **Salesmora**; global AI-powered sales and business execution platform.
- Experience: confident, clear, restrained, precise, helpful, and fast.
- Brand colors are not semantic status colors; status must also be conveyed with words or icons.
- Prefer generous whitespace, fine borders and strong typography to heavy gradients and shadows.
- Do not use arbitrary colors, font sizes, radii or layout breakpoints in feature components; use semantic tokens.
- Default to light theme, support dark theme and system preference. Persist user preference when the application implements it.
- All UX states are designed: empty, loading, ready, saving, success, disabled, error, offline, unauthorized and permission-limited.

## 2. Immutable brand colors (base palette)

| Brand role | Hex | Usage |
|---|---|---|
| Charcoal | `#202124` | Identity, headings, marketing dark sections |
| Signal Orange | `#F26A3D` | Brand signature, icons, highlights, dark-mode CTAs |
| Warm Canvas | `#FAF9F7` | Light application background |
| White | `#FFFFFF` | Light surfaces and reversed text |
| Neutral Gray | `#747474` | Source palette gray; NOT the default text on warm canvas due to contrast |

**Accessibility adjustment:** White text on Signal Orange `#F26A3D` gives ~3.04:1 and fails WCAG AA for normal-size text. Use `#202124` text on Signal Orange (~5.29:1), or use the deep action orange `#C94921` with white text (~4.71:1). `#747474` on warm canvas is ~4.44:1, so use the darker secondary text token instead. Ratios are computed using WCAG contrast calculations and should be verified by automated checks.

## 3. Semantic color tokens

The following values are **semantic**, not new brand primaries. Each theme must define the same keys.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--color-canvas` | `#FAF9F7` | `#151618` | App background |
| `--color-surface` | `#FFFFFF` | `#202124` | Cards, panels |
| `--color-surface-muted` | `#F2F0ED` | `#292A2D` | Hover, secondary panels |
| `--color-surface-elevated` | `#FFFFFF` | `#303135` | Popovers/dialogs |
| `--color-text` | `#202124` | `#F5F5F4` | Primary content |
| `--color-text-secondary` | `#606166` | `#C5C6C9` | Supporting content |
| `--color-text-muted` | `#646569` | `#B8B8BB` | Secondary metadata; test in context |
| `--color-border` | `#E6E3DF` | `#3B3C40` | Ordinary dividers and boundaries |
| `--color-border-strong` | `#C9C6C2` | `#616267` | Controls/strong boundaries |
| `--color-action` | `#C94921` | `#F26A3D` | Primary buttons/action links |
| `--color-action-foreground` | `#FFFFFF` | `#202124` | Text on action background |
| `--color-action-hover` | `#AE3D19` | `#FF8A62` | Button hover; dark text in dark mode |
| `--color-brand` | `#F26A3D` | `#F26A3D` | Logo accent/decorative emphasis |
| `--color-focus` | `#C94921` | `#FF9978` | Focus ring paired with offset |
| `--color-success` | `#167347` | `#6EE7A0` | Status text/icon |
| `--color-warning` | `#9A610B` | `#F0BF68` | Status text/icon |
| `--color-danger` | `#B42332` | `#FF8991` | Status text/icon |
| `--color-info` | `#355C90` | `#90B9F7` | Informational state |

**Validation warning:** Status colors, small metadata, placeholder text, and text on tinted background variants require contrast tests in their actual combinations; the table is a starting token specification rather than a blanket accessibility certification. Each tinted status badge needs its own `background`, `foreground`, and `border` semantic tokens, verified for contrast.

## 4. Typography

- Font: **Inter**, with system sans fallback. Bundle via approved framework font workflow; no font files should be redistributed independently.
- `12px` captions/metadata only when readable and non-critical. Primary user-facing body `14–16px`.
- Suggested type scale: `12 / 13 / 14 / 16 / 18 / 20 / 24 / 30 / 36px`.
- Body line height `1.5`; title line height `1.2–1.3`.
- Titles: 600–700 weight; body: 400–500; labels: 500–600.
- Use tabular figures for money, dates, counters and tables.
- Never encode meaning through font weight or color alone.

## 5. Spacing, geometry and elevation

- Base unit: `4px`. Common spacing: `4, 8, 12, 16, 20, 24, 32, 40, 48px`.
- Radius: small `6px`, control `8px`, card `12px`, dialog `16px`; avoid exaggerated pill treatment unless appropriate.
- Typical card padding: `16–24px`; dense table cells: `12–16px` horizontal.
- Default control height: `40–44px` desktop, `44–48px` touch-focused views.
- Sidebar width: `256px` desktop, collapsible on tablet, off-canvas on mobile.
- Header height: `64px` desktop; page content maximum width defined by screen type (dashboards may stretch).
- Use borders as primary elevation cue; reserve shadows for menus, dropdowns and dialogs.
- Motion: `120–200ms` for subtle state transitions; respect `prefers-reduced-motion`.

## 6. Component specifications

### Buttons
- Variants: `primary`, `secondary`, `outline`, `ghost`, `destructive`, `link`.
- Sizes: `sm`, `md` (default), `lg`; visible labels, focus indicators, disabled/loading/hover/pressed states.
- Primary: action orange + action foreground. Avoid white on `#F26A3D`.
- Disabled buttons cannot be the only place explaining why an action is blocked.
- Destructive actions use a confirmation pattern appropriate to severity.

### Inputs and forms
- Components: `TextField`, `Textarea`, `Select`, `Combobox`, `Checkbox`, `RadioGroup`, `Switch`, `DatePicker`, `FileUpload`, `FormField`.
- Always show visible labels; placeholders are examples, never substitutes for labels.
- Support descriptions, required/optional states, inline validation, error summary, clear keyboard focus and pending/success feedback.
- Keep errors adjacent to the field and associate using accessible descriptions.
- Mask only when necessary; don't make global address or phone formats US-only.
- Group multi-step settings flows and preserve unsaved work when feasible.

### Tables
- Shared `DataTable` with sortable columns, search, filter chips, pagination, empty state, loading skeleton, row selection and accessible headings.
- Text left-aligned; amounts and numeric totals right-aligned using tabular figures.
- Sticky headers only when helpful; horizontal scrolling for data-dense tables.
- Mobile: select essential columns or switch to structured cards; never cram an unreadable desktop table.
- Row actions must have accessible names and confirmation if destructive.

### Cards and dashboards
- Metric cards: label, value, valid comparison period, trend explanation; avoid fictitious metrics.
- Orange reserved for primary action, selection, highlights—not every chart series and card icon.
- Each chart needs readable axis labels, units, legend/accessible summary, and empty/error states.
- Priority queues: clearly show why an item needs action, owner, due date, severity and next step.
- Skeletons should mimic final layout; avoid layout shifts and animated overload.

### Navigation and overlays
- Primary destinations: Overview, Inbox, Customers, Sales, Guardian, AI Agents, Automations, Analytics. Settings is a utility destination.
- Desktop: fixed sidebar. Tablet: collapsible rail. Mobile: off-canvas navigation with clear current-page indicator.
- Dialogs: trap focus, restore focus on close, close via Escape where safe, set clear title and description.
- Notifications: use toasts for transient feedback, persistent inline status for important failures.

## 7. Screen patterns

### Marketing website
- Charcoal hero, orange CTA with dark text; white typography on charcoal; ample whitespace.
- Focus on product proof, clear hierarchy, restrained animation, accessible screenshots.

### Application shell
- Light theme default: warm canvas, white cards, charcoal text, controlled orange actions.
- Dark theme: near-black canvas, charcoal surfaces, orange CTA with charcoal text.
- Content-first screens; do not make every card dark.

### Inbox
- Desktop: conversation list + message timeline + collapsible customer context panel.
- Tablet: list + conversation, customer context in drawer.
- Mobile: one panel at a time, navigation back to list, fixed composer respecting safe areas.
- Customer and agent messages visually distinct without relying solely on color.

### CRM and pipeline
- Dense tables with readable hierarchy; easily scannable stage badges and assigned owners.
- Kanban is optional; offer table views for accessibility, scale and search.

### Guardian
- Priority indicators use labels + icons + status; explain risk cause, owner, due date and resolution action.

### AI agents and automations
- Separate draft, testing, approval and active states; disclose errors and failed actions.
- Never present a simulation or drafted action as an executed action.

## 8. Responsive rules

- Design at 360px, 390px, 768px, 1024px, 1280px, 1440px and wide-monitor widths; validate intermediary widths.
- Use content-driven breakpoints, not device names alone.
- No horizontal page scroll at 320px for normal content; intentionally scrollable tables/carousels are exceptions with cues.
- Touch targets should typically be >=44px where practical; WCAG 2.2 AA minimum is 24x24 CSS px or exceptions/spacing.
- Avoid fixed-height cards for dynamic text; test translation and zoom to 200%/400% where applicable.

## 9. Accessibility and quality gates

- Target WCAG 2.2 AA, including normal-text contrast >=4.5:1, large-text contrast >=3:1, non-text contrast >=3:1 where applicable.
- Check every token pair in real contexts, including dark theme, disabled controls, charts and status colors.
- Keyboard navigation and visible focus; accessible labels and error messages; reduced motion; screen reader checks.
- Build Storybook or an equivalent component showcase for variants and states.
- Automated accessibility tests (e.g. axe), manual keyboard and screen reader review, viewport smoke tests, and visual regression for key pages.
- Capture screenshots for both themes on desktop/tablet/mobile in review.
- No fake functional controls or fictional dashboard data outside labeled demo fixtures.

## 10. Source architecture and code standards

- Canonical implementation target: `frontend/packages/ui/src/styles/tokens.css` and shared reusable primitives under `frontend/packages/ui/src/`.
- Tailwind classes must reference mapped semantic tokens, not scattered raw brand hex strings.
- Design-system package owns Button/Input/Dialog/Table primitives; app feature folders own Inbox, CRM, Guardian components.
- Preferred handwritten file length <350 lines, hard maximum 500; split by responsibility.
- Never duplicate token definitions in independent features; use a single source of truth.
- Document intentional deviations with rationale and approval.

## 11. Implementation order

1. Add semantic tokens for light and dark modes.
2. Implement typography, spacing, borders and responsive app shell.
3. Build primitive components and showcase every state.
4. Validate contrast, keyboard flow and screen reader semantics.
5. Apply theme to authentication, onboarding, Overview and Settings without altering their business logic.
6. Run visual regression and responsive review.
7. Expand to Inbox, CRM, Guardian, Agents and later modules.

## 12. Standing AI coding-assistant policy

**Before any UI work, read `AGENTS.md` and this file.** Do not modify the official palette, invent competing component styles, hardcode brand colors, bypass accessibility checks or create duplicate shared components without explicit approval. Preserve existing functionality and maintain agreed code limits. If the design spec conflicts with security, accessibility, or functional correctness, flag it and propose a documented correction instead of silently overriding it.

The project root `AGENTS.md` must link to `docs/design/DESIGN_SYSTEM.md`. A Markdown document by itself cannot enforce compliance; add automated lint, visual regression and accessibility checks as implementation progresses.

## 13. References

- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WCAG 2.2 Target Size Minimum: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum

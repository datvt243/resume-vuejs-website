# DESIGN.md — Dashboard UI rules

This is the single source of truth for how the dashboard (`/` and `/dashboard/*`) looks and behaves.
**Any agent that creates, edits, or reviews UI in this repo must read this file first and follow it.**
If a request conflicts with this file, follow the request for that change only, and say which rule you broke and why.

Direction: **clean, data-dense, quiet** — in the family of Linear, Vercel, and Stripe Dashboard.
The data is the loudest thing on screen. Chrome (borders, backgrounds, labels) stays recessive.

---

## 0. How to use this file

### 0.1 Building a new page or component
1. Pick the page template in §4 that fits (Overview, Analytics, Form, List).
2. Compose it only from the components in §5. Need something new? Build it from the tokens in §2, then add it to §5.
3. Use only the tokens in §2. No raw hex colors, no arbitrary values like `mb-[3rem]` or `text-[13px]`, no new font sizes.
4. Run the checklist in §10 before saying you're done.

### 0.2 Refactoring an existing page ("make it look better", "fix the UI")
1. **Audit first.** List violations of this file as `file:line — rule § — problem`. Don't edit anything during the audit.
2. **Plan.** In 3–6 bullets, say what changes structurally: layout, hierarchy, components swapped.
3. **Apply in order:** tokens → layout shell → page structure → components → copy → states (empty, loading, error).
4. **Change only presentation.** Don't touch API calls, stores, composables, routing, or validation logic. Keep `data-*` attributes that specs query (for example `data-interval` in `PageVisits.spec.ts`). If a spec asserts a class you intentionally replace (for example `btn-primary`), update the spec in the same change and say so.
5. Run `npm run lint && npm run test && npm run build`, then do the visual check in §10.

### 0.3 Repo-specific notes
- Stack: Vue 3 SFC + Tailwind 3.4 (Bootstrap was removed). Legacy class names (`.btn`, `.badge`, `.form-control`, …) are re-implemented in `src/styles/tailwind.css` under `@layer components` and read `var(--bs-*)`.
- `LayoutDefault.vue` and `Header.vue` use `<template lang="pug">`. Keep pug when editing them.
- Theme is set by `data-bs-theme="light|dark"` on `<html>` (see `useTheme`). The default is dark.
- Global components (`Heading`, `Button`, `Box`, `NoData`, `Dropdown`, `ListTransition`) are auto-registered. Upgrade them in place instead of creating parallel versions.
- Icons: FontAwesome 6 (`<FontAwesomeIcon>`). No emoji in UI chrome.

---

## 1. Principles

1. **Hierarchy before decoration.** Every screen answers one question first. That answer is the biggest thing on the page; everything else steps down.
2. **Borders, not shadows.** Surfaces are separated by 1px hairlines and a subtle background step. Shadows belong only to floating layers (dropdown, modal, toast).
3. **One accent, used rarely.** The brand green marks the primary action, the active state, and the main data series. Never use it as a large fill or background wash.
4. **Dense but breathable.** Small type (13–14px) and tight rows are fine. Cramped groups are not. Use spacing to group related things and separate unrelated ones.
5. **Every state is designed.** Loading, empty, error, partial data, long text, and zero values each have an intentional look.
6. **Quiet copy.** Short labels, sentence case, no developer notes in the UI.

---

## 2. Design tokens

### 2.1 Color (CSS variables)

Paste into `src/styles/tailwind.css`, replacing the current `:root` and `[data-bs-theme]` blocks. The legacy `--bs-*` names are remapped to the new tokens, so every existing `@layer components` rule picks up the new look without per-file edits.

```css
:root,
[data-bs-theme='light'] {
    color-scheme: light;
    --color-bg: #fafafa;          /* page background */
    --color-surface: #ffffff;     /* cards, tables, sidebar */
    --color-surface-2: #f4f4f5;   /* hover, selected row, subtle fill, input bg */
    --color-line: #e4e4e7;        /* hairline borders, dividers */
    --color-line-strong: #d4d4d8; /* input borders, separators that must show */
    --color-fg: #18181b;          /* primary text */
    --color-fg-2: #52525b;        /* secondary text, labels (7.7:1) */
    --color-fg-3: #71717a;        /* muted: meta, placeholders, axis (4.8:1) */
    --color-brand: #00d095;       /* brand mark, active indicator, small accents ONLY. Never text, never behind white text */
    --color-accent: #047857;      /* primary button bg, links, focus ring (5.5:1 vs white) */
    --color-accent-hover: #065f46;
    --color-accent-fg: #ffffff;   /* text on accent */
    --color-accent-subtle: #ecfdf5;
    --color-success: #15803d;
    --color-warning: #b45309;
    --color-danger: #dc2626;
    --color-info: #2563eb;
    --color-success-subtle: #f0fdf4;
    --color-warning-subtle: #fffbeb;
    --color-danger-subtle: #fef2f2;
    --color-info-subtle: #eff6ff;
    --shadow-float: 0 8px 24px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04);
}
[data-bs-theme='dark'] {
    color-scheme: dark;
    --color-bg: #0a0a0b;
    --color-surface: #111113;
    --color-surface-2: #18181b;
    --color-line: #27272a;
    --color-line-strong: #3f3f46;
    --color-fg: #fafafa;
    --color-fg-2: #a1a1aa;        /* 7.4:1 on surface */
    --color-fg-3: #8b8b94;        /* 5.6:1 on surface */
    --color-brand: #00d095;
    --color-accent: #00d095;      /* on dark, the brand green itself passes as accent */
    --color-accent-hover: #2ee0ad;
    --color-accent-fg: #04211a;   /* dark text on green (8.5:1) */
    --color-accent-subtle: rgba(0, 208, 149, 0.12);
    --color-success: #4ade80;
    --color-warning: #fbbf24;
    --color-danger: #f87171;
    --color-info: #60a5fa;
    --color-success-subtle: rgba(74, 222, 128, 0.12);
    --color-warning-subtle: rgba(251, 191, 36, 0.12);
    --color-danger-subtle: rgba(248, 113, 113, 0.12);
    --color-info-subtle: rgba(96, 165, 250, 0.12);
    --shadow-float: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06);
}

/* Legacy bridge: keep until no var(--bs-*) remains in src/ */
:root,
[data-bs-theme] {
    --bs-body-bg: var(--color-bg);
    --bs-body-color: var(--color-fg);
    --bs-tertiary-bg: var(--color-surface);
    --bs-secondary-bg: var(--color-surface-2);
    --bs-border-color: var(--color-line);
    --bs-border-color-translucent: var(--color-line);
    --bs-secondary-color: var(--color-fg-2);
    --bs-emphasis-color: var(--color-fg);
    --bs-primary: var(--color-accent);
    --bs-success: var(--color-success);
    --bs-green: var(--color-brand);
    --bs-danger: var(--color-danger);
    --bs-warning: var(--color-warning);
    --bs-info: var(--color-info);
    --bs-border-radius: 6px;
    --bs-border-radius-sm: 4px;
}
```

Register the tokens in `tailwind.config.cjs`:

```js
darkMode: ['selector', '[data-bs-theme="dark"]'],
theme: {
    extend: {
        colors: {
            bg: 'var(--color-bg)',
            surface: 'var(--color-surface)',
            'surface-2': 'var(--color-surface-2)',
            line: 'var(--color-line)',
            'line-strong': 'var(--color-line-strong)',
            fg: 'var(--color-fg)',
            'fg-2': 'var(--color-fg-2)',
            'fg-3': 'var(--color-fg-3)',
            brand: 'var(--color-brand)',
            accent: { DEFAULT: 'var(--color-accent)', hover: 'var(--color-accent-hover)', fg: 'var(--color-accent-fg)', subtle: 'var(--color-accent-subtle)' },
            success: { DEFAULT: 'var(--color-success)', subtle: 'var(--color-success-subtle)' },
            warning: { DEFAULT: 'var(--color-warning)', subtle: 'var(--color-warning-subtle)' },
            danger: { DEFAULT: 'var(--color-danger)', subtle: 'var(--color-danger-subtle)' },
            info: { DEFAULT: 'var(--color-info)', subtle: 'var(--color-info-subtle)' },
        },
        fontFamily: {
            sans: ['Geist', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
            mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        },
        fontSize: {
            xs: ['12px', '16px'],
            sm: ['13px', '20px'],
            base: ['14px', '22px'],
            md: ['16px', '24px'],
            lg: ['20px', '28px'],
            xl: ['28px', '34px'],
        },
        borderRadius: { sm: '4px', DEFAULT: '6px', md: '8px', lg: '12px' },
        boxShadow: { float: 'var(--shadow-float)' },
    },
},
```

Color rules:
- Use only the token classes (`bg-surface`, `text-fg-2`, `border-line`, …). **Never** a raw hex value, a Tailwind palette class (`text-gray-500`, `bg-emerald-600`), or `opacity-*` used to fade text. Fading text with opacity breaks contrast; use `text-fg-2` or `text-fg-3` instead.
- Don't use `dark:` for colors. The tokens already switch with the theme. `dark:` is only for rare non-color differences.
- Opacity modifiers like `bg-accent/10` don't work with these `var()` colors. Use the `*-subtle` tokens instead.
- Status colors (success, warning, danger, info) mean state. Never use them for decoration or as chart series.

### 2.2 Typography

- UI font: **Geist** (load from Google Fonts in `index.html`, weights 400/500/600). Mono: **Geist Mono**, only for IPs, IDs, tokens, code, and API URLs. JetBrains Mono is no longer the body font.
- `body`: `font-sans text-base text-fg bg-bg antialiased`.

| Role | Class | Notes |
|---|---|---|
| Page title | `text-lg font-semibold` | One per page |
| Section / card title | `text-md font-semibold` | Sentence case |
| Body, table cell, input | `text-base` or `text-sm` | `text-sm` in dense tables |
| Label, secondary | `text-sm text-fg-2` | |
| Meta, caption, axis, help | `text-xs text-fg-3` | |
| KPI value | `text-xl font-semibold tracking-tight` | Proportional figures |

- Weights: 400, 500, 600 only. No 700+, no italics for emphasis.
- `tabular-nums` only where numbers line up vertically (table columns, axis ticks). Never on KPI values.
- **No `uppercase`** on headings or labels. The current `Heading.vue` `uppercase` class must go.
- Keep body text lines at 80 characters or fewer (`max-w-prose` for paragraphs).

### 2.3 Spacing, sizing, radius

- 4px grid. Use only these Tailwind steps: `1 2 3 4 6 8 12` (4, 8, 12, 16, 24, 32, 48px). No arbitrary values.
- Inside a card: padding `p-4` (dense) or `p-6` (spacious). Gap between cards: `gap-4` on mobile, `gap-6` on desktop.
- Between page sections: `space-y-6` (never `mb-[3rem]`).
- Control heights: 28px (`h-7`, sm, for table actions and filters), 32px (`h-8`, default), 40px (`h-10`, mobile and primary form submit).
- Radius: `rounded-sm` for badges, `rounded` (6px) for controls, `rounded-md` (8px) for cards and panels, `rounded-lg` for modals. Use `rounded-full` only for avatars and status dots.
- Borders: 1px `border-line`. Use `border-line-strong` only for inputs and checkboxes.

### 2.4 Elevation and motion

- In-flow surfaces (cards, tables, sidebar) get **no shadow**. Use `bg-surface border border-line rounded-md`.
- Floating layers (dropdown, popover, modal, toast) use `shadow-float`.
- Motion is 120–200ms `ease-out` and animates only `opacity` and `transform`. List transition properties explicitly; never `transition: all`.
- Wrap animations in `motion-safe:`. No entrance animations on page sections or cards.

---

## 3. App shell

```
┌────────────┬───────────────────────────────────────────────────┐
│ Sidebar    │ Top bar (56px): breadcrumb/title · search? · theme · user menu │
│ 240px      ├───────────────────────────────────────────────────┤
│ logo       │ Page header: title + description │ actions        │
│ nav groups │ ───────────────────────────────────────────────── │
│ …          │ Page content (max-w per template, px-6 / px-4)    │
│ ────       │                                                   │
│ settings   │                                                   │
└────────────┴───────────────────────────────────────────────────┘
```

- **Sidebar (≥1024px):** fixed, full height, `w-60 bg-surface border-r border-line`. No floating card boxes inside it.
  - Group the nav (`text-xs text-fg-3` group label, sentence case):
    - *Tổng quan:* Dashboard, Lượt truy cập
    - *Hồ sơ:* Thông tin cơ bản, Thông tin chung, Học vấn, Kinh nghiệm, Dự án, Giải thưởng, Chứng chỉ, Người tham khảo
    - *Công cụ:* Ứng tuyển, Nhập CV, Kiểm tra ATS, Profile CV, Xem trước / Xuất PDF
    - Pinned at the bottom: Cài đặt tài khoản
  - Nav item: `h-8 px-2 rounded flex items-center gap-2 text-sm text-fg-2` plus a 16px icon. Hover: `bg-surface-2 text-fg`. Active: `bg-surface-2 text-fg font-medium` plus a 2px `bg-brand` indicator on the left edge. **No solid green fill.**
  - The current "welcome" card (name, open-to-work, view count) moves out of the sidebar. The name goes into the user menu; the stats go into the Overview KPIs.
- **Below 1024px:** the sidebar becomes a drawer opened from a menu button in the top bar. The top bar stays sticky.
- **Top bar:** `h-14 border-b border-line bg-surface sticky top-0 z-20`. Right side holds secondary actions only: theme toggle (icon button with `aria-label`), Download CV (secondary button), and the user menu.
- **Content:** `px-6 py-6` on desktop, `px-4 py-4` on mobile, on `bg-bg`.

---

## 4. Page templates

Every page starts with a **page header**:
```
<header class="flex flex-wrap items-start justify-between gap-4 mb-6">
  <div>
    <h1 class="text-lg font-semibold">Lượt truy cập hồ sơ</h1>
    <p class="text-sm text-fg-2 mt-1">Ai đã xem hồ sơ công khai của bạn và từ đâu.</p>
  </div>
  <div class="flex items-center gap-2"><!-- filters / primary action --></div>
</header>
```
The description is one sentence at most. The header has exactly one primary action, or none.

### 4.1 Overview (`/`, PageHome), max width `max-w-6xl`
Read top to bottom: **status → numbers → trend → to-dos**.
1. Profile strip (a single row, not a hero card): avatar 40px, name, desired position, open-to-work badge, and an "Cập nhật hồ sơ" secondary button on the right.
2. KPI row: `grid grid-cols-2 lg:grid-cols-4 gap-4`, 3–4 stat tiles (§5.2). For example: Lượt xem 30 ngày (with delta), Hoàn thành hồ sơ %, Đơn ứng tuyển, Điểm ATS. Use only data that exists; don't invent metrics.
3. Main row: `grid lg:grid-cols-3 gap-6`.
   - Visits chart, `lg:col-span-2`: a compact version of VisitChart with a "Xem chi tiết" link in the card header.
   - "Hoàn thiện hồ sơ" checklist card: progress bar plus the list of missing sections as links.
4. CV card: file row (icon, name, "tạo tự động từ hồ sơ" meta), a segmented control for template, a select for language, and a download button.

### 4.2 Analytics (`/dashboard/visits`), max width `max-w-6xl`
1. Page header with the **time-range segmented control on the right** (Ngày / Tuần / Tháng). Filters live in one row above everything they scope, never inside a chart card.
2. KPI row: total views in range, top source, top country.
3. Hero chart card (full width).
4. Breakdown cards: `grid md:grid-cols-2 gap-6`, each a ranked list with a thin share bar.
5. Detail table card (§5.4).

### 4.3 Form / settings (profile sections, account settings), max width `max-w-4xl`
- Stripe-style sections: at `lg` and up, use a `grid lg:grid-cols-3 gap-6`. Column 1 holds the section title plus a one-line description; columns 2–3 hold a card with the fields.
- Fields use two columns at `md` and up only when they're related (first name and last name). Otherwise use one column.
- A sticky action bar at the bottom of the card holds Cancel (ghost) and Save (primary). Save stays enabled until the request starts, then shows a spinner inside the button.
- Build each section with the global `<FormSection title description>` (`:card="false"` when the content is already a card, such as `TableDefault`). `VeeForm` renders the action bar; pass `cancelable` for "Hủy".

### 4.4 List / CRUD (Học vấn, Kinh nghiệm, Dự án, …), max width `max-w-5xl`
- Page header with the primary action "Thêm …" (for example "Thêm học vấn").
- Items are rows inside one card (`divide-y divide-line`), not separate floating cards. Each row shows title, `text-sm text-fg-2` subtitle, `text-xs text-fg-3` date range, and actions on the right (edit and delete icon buttons, each with an `aria-label`).
- Create and edit happen in a modal, or a side sheet when there are more than 6 fields.
- Delete asks for confirmation with a specific verb ("Xóa kinh nghiệm này?" with the buttons "Xóa" and "Hủy").

---

## 5. Components

### 5.1 Card / panel
`bg-surface border border-line rounded-md`. Optional header: `flex items-center justify-between px-4 h-12 border-b border-line` with the title (`text-md font-semibold`) on the left and one link or ghost action on the right. Body: `p-4`.
Don't nest cards inside cards. Use dividers or `bg-surface-2` blocks instead.

### 5.2 Stat tile (KPI)
```
<div class="bg-surface border border-line rounded-md p-4">
  <p class="text-sm text-fg-2">Lượt xem (30 ngày)</p>
  <p class="text-xl font-semibold tracking-tight mt-1">1.284</p>
  <p class="text-xs mt-1 text-success"><FontAwesomeIcon icon="fa-solid fa-arrow-up" /> 12% <span class="text-fg-3">so với 30 ngày trước</span></p>
</div>
```
- One metric per tile. A delta always says what it compares against.
- The delta color follows meaning (up and good uses `text-success`). It always has an arrow icon, so color is never the only signal.
- An optional sparkline (no axes, `stroke: var(--chart-1)`, 1.5px) sits below. If a detail page exists, the whole tile is a link.
- Zero or no data: show "0" or "—" with a `text-xs text-fg-3` hint. Never leave the tile blank.

### 5.3 Buttons (`Button.vue` and `.btn`)
| Variant | Classes |
|---|---|
| primary | `bg-accent text-accent-fg hover:bg-accent-hover` |
| secondary | `bg-surface border border-line-strong text-fg hover:bg-surface-2` |
| ghost | `text-fg-2 hover:bg-surface-2 hover:text-fg` |
| danger | `bg-danger text-white` (destructive confirms only) |

Shared: `inline-flex items-center gap-2 h-8 px-3 rounded text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:pointer-events-none`.
- At most one primary button per view.
- Labels are specific verbs ("Lưu thay đổi", "Tải CV"), never "Submit" or "OK".
- Icon-only buttons are square (`w-8`) and require an `aria-label`.
- Pill-shaped (`rounded-full`) buttons are not allowed.

### 5.4 Table (`TableDefault.vue`)
- Wrapped in a card with `overflow-x-auto`. `w-full text-sm`.
- Header: `h-9 text-xs font-medium text-fg-3 text-left border-b border-line bg-surface`, sentence case, sticky. Sortable columns show a sort icon and `aria-sort`.
- Rows: `h-10 border-b border-line last:border-0 hover:bg-surface-2`. No zebra stripes, no vertical borders.
- Numbers are right-aligned with `tabular-nums`. Dates use `Intl.DateTimeFormat('vi-VN')`. IPs and IDs use `font-mono text-fg-2`.
- Truncate long text with `truncate max-w-*` and show the full value in `title`.
- Empty: a single row spanning all columns that renders the empty state (§5.8). Paginate or virtualize past 100 rows.

### 5.5 Form controls (`.form-control`, VeeForm parts)
- Label above the field: `text-sm font-medium text-fg mb-1`. Help text: `text-xs text-fg-3 mt-1`.
- Input: `h-8 w-full px-3 rounded bg-surface border border-line-strong text-base placeholder:text-fg-3 focus:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent`.
- Error: the input gets `border-danger`, and a `text-xs text-danger` message with an icon appears below it. Errors say how to fix the problem ("Nhập email hợp lệ, ví dụ ten@congty.com").
- Always set the correct `type`, `name`, `autocomplete`, and `inputmode`. Never block paste.

### 5.6 Badges and status
`inline-flex items-center gap-1.5 h-5 px-2 rounded-sm text-xs font-medium` plus a subtle background:
- success: `bg-success-subtle text-success`, warning: `bg-warning-subtle text-warning`, and so on. Neutral: `bg-surface-2 text-fg-2`.
- Status badges start with a 6px dot or an icon. The "Đang mở tìm việc" badge is a success badge with a dot.

### 5.7 Segmented control / tabs
- Segmented (switches a view in place, like the interval or CV template): `inline-flex p-0.5 bg-surface-2 rounded`. Items are `h-7 px-3 rounded-sm text-sm text-fg-2`. Selected: `bg-surface text-fg shadow-sm`. Use `role="radiogroup"` / `aria-checked`, or `aria-pressed`.
- Tabs (switch between page sections): an underline style with a 2px `bg-fg` indicator. Reflect the selected tab in the URL query.

### 5.8 Empty state (`NoData.vue`)
Replaces the current yellow `alert-warning`:
```
<div class="flex flex-col items-center text-center py-12 px-4">
  <FontAwesomeIcon icon="fa-regular fa-folder-open" class="text-fg-3 text-2xl" />
  <p class="text-md font-semibold mt-3">Chưa có học vấn nào</p>
  <p class="text-sm text-fg-2 mt-1 max-w-sm">Thêm trường học để nhà tuyển dụng thấy nền tảng của bạn.</p>
  <!-- one primary or secondary action that fills it -->
</div>
```
Accept `title`, `description`, and an action slot as props or slots.

### 5.9 Loading and feedback
- First load: a skeleton that matches the final layout (`bg-surface-2 rounded animate-pulse`, wrapped in `motion-safe`). No full-page spinner over content.
- Refetch (changing a filter): keep the previous data at `opacity-60` and avoid layout jumps.
- Spinners only inside buttons.
- Exception: backend cold start. Once a request has waited 3s (`Spinner.vue`), a full-screen dimmed overlay with the countdown notice covers the app and the app is `inert` until the request ends. Shorter waits stay non-blocking (top bar + corner notice).
- Toasts: bottom-right, `bg-surface border border-line shadow-float rounded-md p-3 text-sm`, with an icon by type, auto-dismiss after 4s, and `aria-live="polite"`.
- Modal: `rounded-lg shadow-float`, max width 480 or 640px. Title sentence case. Footer actions right-aligned (secondary, then primary). Esc closes it, focus is trapped inside, and focus returns to the trigger.

### 5.10 Progress
Use a thin bar for completion: `h-1.5 rounded-full bg-surface-2` with a `bg-brand` fill and the % next to it in `text-sm font-medium`. Use rings and donuts only for a single headline percentage, never side by side.

---

## 6. Data visualization

### 6.1 Chart tokens (validated for color-vision deficiency and contrast on the surfaces above)
```css
:root, [data-bs-theme='light'] { --chart-1: #0f9f74; --chart-2: #2a78d6; --chart-3: #eb6834; --chart-4: #6250d6; --chart-grid: #e4e4e7; --chart-axis: #71717a; }
[data-bs-theme='dark']         { --chart-1: #0aa87a; --chart-2: #3987e5; --chart-3: #d95926; --chart-4: #9085e9; --chart-grid: #27272a; --chart-axis: #8b8b94; }
```
- Assign series colors in slot order (1→4). Never cycle or generate a 5th hue. Fold the rest into "Khác", or use small multiples.
- Color follows the entity, not its rank. Filtering never repaints the remaining series.
- Scatter or any chart where all series touch each other: use at most 3 series.
- One series means one color (`--chart-1`) and no legend; the card title names the series. With 2 or more series, a legend is required, and up to 4 series get direct labels.
- Text in charts (labels, values) uses `fg` and `fg-2` tokens, never the series color.

### 6.2 Choosing the form
| Question | Use |
|---|---|
| One headline number | Stat tile, not a chart |
| Change over time | Line (many points) or columns (≤ 31 buckets, like daily visits) |
| Compare categories | Horizontal bars, sorted descending |
| Share of a whole | A share bar list (as in "Nguồn truy cập"). Pie or donut only for ≤ 5 slices |
| Exact values / lookup | Table |

Never use dual y-axes, 3D, a truncated y-axis on bars, or a rainbow palette.

### 6.3 Marks and chrome
- Bars: rounded top 4px, square at the baseline, a 2px gap between bars, max width 28px.
- Lines: 2px, with markers ≥ 8px only on hover or at the endpoint.
- Gridlines are solid 1px `--chart-grid`, horizontal only, and few (4–5 ticks on "nice" values). Axis text is 11–12px `--chart-axis` with `tabular-nums`.
- Size the container to include the axis labels. No inner scrollbars.

### 6.4 Interaction and accessibility
- Hover and keyboard focus show a tooltip (`bg-surface border border-line shadow-float rounded p-2 text-xs`). The hit area is the full column height or at least 24px.
- Tooltips enhance; they never gate. Every value is also reachable in a table on the same page.
- `<svg role="img" aria-label="…">` with a meaningful label. Respect `prefers-reduced-motion`.

---

## 7. Copy (Vietnamese UI)

- **No hardcoded UI text.** Every string has a VI and an EN message in `src/i18n/index.ts`. See `.claude/CLAUDE.md` → i18n for how to wire it. The rules below apply to both languages.
- Sentence case everywhere ("Lượt truy cập hồ sơ", not "LƯỢT TRUY CẬP HỒ SƠ").
- Labels name what users understand, not how the system works.
- **No developer notes in the UI** (for example "backend chưa có endpoint…", "ghi nhận qua API thật"). If a feature isn't available, disable it with a short reason in a tooltip ("Sắp ra mắt"), or hide it.
- Helper text is one sentence, at most.
- The same action keeps the same name across the flow ("Lưu" → toast "Đã lưu").
- Errors say what happened and what to do next. They don't apologize.
- Don't append `→` to links, and don't put emoji in headings or nav.
- Format numbers with `Intl.NumberFormat('vi-VN')` (1.284). Format dates as `dd/MM/yyyy`, and use relative time only in activity lists.
- Use the ellipsis character `…`, not `...`.

---

## 8. Accessibility and quality floor (non-negotiable)

- Text contrast ≥ 4.5:1. UI and chart marks ≥ 3:1. The tokens above already comply; don't override them.
- Every interactive element is reachable by keyboard and shows a visible `focus-visible` ring (`outline-2 outline-accent outline-offset-2`). Never write `outline: none` without a replacement.
- Use real elements: `<button>` for actions and `<a>`/`RouterLink` for navigation. Never a clickable `div` or `span` (for example the current logout `span.pointer` must become a button).
- Icon-only controls have an `aria-label`. Decorative icons have `aria-hidden="true"`.
- Headings follow one hierarchy: one `h1` per page, then `h2` for sections. Don't style `<p>` elements to look like headings.
- Touch targets are ≥ 40px on mobile. The layout works at 375px wide with no horizontal page scroll. Flex children that hold text get `min-w-0`.
- Plan for long names, empty values, 0, and 1,000+ items.

---

## 9. Anti-patterns (if you see these, fix them)

Seen in this codebase today:
- A solid green background on the active nav item, and green outline buttons everywhere. Use the accent sparingly (§1.3).
- `uppercase` section headings (`Heading.vue`).
- `opacity-50/60/75` used to color text. Use `text-fg-2` or `text-fg-3`.
- Arbitrary spacing such as `mb-[3rem]`, `gap-[1.5rem]`, `p-[3rem]`.
- The yellow `alert-warning` used as an empty state.
- Long explanatory paragraphs and dev notes under widgets.
- A sidebar built from stacked floating cards, and an emoji greeting.
- `rounded-pill` buttons mixed with square ones.

Generic dashboard tells to avoid:
- Identical rounded cards with the same soft shadow for every block, regardless of importance.
- Gradient washes and glassmorphism used as decoration.
- A big-number hero with a gradient accent as the default first block.
- A tracked-out ALL-CAPS eyebrow label above every heading.
- More than 7 KPIs, or KPIs with no comparison context.
- A filter tucked inside one chart card while it actually affects the whole page.

---

## 10. Definition of done (self-review)

Before reporting UI work as finished, check each item and report the result:

- [ ] Uses only tokens from §2 (`grep -nE "#[0-9a-fA-F]{3,6}|\\[[0-9.]+(rem|px)\\]|opacity-[0-9]+" <changed files>` returns nothing new).
- [ ] Page header, template, and components follow §3–§5. At most one primary action per view.
- [ ] Empty, loading, error, long-text, and zero states are handled.
- [ ] Keyboard pass: Tab through the page; focus is always visible and the order is logical.
- [ ] Screenshots reviewed (Playwright or the browser) at **1440px light, 1440px dark, and 375px dark**. Nothing overflows, overlaps, or gets clipped.
- [ ] `npm run lint && npm run test && npm run build` pass.
- [ ] Ran a final pass against the Vercel Web Interface Guidelines if the `web-design-guidelines` skill is available.

---

## 11. Suggested migration order for this repo

1. Tokens: rewrite the color and font blocks in `tailwind.css` (§2.1) and extend `tailwind.config.cjs`. Load Geist in `index.html`. The whole app reskins through the `--bs-*` bridge.
2. Shell: `LayoutDefault.vue` (sidebar per §3, pug) and `Header.vue` (top bar).
3. Global components: `Heading` (no uppercase, h1/h2 props), `Button` (variants per §5.3), `NoData` (§5.8), `Box` → card.
4. `PageHome.vue` → Overview template (§4.1).
5. `PageVisits.vue` + `VisitChart.vue` → Analytics template (§4.2) and chart tokens (§6.1).
6. `TableDefault.vue` (§5.4).
7. VeeForm and the `Frm*` parts → form template (§4.3, §5.5).
8. The CRUD list pages (§4.4), then the auth pages.

Do one step per PR. Take before and after screenshots for each.

---

### Sources this file is based on
- Vercel Web Interface Guidelines — accessibility, focus, forms, motion, and anti-patterns.
- Anthropic `frontend-design` skill — intentional hierarchy, restraint, avoiding templated tells.
- Dashboard UI practice (Setproduct, 2026): KPIs first, 3–7 metrics with context, one hero chart, filters above content, skeletons, and empty states with one action.
- AWS Cloudscape data-vis colors: fixed categorical order, ≤ 8 line or bar series, ≤ 5 pie slices, consistent series colors, and a 2px divider between segments.
- IBM Carbon chart types: choose the chart by purpose (comparison, trend, part-to-whole, correlation).
- The palette in §6.1 was validated with a CVD/contrast checker against the §2 surfaces in both themes.

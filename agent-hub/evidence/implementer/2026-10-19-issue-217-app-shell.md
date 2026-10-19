# 2026-10-19 - issue-217-app-shell

- Worker: implementer
- Version: 0.1.0
- Node: `issue-217-app-shell` in `haven/diagrams/dev-loop.prime-mermaid.md` (PM row appended at end of table, `IN_PROGRESS`)
- Task (verbatim): #217 [UI] Phase 2 — App shell: sidebar + top bar (DESIGN.md §3, §11 step 2, keep pug). `LayoutDefault.vue`: fixed sidebar `w-60 bg-surface border-r border-line` ≥1024px, no floating cards; remove welcome card (name → user menu, stats → phase 4); nav 3 groups Tổng quan / Hồ sơ / Công cụ + Cài đặt tài khoản pinned bottom; "Nhập CV (LinkedIn / PDF / JSON)" → "Nhập CV"; nav item `h-8` + 16px icon, active `bg-surface-2 font-medium` + 2px `bg-brand` left bar; <1024px drawer opened from top-bar menu button. `Header.vue`: top bar `h-14 border-b border-line bg-surface sticky top-0 z-20`; theme toggle square icon button with `aria-label`; Download CV → secondary "Tải CV"; user menu shows name (fix "Xin chào , email"), View API / Logout → Vietnamese; Logout span → button; auth page header same style. Presentation only; keep `data-*`; lint+test+build; screenshots 1440 light/dark, 375 dark. URL: https://github.com/datvt243/resume-vuejs-website/issues/217

## Hub bytes before: 182077

## Branch
`feature/issue-217-app-shell` — created from freshly pulled `staging` (at `de83f44`, #216 merged) via `gh issue develop 217 --checkout --base staging`. Not `main`, not `staging`.

## Diff
| File | Why |
|---|---|
| `src/pages/_layouts/LayoutDefault.vue` | Rewritten (pug kept). Fixed `aside#app-sidebar` `w-60 bg-surface border-r border-line`: logo row `h-14` + `nav` with 3 groups (`text-xs text-fg-3` labels) + "Cài đặt tài khoản" pinned in a bottom `border-t` block. Nav item (scoped `@apply`): `h-10 lg:h-8 px-2 rounded text-sm text-fg-2`, hover `bg-surface-2 text-fg`, active `bg-surface-2 text-fg font-medium` + `::before` 2px `bg-brand` bar, `aria-current="page"`, 16px icon (wrapper `text-md`, FA svg = 1em). <1024px: aside is `invisible -translate-x-full` until `navOpen`, `.modal-backdrop.show z-30` overlay, closes on backdrop click / Esc / route change; `lg:visible lg:translate-x-0` always shown on desktop. Content column `lg:pl-60`, `main px-4 py-4 lg:px-6 lg:py-6`, inner `mx-auto max-w-6xl`. Welcome card + its `fullName`/`isOpenToWork` computeds removed; `useVisits()` call KEPT (it fetches + caches the view count that `PageHome.vue` reads). All old scoped SCSS (floating cards, solid-green active, `#fff`, opacity text) deleted. |
| `src/pages/_layouts/Header.vue` | Root is now `header.sticky.top-0.z-20.flex.h-14.border-b.border-line.bg-surface`. Auth branch: logo + ghost links Đăng nhập / Đăng ký (`aria-current`) + theme icon button — no longer uses `Navbar.vue`, and the `/` separator entry was dropped from `authRouter`. App branch: menu button (`lg:hidden`, `aria-label`, `aria-controls="app-sidebar"`, `aria-expanded`, emits `toggle-nav`), mobile-only logo, theme toggle = square icon button with `aria-label` (was `title` + `rounded-full`), "Tải CV" secondary button (§5.3 classes; label `md:inline`, `aria-label` for icon-only), user `Dropdown` `outline-secondary` showing the candidate's name (fallback email → "Tài khoản", escaped, `max-w-32 truncate`), items "Xem API" + "Đăng xuất" — logout is now `button.dropdown-item(type="button")`. Scoped `:deep(.dropdown-menu)` right-aligned so the menu stays on screen. API/store/router logic (`_settings`, `_handelLogout`, `toggleTheme`) unchanged. |
| `src/pages/_layouts/Main.vue` | Deleted — its only importer was `LayoutDefault.vue` (grep `_layouts/Main` → 0 hits after the rewrite). |
| `src/plugins/initFontAwesomeIcon.js` | Register 7 icons the new nav/top bar uses: `faChartLine`, `faIdCard`, `faAddressBook`, `faPaperPlane`, `faFileImport`, `faGear`, `faBars`. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Append node row. |

## Command
From repo root:
- `npm run lint`
- `npm run test`
- `npm run build`
- Typecheck: CANNOT RUN — pending add-typecheck-script.

## Output
`npm run lint` → no findings, `lint_exit=0`.

`npm run test`:
```
 FAIL  src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
 Test Files  1 failed | 34 passed (35)
      Tests  1 failed | 227 passed (228)
```
Same single pre-existing failure as `issue-216-ui-tokens` (proven there to fail on `staging` with the diff stashed). `initFontAwesomeIcon.spec.ts` (scans static `icon="…"` strings) passes; the nav icons are bound via `:icon`, so they were also checked live (all render, see screenshots).

`npm run build`:
```
✓ built in 3.43s
```

DESIGN.md §10 grep (hex / arbitrary `[Npx|rem]` / `opacity-N`) on added `src/` lines → no matches (`grep_exit=1`).

Manual observation (Playwright on the port-9888 debug Chrome, existing `npm run dev`; not an automated test). The session had expired; the operator approved clicking Login with Chrome's autofilled credentials. Results:
```
375 dark /dashboard/information: scrollWidth 375 (no horizontal scroll); sidebar visibility hidden, transform translateX(-240px)
menu button → drawer open; elementFromPoint(300,28) = "modal-backdrop show z-30 lg:hidden" (backdrop covers top bar)
Escape → sidebar visibility hidden; reopen → aria-expanded "true"; click "Học vấn" → #/dashboard/education, drawer hidden
1440 dark: scrollWidth 1440; user menu open → .dropdown-menu left 1256 / right 1416 (inside viewport)
1440 light: active nav bg rgb(244,244,245), color rgb(24,24,27)
375 dark /login: scrollWidth 375
```
Screenshots (local, gitignored via `.git/info/exclude`): before — `.playwright-mcp/216-after-1440-light.png`, `216-after-1440-dark.png`, `216-after-375-dark.png` (dashboard = current `staging`), `217-before-1440-dark.png`, `217-before-1440-light.png`, `217-before-375-dark.png` (login page; session had expired). After — `217-after-1440-dark.png` (user menu open), `217-after-1440-light.png`, `217-after-375-dark.png`, `217-after-375-dark-drawer.png`, `217-after-login-375-dark.png`. Theme switched via the real header toggle, not by setting the attribute.

## Acceptance
| Criterion | Evidence |
|---|---|
| Sidebar fixed `w-60 bg-surface border-r border-line` ≥1024px, no floating cards | `LayoutDefault.vue` aside classes; 1440 screenshots |
| Welcome card removed | template + computeds deleted; `useVisits()` kept for PageHome cache |
| 3 nav groups + settings pinned bottom; "Nhập CV" shortened | `navGroups` / `settingsItem`; screenshots |
| Nav item h-8 + 16px icon; active surface-2 + 2px brand bar, no solid green | scoped `.nav-item` rules; computed active bg rgb(244,244,245) |
| <1024px drawer from top-bar menu button | 375 checks above (hidden → open → Esc → route change) |
| Top bar `h-14 border-b border-line bg-surface sticky top-0 z-20` | `Header.vue` root classes |
| Theme toggle square icon button with `aria-label` | `iconBtn` + `aria-label` both branches |
| "Tải CV" secondary | `secondaryBtn` (§5.3 secondary + shared classes) |
| User menu shows name; Vietnamese items; logout `<button>` | `mesUser`; "Xem API" / "Đăng xuất"; `button.dropdown-item(type="button")`; 1440 dark screenshot shows "Võ Tấn Đạt" |
| Auth header same style | unauthenticated branch uses the same top bar root; `217-after-login-375-dark.png` |
| Pug kept; presentation only; `data-*` kept | both layouts still `lang="pug"`; no store/API/router changes; no `data-*` existed in these files |
| lint + build green; no new test failure | outputs above |
| Comments per code-comments.md | Added: 1 `//` on `navOpen` (why the state is ignored ≥lg), 1 `//` above button class strings (DESIGN.md pointer), 1 `/* */` on `.nav-item-icon` (why the wrapper font-size sizes the icon), 1 `/* */` on `.user-menu` (why the menu opens leftward). Reworded the existing `useVisits` WHY comment (dropped the "v1.2.0+" history). No issue refs. |

## Noticed, not done
- `src/components/Navbar.vue` (+ `Navbar.spec.ts`, the `.navbar*` rules and safelist in `tailwind.css` / `tailwind.config.cjs`) now has no consumer — removal is a separate cleanup.
- `Dropdown.vue` still builds legacy `btn-outline-secondary` buttons and its text button has no `aria-expanded` (only the split caret does) — Phase 3 (#218).
- Drawer has no focus trap and does not move focus into the drawer on open — acceptable for now, revisit with Modal focus work in Phase 3.
- The 375px overflow on `/dashboard/information` (417px in #211's audit) no longer reproduces (scrollWidth 375) — likely the old `.container` + sidebar stack; other pages not rechecked.
- `Footer.vue` still uses `opacity-50` and an arbitrary `border-[var(--bs-border-color)]` — not in this issue's list.
- Page content is now capped at `max-w-6xl`; §4 templates narrow it per page in later phases.
- Section headings ("ẢNH ĐẠI DIỆN") still uppercase mint — Phase 3 (`Heading.vue`).

## Seal gate
One operator-approved action: clicking Login in the debug browser (real auth API call) to reach the dashboard for screenshots. No commit/push. Ship via `/ship` after verifier SEAL.

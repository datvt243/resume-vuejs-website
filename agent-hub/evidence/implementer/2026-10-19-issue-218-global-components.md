# 2026-10-19 - issue-218-global-components

- Worker: implementer
- Version: 0.1.0
- Nodes (both appended at end of the PM table, `IN_PROGRESS`):
  - `issue-218-global-components` — the issue.
  - `fix-header-user-menu-style-prop` — regression in `issue-217-app-shell` (already SEALED, LAI-13 → new node), found during this pass's browser check. Section "Regression node" below.
- Task (verbatim): #218 [UI] Phase 3 — Global components + SweetAlert2 / datepicker (DESIGN.md §5, §11 step 3; upgrade in place). Heading.vue: drop uppercase + mb-[1.5rem], level prop (h1 text-lg page title / h2 text-md section), page-header support (title + description + actions). Button.vue: variants primary/secondary/ghost/danger (§5.3), sizes h-7/h-8/h-10, icon-only square requires aria-label, gap-2 icon/text, no rounded-pill. NoData.vue: §5.8 empty state (icon, title, description, action slot) replacing alert-warning. Box.vue → §5.1 card. Toasts.vue: bottom-right, aria-live polite, auto-dismiss 4s, no text-uppercase, close is <button aria-label>; update Toasts.spec.ts. Modal.vue: focus trap Tab/Shift+Tab, return focus to trigger, rounded-lg shadow-float; check data-bs-dismiss='modal' Đóng buttons still close. ListTransition.vue + styles/_part/_transition.scss: no transition: all, only opacity/transform, motion-safe. GroupTags.vue: remove-tag span → <button aria-label>. sweetalert2.scss + vue3datepicker.scss → var(--color-*); lib/swal.lib.js confirmDelete copy per §4.4 ('Xóa … này?', 'Xóa'/'Hủy'), danger confirm button. Presentation only; keep data-* specs query; lint+test+build; screenshots 1440 light/dark, 375 dark. URL: https://github.com/datvt243/resume-vuejs-website/issues/218

## Hub bytes before: 183018

## Branch
`feature/issue-218-global-components` — created from freshly pulled `staging` (at `554dd70`, #217 merged) via `gh issue develop 218 --checkout --base staging`. Not `main`, not `staging`.

## Diff
| File | Why |
|---|---|
| `src/lib/button.lib.js` (new) | `buttonClass({ variant, size, iconOnly })` — §5.3 shared classes + primary/secondary/ghost/danger + sm `h-7` / md `h-8` / lg `h-10`, square when icon-only. One source for `Button.vue`, `Modal.vue`'s footer "Đóng" and the SweetAlert2 buttons (`customClass`). |
| `src/components/global/Button.vue` | Uses `buttonClass`; `type` prop now = variant (default `secondary`), `size` default `md`; text wrapped in `<span>` so `gap-2` separates it from the icon; dev-only `console.warn` when icon-only without `aria-label` (attrs fall through to the `<button>`). |
| 16 consumer `.vue` files | `type="outline-*"` / `size="sm"` migrated: "Thêm" icon buttons → `primary` + `aria-label="Thêm mới"`; reload → `ghost` + `aria-label="Tải lại"`; "Xuất PDF / In", "Kiểm tra" → `primary`; other text buttons → default `secondary`; "Xoá tài khoản" → `danger`, copy "Xóa tài khoản". |
| `src/components/global/Heading.vue` | Props `text`, `level` (1 → `header` + `h1.text-lg`, `mb-6`; 2 (default) → `h2.text-md`, `mb-4`), `description` (`text-sm text-fg-2`); default slot = actions (`flex gap-2`). No `uppercase`, no arbitrary margin, no border, no `.heading` class. Unused `tag` prop dropped (0 consumers passed it). 18 page-title usages get `:level="1"` (auth ×4, every dashboard page's main title, AtsCheck's first); section headings (PageInformation ×4, PageHome ×2, AtsCheck ×3, VeeFormGeneralInformationUpdate) stay `h2`. |
| `src/components/global/NoData.vue` | §5.8: `fa-folder-open` icon `text-fg-3`, `title` (default "Chưa có dữ liệu"), optional `description`, default slot for one action. Replaces the yellow `alert-warning`. |
| `src/components/global/Box.vue` | §5.1 card `rounded-md border border-line bg-surface p-4`. |
| `src/pages/dashboard/PageAccountSettings.vue` | Removed its scoped `.account-settings-section` override (it re-did the card with `--bs-*` and higher specificity); `mb-[1.5rem]` → `mb-6`; `confirmDelete` gets `title: 'Xóa tài khoản này?'`. |
| `src/components/Toasts.vue` | Bottom-right (`fixed bottom-4 right-4`, full-width minus 16px gutters < sm), card `bg-surface border-line rounded-md p-3 shadow-float`, type icon (`circle-check`/`circle-xmark`/`triangle-exclamation`/`circle-info`) + color, close is `<button aria-label="Đóng thông báo">`, auto-dismiss 4000ms, `role="status" aria-live="polite"` on the always-mounted container. No "Thông báo" uppercase header. `.toast`/`.toast-body`/`.show` hooks kept. |
| `src/components/Toasts.spec.ts` | 5000 → 4000ms timings, dismiss query `[data-bs-dismiss="toast"]` → `button[aria-label="Đóng thông báo"]`, +1 test for the polite live region. |
| `src/components/Modal.vue` | Focus trap (Tab/Shift+Tab wrap among focusables not inside `[hidden]`/`display: none`), remembers `document.activeElement` on `show()` and restores it in `hide()`; `role="dialog" aria-modal="true" aria-labelledby` → title is now `h2.modal-title.text-md.font-semibold`; header close `span.btn` → `<button type="button" aria-label="Đóng" data-bs-dismiss="modal">`; footer "Đóng" uses `buttonClass({variant:'secondary'})`. `data-bs-dismiss="modal"` delegation unchanged, so page-level "Đóng" buttons still close. Id counter lives in a plain `<script>` block (Vue 3.4 has no `useId`; top-level `let` in `<script setup>` is per instance). |
| `src/components/Modal.spec.ts` | +2 tests: focus returns to the trigger; Tab from last wraps to first and Shift+Tab from first wraps to last. (`attachTo` throws `app.onUnmount is not a function` with this test-utils/Vue pair, so the mount container is appended to `document.body` by hand.) |
| `src/components/global/ListTransition.vue` | `transition: all 0.5s` → `opacity, transform 200ms ease-out` inside `@media (prefers-reduced-motion: no-preference)`, offset 30px → 8px. |
| `src/styles/_part/_transition.scss` | **Deleted** — imported nowhere (`grep -rn "_transition\|part/" src index.html vite.config.ts` → no import) and no `<Transition>` uses its `v-*`/`slide-up-*` classes. |
| `src/components/GroupTags.vue` | Remove-tag `span.pointer @click` → `<button type="button" :aria-label="\`Xóa thẻ ${tag}\`">`; add-tag icon button gets `aria-label="Thêm thẻ"`; `mb-[1rem]`/`ps-[1.5rem]` → `mb-4`/`ps-6`. |
| `src/styles/sweetalert2.scss` | Theme variables → tokens: background/toast `--color-surface`, text `--color-fg`, html text `--color-fg-2`, input/validation/footer/close colors, focus `--color-accent`, radius 12px, 14/16px type; `.swal2-popup` gets `border-line` + `shadow-float`; actions `gap: 8px`. Icon colors (warning/info/question) stay hex: sweetalert2's `_core.scss` runs `lighten()` on them, which can't take `var()`. |
| `src/lib/swal.lib.js` | Buttons from `buttonClass` (confirm `danger`, cancel `secondary`), `reverseButtons` (Hủy left, Xóa right). `confirmDelete`: new `title` param (default "Xóa mục này?"), "Xóa"/"Hủy" spelling per §4.4, icon `warning`; `getHtml` output now passed as `text`, not `html` (callers pass plain strings, one of them a user-entered item name). `confirmDiscardChanges`: same button classes. |
| `src/styles/vue3datepicker.scss` | `.dp__theme_dark, .dp__theme_light` both mapped to tokens (surface, fg, accent, line, danger…), 14px / 6px radius / inherited font; menu wrapper `border-line` 8px radius `shadow-float`. |
| `src/styles/tailwind.css` | Removed `.heading` (hex green, `!important`) and the `.modal-title` override (hex green + `uppercase`); toast block reduced to `.toast-container { z-index: 1090; pointer-events: none }` + `.toast { pointer-events: auto }`; `.modal-content` → `@apply rounded-lg border border-line bg-surface text-fg shadow-float`, header padding `0.75rem 1rem`. |
| `tailwind.config.cjs` | Safelist: dropped `heading`, `toast-header`, `toast-body` (no rules left). |
| `src/plugins/initFontAwesomeIcon.js` | Register `faFolderOpen`, `faCircleInfo`, `faTriangleExclamation`. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Append 2 node rows. |

## Regression node — `fix-header-user-menu-style-prop`
Found via the browser console during this pass: `[Vue warn]: Invalid prop: type check failed for prop "style". Expected String with value "[object Object]", got Object at <Dropdown class="user-menu" …>`; the user-menu buttons rendered `btn btn-[object Object]` (no button styling). Cause: `issue-217-app-shell` passed `style="outline-secondary"` to `Dropdown`; Vue parses a static `style` — and also a literal `:style="'…'"` (tried first, same result: compiled to `style: {}`) — into an object before it reaches the prop. Fix: `Dropdown.vue` prop `style` → `variant` (3 internal refs), `Header.vue` passes `variant="outline-secondary"` (Header is the only `Dropdown` consumer; `Dropdown.spec.ts` doesn't pass `style`). After a CDP `Network.clearBrowserCache` + reload (the debug browser had cached the stale template module): `userBtn: ["btn btn-outline-secondary", "btn dropdown-toggle dropdown-toggle-split btn-outline-secondary"]`, console `0 warnings`.

## Command
From repo root:
- `npm run lint`
- `npm run test`
- `npx vitest run src/components/Toasts.spec.ts`, `npx vitest run src/components/Modal.spec.ts`
- `npm run build`
- Typecheck: CANNOT RUN — pending add-typecheck-script.

## Output
`npm run lint` → no findings, `lint_exit=0`.

`npm run test` (final run):
```
 FAIL  src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
 Test Files  1 failed | 34 passed (35)
      Tests  1 failed | 230 passed (231)
```
231 = 228 + 3 new (1 Toasts, 2 Modal). The single failure is the pre-existing one proven on `staging` in `issue-216-ui-tokens`.
`Toasts.spec.ts` → `Tests  8 passed (8)`; `Modal.spec.ts` → `Tests  14 passed (14)`.

`npm run build`:
```
✓ built in 3.45s
```
Compiled swal CSS: `.swal2-popup{…border-radius:12px;background:var(--color-surface);color:var(--color-fg);font-family:inherit;font-size:14px}` and `.swal2-popup{border:1px solid var(--color-line);box-shadow:var(--shadow-float)}`.

DESIGN.md §10 grep (hex / `[Npx|rem]` / `opacity-N`) on every added line in `src/` + `tailwind.config.cjs` + new `button.lib.js` → only `disabled:opacity-50`, which is §5.3's own shared button class (disabled state, not faded text); excluding it → no matches (`grep_exit=1`).

Manual observation (Playwright on the port-9888 debug Chrome, `npm run dev`; not an automated test; session already logged in from the #217 pass):
```
Học vấn (1440 dark): h1 "Học vấn"; header buttons [aria-label "Thêm mới" primary, "Tải lại" ghost]
Swal (Cài đặt tài khoản → Xóa tài khoản, then Hủy — no API call): title "Xóa tài khoản này?", confirm ["Xóa", bg rgb(248,113,113), color #fff], cancel "Hủy", popup bg rgb(17,17,19)
Modal (Học vấn → Thêm mới via keyboard Enter): role "dialog", aria-labelledby → "Thêm mới Học vấn", .modal-content radius 12px; 60× Tab → focus always inside; Escape → closed, focus back on "Thêm mới"
Modal title after removing the override: text-transform none, color rgb(250,250,250), 16px
Toast (via the app's provided toast fn): display flex, 16px from right & bottom, aria-live "polite", hidden after 4.2s
NoData (Giải thưởng): "Chưa có dữ liệu" weight 600
375 dark (Cài đặt tài khoản): scrollWidth 375
```
Screenshots (local, gitignored): before — `.playwright-mcp/218-before-education-1440-dark.png`, `218-before-account-1440-dark.png`, `218-before-swal-1440-dark.png` (taken with this diff stashed = `staging`), plus #217's `217-after-*` set. After — `218-after-education-1440-dark.png`, `218-after-education-1440-light.png`, `218-after-account-1440-dark.png`, `218-after-account-1440-light.png`, `218-after-account-375-dark.png`, `218-after-swal-1440-dark.png`, `218-after-modal-1440-dark.png`, `218-after-toast-1440-dark.png`, `218-after-nodata-1440-dark.png`. Theme switched with the real header toggle.

## Acceptance
| Criterion | Evidence |
|---|---|
| Heading: no uppercase / arbitrary margin; level h1/h2; description + actions | `Heading.vue`; live h1 "Học vấn"; `.heading` rule removed |
| Button: 4 variants, h-7/h-8/h-10, icon-only square + aria-label, gap-2, no pill | `button.lib.js`; live header buttons with labels; dev warn |
| NoData §5.8 | `NoData.vue`; live on Giải thưởng |
| Box → card | `Box.vue`; live class `rounded-md border border-line bg-surface p-4 mb-6` |
| Toasts: bottom-right, polite, 4s, no uppercase, button close; spec updated | `Toasts.vue`, spec 8/8, live checks |
| Modal: focus trap, return focus, rounded-lg shadow-float; data-bs-dismiss still closes | `Modal.vue`, spec 14/14 (incl. 2 new), live Tab/Esc checks; Modal.spec "closes without asking…" uses `[data-bs-dismiss="modal"]` |
| ListTransition / _transition.scss: opacity+transform only, motion-safe | `ListTransition.vue`; `_transition.scss` deleted as dead |
| GroupTags remove → button with aria-label | `GroupTags.vue` |
| sweetalert2 + datepicker on tokens; confirmDelete copy + danger button | scss diffs, built CSS, live swal check |
| Presentation only; spec `data-*` kept | no API/store/composable/route/validation logic changed (swal.lib `text` vs `html` is rendering only); `data-interval`, `data-lang`, `data-bs-dismiss="modal"` untouched |
| lint + build green; no new test failure | outputs above |
| Comments per code-comments.md | Added: `button.lib.js` JSDoc (why shared); Button prop `//` value lists; Heading/NoData/Box/Toasts file descriptions (what the component is for, per §); Toasts template `<!-- -->` (why the live region stays mounted); Modal header JSDoc line (focus behavior) + `<script>` `//` (why the counter lives there); swal.lib JSDoc (why `text`); `.toast-container` `/* */` (why 1090); `_transition` n/a (deleted); `vue3datepicker.scss` `//` (why both themes share tokens); `sweetalert2.scss` `//` on the popup rule; Dropdown `//` (why not `style`); Modal.spec `//` (why manual attach). Replaced long node-history comments in Toasts/Modal headers. No issue refs. |

## Noticed, not done
- §5.3 `danger` = `bg-danger text-white`: in dark, white on `--color-danger` `#f87171` ≈ 2.8:1 (fails 4.5:1). Following the spec literally; DESIGN.md needs a `danger-fg` (or a darker dark-mode danger) — operator decision.
- `confirmDelete` from `useDocument.deleteDoc` uses the default title "Xóa mục này?"; entity-specific titles ("Xóa kinh nghiệm này?") need a label per collection — belongs with the CRUD pages (#223).
- `Modal.vue`'s `openModalCount` comment says "Module-scope" but it is a top-level `let` in `<script setup>` (per instance), so two open modals can re-enable body scroll early. Pre-existing; not fixed here.
- Modal size stays `modal-lg` (800px); §5.9 says 480/640px — forms are wide, decide per page in #222/#223.
- `VeeForm.vue` still renders legacy `.btn-success` / `.btn-secondary` submit/close buttons (specs query `button.btn-success`) — Phase 7 (#222).
- CRUD item cards / colored action icon links / drag handle unchanged — Phase 8 (#223).
- `PageAccountSettings.vue` still has `h6.text-uppercase.opacity-75` section titles and dev-note copy ("backend chưa có endpoint") — Phase 7/8.
- Dev-server gotcha for future browser checks: the debug Chrome kept serving a stale `Header.vue?…&type=template` module after edits; `Network.clearBrowserCache` + reload fixed it. Earlier screenshots of the header user menu in `issue-217-app-shell` were real (the bug was real), not a cache artifact.

## Seal gate
None in this pass (no commit/push; swal confirm cancelled with "Hủy", no delete API call). Ship via `/ship` after verifier SEAL.

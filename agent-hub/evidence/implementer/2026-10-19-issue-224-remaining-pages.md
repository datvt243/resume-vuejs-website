# 2026-10-19 - issue-224-remaining-pages

- Worker: implementer
- Version: 0.1.0
- Node: `issue-224-remaining-pages` in `haven/diagrams/dev-loop.prime-mermaid.md` (PM row appended after `issue-223-crud-lists`, `IN_PROGRESS`)
- Task (verbatim): #224 [UI] Phase 9 — ATS, Nhập CV, Xem trước, trang công khai, auth, loading (DESIGN.md §4, §5.7, §5.9, §7). PageAtsCheck.vue: page header + primary 'Kiểm tra'; CV template = segmented control (now btn-success/btn-outline-success); score text-xl font-semibold (drop font-bold, '/100 opacity-50'); badges per §5.6; fix PageAtsCheck.spec.ts:86-90 (.badge.text-bg-*); description to 1 sentence; arbitrary (11), opacity (12). PageImportLinkedin.vue: 3 sources (LinkedIn / PDF / JSON) as segmented control or 3 clear choices, one primary action; shorten the 3 instruction paragraphs; h6 → h2. PagePreview.vue: tidy page header (buttons stuck to title), theme + language = segmented control, profile select per §5.5. PagePublicResume.vue: tokens only (decided in #211) — loading / not-found use new NoData instead of alert-warning, drop hex/opacity; keep CV layout. Auth (Login, Register, ForgotPassword, ResetPassword, LayoutAuth): no card shadow, sentence-case titles (now 'ĐĂNG NHẬP' uppercase green), Vietnamese copy ('Login', 'We'll never share your email…'), 'Quên mật khẩu?' link must not wrap at 375px. Spinner.vue: drop full-page overlay (position: fixed); first load uses skeleton, keep Render cold-start countdown as a non-blocking notice; 'Loading...' → 'Đang tải…'. Final sweep: §10 grep (hex / arbitrary / opacity) over all src/, uppercase, rounded-pill, '…'. Presentation only — no API/store/composable/routing/validation changes; keep data-* specs query. One PR into staging. Screenshots before/after 1440 light, 1440 dark, 375 dark. lint+test+build green; DESIGN.md §10. Part of #211. URL: https://github.com/datvt243/resume-vuejs-website/issues/224

## Hub bytes before: 193466
(Measured right after appending this node's PM row.)

## Branch
`feature/issue-224-remaining-pages` — created from freshly pulled `staging` (`156b991`: #240 / #223 merged, then #241 = operator-approved chore PR committing a leftover `issue-116` recheck that blocked the checkout) via `gh issue develop 224 --checkout --base staging --name feature/issue-224-remaining-pages`. Not `main`, not `staging`.

## Diff
| File | Why |
|---|---|
| `src/components/global/SegmentedControl.vue` (new, auto-registered) | §5.7: `inline-flex rounded bg-surface-2 p-0.5`, items `h-7 px-3 rounded-sm text-sm`, selected `bg-surface text-fg shadow-sm`, `role="radiogroup"` / `role="radio"` + `aria-checked`, focus-visible ring, `v-model` on the option `value`, wraps on narrow screens. |
| `src/lib/badge.lib.js` (new) | `badgeClass(variant)` = §5.6 base + subtle bg per neutral / success / warning / danger / info (same pattern as `button.lib.js`). |
| `src/pages/dashboard/PageAtsCheck.vue` (+ spec) | `space-y-6` page; `Heading` with a one-sentence description (was a 3-sentence `opacity-75` paragraph) and the primary "Kiểm tra". Controls in one card: "Mẫu CV" `SegmentedControl` (was `btn-success`/`btn-outline-success`), labelled "Ngôn ngữ" select, secondary "Tải CV mẫu này" link (`rel="noopener"` added), job-description textarea with a real label ("(không bắt buộc)" in `text-fg-3`), placeholder ends in `…`. Results: §5.1 cards; score `text-xl font-semibold tracking-tight tabular-nums` + `/100` `text-sm text-fg-3` (was `h2 font-bold` + `opacity-50`); meta `text-sm text-fg-2`; classic note `text-xs text-fg-3`; checks list `divide-y`, icons `aria-hidden`; badges via `badgeClass` with `data-badge="danger|warning|success|neutral"` (was `badge rounded-pill text-bg-*`); `details` card, `pre` `whitespace-pre-wrap break-words` (was inline style). Spec: `.badge.text-bg-*` → `[data-badge=…]`, registers the real `SegmentedControl` (the "Classic" click test needs real buttons). All `mb-[…]`/`gap-[…]`/`opacity-*` gone. |
| `src/pages/dashboard/PageImportLinkedin.vue` (+ spec) | Header: "Nhập CV" + one-sentence description (3 attach buttons removed from the header). One card: "Nguồn dữ liệu" `SegmentedControl` (LinkedIn / PDF / JSON Resume, UI-only `picker` ref — `source` still = what was parsed), one line of guidance per source (was 3 paragraphs), one primary "Chọn file .zip / PDF / JSON" calling the existing trigger functions. Results: "Nguồn: …" line (PDF adds the "kiểm tra kỹ" caveat), two cards with `h2` headers + counts (was `h6`), rows `divide-y`, small "Thêm" buttons, empty → `NoData` "Không tìm thấy mục nào", `border-[var(--bs-border-color)]` gone. Modals: "Thêm học vấn / Thêm kinh nghiệm (từ …)", footer Hủy (`#cancel`) → Lưu. Spec: stub `SegmentedControl`. Parse/save handlers untouched. |
| `src/pages/dashboard/PagePreview.vue` (+ spec) | Both export buttons in the `Heading` actions (secondary JSON, primary PDF), controls in one card below: "Giao diện" + "Ngôn ngữ" `SegmentedControl`s (was `btn-success` groups), "Profile CV" labelled `form-select` (§5.5). `no-print` kept; print CSS untouched. Spec: stub `SegmentedControl`. |
| `src/pages/public/PagePublicResume.vue` (+ spec) | Loading → skeleton (`bg-surface-2` bars, `motion-safe:animate-pulse`, `aria-busy`, sr-only "Đang tải hồ sơ…"); not-found → `NoData` "Không tìm thấy hồ sơ" (was `alert alert-warning` + inline `max-width` + `p-[1rem]`). `CvResumeLayout` untouched. Spec: stub `NoData`. |
| `src/pages/auth/Page{Login,Register,ForgotPassword,ResetPassword}.vue` | Card `w-full max-w-md rounded-md border border-line bg-surface p-6` in a `flex justify-center py-12` wrapper — the 4 duplicated scoped `.auth-card` blocks (with `box-shadow` + `rgba` + `1rem` radius) deleted. Field `icon`s removed: `FrmInput`/`FrmPwd` hide the label when an icon is set, so these were label-less inputs; now labels sit above like every other form. English help text "We'll never share your email…" removed; submit "Login" → "Đăng nhập", "Register" → "Tạo tài khoản"; "Nhập lại Mật khẩu" → "Nhập lại mật khẩu"; forgot-password intro → `Heading` description; reset missing-token message reworded; "Quên mật khẩu?" / "Quay lại đăng nhập" get `whitespace-nowrap` (and `text-sm`). |
| `src/pages/_layouts/LayoutAuth.vue` | `py-[1.5rem]` → `py-6`. |
| `src/components/Spinner.vue` | No overlay, no blur on siblings: `.spinner-container` is a pointer-events-none fixed top layer with a 2px accent bar (slides only under `prefers-reduced-motion: no-preference`) + a bottom-left notice card (`border-line bg-surface shadow-float`, bottom-left so it doesn't sit on the bottom-right toasts). First 3 s: small spinner + "Đang tải…" (`role="status"`); then the cold-start notice with the countdown ring (40px, `--color-accent` on `--color-surface-2`, was `#00d095` / `#333` / `#fff` / rgba) and the same messages (secondary line shortened, overtime ends in `…`). Spec hooks `.spinner-container`, `.spinner-border`, `.countdown-ring`, `.countdown-number` kept. |
| `src/pages/_layouts/Footer.vue` | Sweep: `opacity-50` → `text-fg-3`. |
| `src/pages/dashboard/PageAccountSettings.vue`, `src/models/profile.model.ts` | Sweep: `...` → `…` in the delete dialog text and the profile name placeholder. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Append node row. |

Not touched: API calls, stores, composables, routing, validation rules, `CvResumeLayout`.

## Command
From repo root:
- `npx vitest run src/pages/dashboard/PageAtsCheck.spec.ts` / `PageImportLinkedin.spec.ts` / `PagePreview.spec.ts`, `npx vitest run src/pages/public`, `npx vitest run src/components/Spinner.spec.ts`
- `npm run lint`
- `npm run test`
- `npm run build`
- Typecheck: CANNOT RUN — pending add-typecheck-script.

## Output
```
PageAtsCheck.spec.ts       Tests  5 passed (5)
PageImportLinkedin.spec.ts Tests  6 passed (6)
PagePreview.spec.ts        Tests  2 passed (2)   (after stubbing SegmentedControl; before that: 2 passed + "Failed to resolve component: SegmentedControl" warnings)
src/pages/public           Tests  5 passed (5)   (after stubbing NoData; before: same + resolve warnings)
Spinner.spec.ts            Tests  5 passed (5)   (re-run after the duplicate-announcement fix)
npm run lint:   lint_exit=0
npm run test:   FAIL src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
                Test Files  1 failed | 35 passed (36)
                Tests  1 failed | 239 passed (240)      (same pre-existing failure as #220–#223)
npm run build:  ✓ built in 3.67s
```
(Final runs, after every edit.)

Sweep (repo-wide, DESIGN.md §10 + issue): arbitrary `[Npx|rem]` / `opacity-N` in non-spec `src/` `.vue/.js/.ts` → only `button.lib.js` `disabled:opacity-50` (allowed by §5.3) after the Footer fix; hex in `.vue` → only `issue #N` / `resume-nodejs-api#133` comment refs; `uppercase` → only `CvResumeLayout.vue:270` `.cv-section-title` (CV document layout, out of scope per #211 "keep CV layout"); `rounded-pill` → none; `...` UI strings → the 2 fixed above. Changed-file grep (incl. `SegmentedControl.vue`) for hex / arbitrary / opacity / `rounded-pill` / `text-uppercase` / `...` → no matches (`grep_exit=1`).

Manual observation (Playwright on the port-9888 debug Chrome, existing `npm run dev`; dashboard pages in the logged-in session, auth pages in a fresh browser context (`browser.newContext()`) so no logout; scripted; not an automated test). Before = `git stash push -u -- src/` + HMR, then `git stash pop`. Theme via `data-bs-theme` on `<html>`.
```
Before: 375 scrollWidth 375 on all 8 views (no overflow to fix); login h1 "Đăng nhập", text-transform none, rgb(250,250,250) — the issue's "ĐĂNG NHẬP uppercase green" was already fixed by Phase 3's Heading
After:
 ats-check: radiogroup "Mẫu CV: Tối ưu ATS*|Classic"; header primary "Kiểm tra"; 375 sw 375
 import-linkedin: radiogroup "Nguồn dữ liệu: LinkedIn*|PDF|JSON Resume"; primary "Chọn file .zip"; real click "PDF" → primary "Chọn file PDF", hint "CV PDF một cột, tối đa 5MB. PDF dạng ảnh scan không đọc được."; 375 sw 375
 preview: radiogroups "Giao diện CV: Classic*|Modern|Compact", "Ngôn ngữ CV: Tiếng Việt*|English"; primary "Xuất PDF / In"; 375 sw 375
 segmented labels: first pass showed "Nguồn dữ liệu" beside the control (.form-label is inline-block) → added `block` → label 4px above the control on all 3 pages
 spinner (caught during a route change): position fixed, pointer-events none, container height 2 (bar only), notice at left 16 / bottom 16; text read "Đang tải…Đang tải…" (sr-only + visible) → fixed to a single role="status" text
 public /resume/no-such-profile-xyz: NoData "Không tìm thấy hồ sơ" + description rendered
 login: h1 "Đăng nhập", card box-shadow none, labels [Email, Mật khẩu, Ghi nhớ đăng nhập], submit "Đăng nhập", no English strings, "Quên mật khẩu?" 1 line at 375
 register: labels [Email, Mật khẩu, Nhập lại mật khẩu], submit "Tạo tài khoản", shadow none; forgot-password: link 1 line at 375; reset-password: labels [Mật khẩu mới, Nhập lại mật khẩu]; all 375 sw 375
```
Rate limit: the last browser passes got HTTP 429 from the API on every call (list endpoints, visits, `api/me/no-such-profile-xyz`). So the public not-found render may come from the 429 error path, not a real 404 (both set `notFound` — not distinguishable here), and the final Preview / ATS / Import screenshots after the label fix may show missing CV data. Stopped browser work at that point.

Screenshots (local, gitignored, `.playwright-mcp/`): `224-before-*` / `224-after-*` × {ats-check, import-linkedin, preview, public-notfound, login, register, forgot-password, reset-password} × {1440-dark, 1440-light, 375-dark}, plus `224-after-spinner-1440-dark.png`.

## Acceptance
| Criterion | Evidence |
|---|---|
| ATS: header + primary "Kiểm tra", segmented template, score `text-xl font-semibold`, §5.6 badges, spec :86-90 fixed, 1-sentence description, arbitrary/opacity gone | live radiogroup + primary; spec 5/5; changed-file grep clean |
| Import: segmented sources, one primary action, guidance shortened, `h6` → `h2` | live radiogroup + PDF click; markup |
| Preview: header tidy, segmented theme + language, labelled profile select | live radiogroups; markup |
| Public: `NoData` instead of `alert-warning`, no hex/opacity, CV layout kept | live not-found render (see rate-limit caveat); `CvResumeLayout` untouched |
| Auth: no shadow, sentence-case titles, Vietnamese copy, link doesn't wrap at 375 | live checks on all 4 pages |
| Spinner: no full-page overlay, cold-start countdown as non-blocking notice, "Đang tải…" | live position/pointer-events; spec 5/5 |
| First load uses skeleton | **Partial**: public page only. Dashboard pages have no loading flag to drive one — `useCandidate` would have to expose its `handleBase` loading state, which is a composable change the issue forbids. Not done, flagged. |
| Final sweep | repo-wide grep results above |
| Presentation only; spec hooks kept | handlers/composables untouched; Spinner/ATS/Import/Preview/public specs green |
| lint + build green, no new test failure | outputs above |
| Comments per code-comments.md | `SegmentedControl` / `badge.lib` doc blocks, Import `picker` WHY line, Spinner header + "never blocks the page" CSS note. No new issue refs. |

## Noticed, not done
- Dashboard first-load skeletons: needs a loading flag from `useCandidate` (composable) — separate task.
- Before data loads, list pages show their empty state ("Chưa có … nào") — same root cause as above.
- `CvResumeLayout.vue` `.cv-section-title` still `text-transform: uppercase` (CV document style, out of scope).
- Public page shows the dashboard shell when opened while logged in (layout routing, pre-existing).
- `button.lib.js` `disabled:opacity-50` stays (it's the §5.3 spec).
- API rate limit (429) hit during the browser pass — see Output.

## Seal gate
None in this pass (no commit/push; only UI clicks, no API writes). Ship via `/ship` after verifier SEAL.

---

## Round 2 — after REOPEN (`evidence/verifier/2026-10-19-issue-224-remaining-pages-reopen.md`)
REOPEN reasons: (1) the "Partial" skeleton row rested on a wrong claim — a loading signal already exists (`App.vue` provides the Spinner ref as `'spinner'`, `useHelper().loading` returns it, `useCandidate.getData` runs through `handleBase` with it), so exposing `isLoading` from `Spinner.vue` (in scope) needs no composable change; (2) removing the overlay without a skeleton regressed UX — list pages showed "Chưa có … nào" during the fetch / ~30s cold start. Both accepted: my blocker claim was wrong.

### Diff (round 2)
| File | Why |
|---|---|
| `src/components/Spinner.vue` | `defineExpose` now also exposes `isLoading` (moved below the `const` declarations — exposing it above them would hit the TDZ at setup). |
| `src/components/global/LoadingGate.vue` (new, auto-registered) | Reads `useHelper().loading` (the provided Spinner ref) → `busy = !!loading?.value?.isLoading`; while busy renders a 3-row list skeleton in a `divide-y` card (`bg-surface-2` blocks, `motion-safe:animate-pulse`, `aria-busy`, sr-only "Đang tải…"), otherwise its slot. No spinner mounted yet → slot. |
| `src/components/global/LoadingGate.spec.ts` (new) | 2 tests: skeleton (not the empty slot) while `isLoading`, slot once it flips false; slot when the spinner ref is null. |
| `src/pages/dashboard/Page{Education,Experience,Project,Award,Certificate,Reference,Application,Profile}.vue` | The empty-state card (`v-else`) is wrapped in `<LoadingGate v-else>`, so it only shows once no request is in flight. |
| `src/pages/dashboard/PageApplication.spec.ts` | Stub `LoadingGate` as a pass-through slot. |
| Composables / stores / API | Untouched (as the issue requires). |

### Command / Output (round 2, final runs)
```
LoadingGate.spec + Spinner.spec + src/pages/dashboard:  Tests  29 passed (29)
npm run lint:   lint_exit=0
npm run test:   FAIL src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
                Test Files  1 failed | 36 passed (37)
                Tests  1 failed | 241 passed (242)      (pre-existing failure only; 242 = 240 + 2 LoadingGate tests)
npm run build:  ✓ built in 3.60s
LoadingGate.vue §10 grep: grep_exit=1 (clean)
```
Manual observation (Playwright, logged-in session, scripted, not an automated test): navigate /visits → /award (no awards in this account), poll every 20 ms:
```
[{"state":"none","ms":1},{"state":"skeleton","ms":111},{"state":"empty","ms":343}]
```
"none" = the lazy route chunk loading; the empty state never appeared before the skeleton. Second run with `waitForResponse`: the `api/v1/award/` response was **HTTP 429** (rate limit still active), then state `{ empty: true, skeleton: false }` — screenshot `.playwright-mcp/224-after-award-empty-1440-dark.png`. So the gate is verified for "skeleton during the request → slot after it finishes", but this account/session could not produce a 200-with-zero-items response; showing the empty state after a failed fetch is pre-existing behavior (`useCandidate` leaves `[]` on error), not changed here.

### Acceptance (row updated)
| Criterion | Evidence |
|---|---|
| First load uses skeleton (no false empty state) | `LoadingGate` on all 8 list pages + public page skeleton; spec 2/2; live timeline skeleton → empty |

---

## Round 3 — after REOPEN r2 (`evidence/verifier/2026-10-19-issue-224-remaining-pages-r2-reopen.md`)
REOPEN r2 reason: round 1's "To SEAL" also named Information / General, and round 2 covered only the list + public pages; `PageGeneralInformation.vue` showed the "Mong muốn công việc" form blank during the first fetch. Accepted.

### Diff (round 3)
| File | Why |
|---|---|
| `src/components/global/LoadingGate.vue` | New `variant` prop. `list` (default) unchanged. `form`: 4 label+input skeleton bars while busy, and the slot stays **mounted** behind `v-show` — `VeeForm` only loads `document` through a non-immediate `watch`, so a `v-if` remount after the data arrived would leave it blank. |
| `src/components/global/LoadingGate.spec.ts` | +1 test: form variant keeps the slot in the DOM with `display: none` while loading, skeleton gone and slot shown after. First test's root assertion → `find('[aria-busy="true"]')` (component root is now a fragment). |
| `src/pages/dashboard/PageGeneralInformation.vue` | "Mong muốn công việc" `VeeForm` wrapped in `<LoadingGate variant="form">`. (Its skill/language table sections were already behind the page's own `v-if`.) |
| `src/pages/dashboard/PageInformation.vue` | The 3 `VeeForm`s (Thông tin cá nhân, Mạng xã hội, Link CV công khai) wrapped in `<LoadingGate variant="form">`. |

### Command / Output (round 3, final runs)
```
LoadingGate.spec.ts: Tests 3 passed (3)
npm run lint:   lint_exit=0
npm run test:   FAIL src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
                Test Files  1 failed | 36 passed (37)
                Tests  1 failed | 242 passed (243)      (pre-existing failure only; +1 LoadingGate test)
npm run build:  ✓ built in 3.56s
```
Manual observation (Playwright, logged-in session, scripted; not an automated test), /award → /general-information, poll every 20 ms on the "Vị trí mong muốn" input:
```
1st try (API still rate-limited): general-information HTTP 429 → [skeleton @69ms, form:(blank) @300ms] — blank because the fetch failed
after waiting for the rate limit to clear: general-information HTTP 200 →
[{"state":"skeleton","ms":0},{"state":"form:(blank)","ms":664},{"state":"form:Frontend Developer","ms":699}]
```
So with a real response the user sees the skeleton for the whole request, then the filled form; the 35 ms blank in between is the gap between the spinner hiding and the `document` watcher filling the fields (about 2 frames). Screenshot `.playwright-mcp/224-after-general-loaded-1440-dark.png`. `PageInformation.vue` reads the candidate already in the store (fetched by `App.vue` through the same spinner), so its forms get the same gate; not separately timed live.

### Acceptance (row updated again)
| Criterion | Evidence |
|---|---|
| First load uses skeleton (no misleading blank / empty state) on list pages + Information / General | `LoadingGate` list variant on 8 list pages, form variant on the 4 forms of Information / General, public page skeleton; spec 3/3; live timelines above |

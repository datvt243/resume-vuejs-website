# 2026-11-05 - issue-394-languages-page-nav-group
Worker: implementer · Version: 0.1.0 · Node: `issue-394-languages-page-nav-group` (haven/diagrams/dev-loop.prime-mermaid.md)
Task (verbatim): "tách Language ra page riêng. trên menu bar 3 items Giải thưởng, Chứng chỉ và Người tham khảo hãy gộp vào 1 dropdown, text thì claude xem xét giúp tôi cho phù hợp" — issue #394 https://github.com/datvt243/resume-vuejs-website/issues/394

## Branch
`feature/issue-394-language-page-more-menu` (off `staging` @ 7a58b6a, created via `gh issue develop 394`)

## Hub bytes before
84561

## Interpretation
- "menu bar" = the dashboard sidebar (`LayoutDefault.vue` navGroups) — that is where the 3 items live; the header has no such items.
- "dropdown" in a vertical sidebar = a disclosure (button + aria-expanded + collapsible sub-list). Open while a child route is active; manual toggle resets on navigation.
- Group label chosen: VI "Thành tích & tham khảo", EN "Achievements & references" (awards+certificates = achievements, plus references).
- Languages page: `/dashboard/languages`, nav label VI "Ngoại ngữ" / EN "Languages", icon `fa-language`, placed after Skills (same pattern as #372 Skills page split off general-information).

## Diff
| file | why |
|---|---|
| src/pages/dashboard/PageLanguages.vue (new) | foreign-languages editor moved here; provides `candidate` for VeeFormGeneralInformationUpdate; reload button like PageSkills |
| src/pages/dashboard/PageGeneralInformation.vue | removed the languages block + now-unused imports/provide/isLoading |
| src/routers/index.ts | route `languages` |
| src/pages/_layouts/LayoutDefault.vue | Languages nav item; Award/Certificate/Reference nested under a `children` item rendered as a disclosure; `toggledGroups` reset in the existing route watcher |
| src/plugins/initFontAwesomeIcon.js | register faLanguage, faChevronDown |
| src/i18n/index.ts | `nav.languages`, `nav.achievements` in vi + en |
| DESIGN.md §3 | sidebar listing updated to match |

## Command
`npm run lint` · `npm run test` · `npm run build` · `npm run typecheck`

## Output
- lint: `> eslint src --ext .js,.ts,.vue` — no errors printed, exit 0
- test: `Test Files  55 passed (55)` / `Tests  352 passed (352)`
- build: `✓ built in 3.90s`
- typecheck: `grep -c "error TS"` = 90 (baseline 90). Only hit in a touched-area file: `src/plugins/initFontAwesomeIcon.spec.ts(74,42): error TS2339: Property 'definitions' does not exist on type 'Library'.` — spec file not changed by this diff, pre-existing.

## Live check (npm run dev, localhost:5173, own CDP window, qa.full@example.com — read-only, no writes)
Playwright result: `{"url":".../#/dashboard/languages","h1":"Ngoại ngữ","main":"Ngoại ngữ\nNgoại ngữ\n\nNgôn ngữ và trình độ của bạn.\n\nThêm\n#\tNgôn ngữ\n\tCấp độ ... 1\tenglish\tCơ bản","label":"Thành tích & tham khảo","expandedOnLanguages":"false","expandedAfterClick":"true","childVisible":true,"onCert":{"url":".../#/dashboard/certificate","expanded":"true","current":"Chứng chỉ","h1":"Chứng chỉ"},"genInfo":{"h1":"Thông tin chung","hasLanguagesSection":false,"expanded":"false"}}`
Screenshot 1440px dark: sidebar shows Ngoại ngữ item and expanded "Thành tích & tham khảo" group with Chứng chỉ active (scratchpad cert-expanded.png). Light / 375px screenshots not taken.

## Acceptance
| Criterion | Evidence |
|---|---|
| (1) languages editor on its own route, linked in sidebar | live: `url .../dashboard/languages`, `h1 Ngoại ngữ`, existing row `english / Cơ bản` listed; general-information `hasLanguagesSection:false` |
| (2) 3 items in one disclosure, aria-expanded, auto-open on child route | live: `expandedOnLanguages:"false"` → click → `"true"`; on certificate `expanded:"true"`, `aria-current` = Chứng chỉ; back on general-info `expanded:"false"` |
| (3) vi + en strings | i18n diff adds `languages`/`achievements` to both `nav` blocks |
| (4) lint/test/build/typecheck | see Output: 352 passed, built, typecheck 90 ≤ 90, none in changed files |
| (5) dev-server check | see Live check |
| icons registered | `initFontAwesomeIcon.spec.ts` is in the 55 passing files (checks every `icon="fa-…"` in .vue resolves) |
| comments per code-comments.md | 2 new comments: PageLanguages header (why it uses general-information), LayoutDefault `toggledGroups` (why reset on navigation) — WHY, no issue refs |

## Supersedes
none

## Noticed, not done
- Languages page shows "Ngoại ngữ" twice (h1 + section title from VeeFormGeneralInformationUpdate). Same pattern as Skills page; left as-is.
- `useProfileCompletion` has no languages entry (never had); not added.

## Seal gate
none (no commit/push)

## REOPEN 1 response (2026-11-05) — answers evidence/verifier/2026-11-05/issue-394-languages-page-nav-group-reopen.md
No code change; missing DESIGN.md §10 evidence added.

### §10 token grep (added lines of `git diff -U0 -- src DESIGN.md` + full new PageLanguages.vue)
`grep -nE "#[0-9a-fA-F]{3,6}|\[[0-9.]+(rem|px)\]|opacity-[0-9]+"` → no output, `exit=1` for both runs (no matches).

### Screenshots (own CDP window, qa.full, on /dashboard/award with the group open)
- 1440px light (`award-1440-light.png`): white surfaces; group "Thành tích & tham khảo" expanded with chevron up; "Giải thưởng" active (surface-2 bg + brand left bar), children indented; nothing clipped.
- 1440px dark (`cert-expanded.png`, round 1): same, "Chứng chỉ" active.
- 375px dark, drawer open (`award-375-dark-drawer.png`): group expanded, children fit 240px drawer with no truncation; `document.documentElement.scrollWidth - innerWidth` = `0` (no horizontal overflow).

### Keyboard (Playwright, real key presses)
Focus "Dự án" link → `Tab` → `{"focused":"Thành tích & tham khảo","fv":"true outline=solid 2px","e0":"false","e1":"true","e2":"false"}` — Tab lands on the group button, `:focus-visible` with 2px solid outline, Enter opens (`aria-expanded` false→true), Space closes (true→false). Earlier run: with the group open, `Tab` from the button moved focus to "Giải thưởng" (`nextFocus":"Giải thưởng"`) — logical order into the sub-list.

## REOPEN 2 response (2026-11-05) — answers evidence/verifier/2026-11-05/issue-394-languages-page-nav-group-reopen-2.md
No code change.

### /dashboard/languages in the three §10 views (own CDP window, qa.full)
Playwright: `{"bg1":"rgb(10, 10, 11)","bg2":"rgb(250, 250, 250)","bg3":"rgb(10, 10, 11)","overflow375":0,"tableOverflow":[{"w":341,"parent":341,"ox":"auto"}]}`
- 1440 dark (`lang-1440-a.png`, body bg rgb(10,10,11)) and 1440 light (`lang-1440-b.png`, body bg rgb(250,250,250)): h1 "Ngoại ngữ" + reload icon button; FormSection left column (title, description, "Thêm"), table right (#, Ngôn ngữ, Cấp độ, row `1 english Cơ bản` + delete); sidebar "Ngoại ngữ" active, group collapsed (no child active). Nothing clipped.
- 375 dark (`lang-375-dark.png`, full page): section stacks above the table; `documentElement.scrollWidth - innerWidth = 0`; table scrollWidth 341 = container clientWidth 341 (no overflow; container already `overflow-x:auto` if it ever did).

### Empty / loading / error states
Unchanged — the page reuses `VeeFormGeneralInformationUpdate` + `TableDefault` exactly as general-information did. Empty: `TableDefault.vue:170-173` `v-else` → `<NoData />`. Loading/error: data comes from `useCandidate` → `handleBase` (spinner + error toast), same as before. The removed `isLoading` gate was only an `onMounted` flag (no request), not a loading state; the component's deep `watch` on `modelValue` fills the table when data arrives. Not live-tested with an empty account (would need a second login and more API calls).

### web-design-guidelines pass (fetched command.md from vercel-labs/web-interface-guidelines, applied to new/changed lines)
- src/pages/_layouts/LayoutDefault.vue:117 — real `<button>` with `aria-expanded`/`aria-controls`; hover + focus-visible come from `.nav-item` ✓
- LayoutDefault.vue:127 — chevron is decorative; live DOM: both svgs in the button `aria-hidden="true"` ✓
- LayoutDefault.vue:129 — `motion-safe:transition-transform` (transform only, honours reduced motion) ✓
- "Expanded panels in URL" — by design, open state is derived from the current route, so it is already URL-driven; only the manual toggle is transient ✓ (deliberate)
- src/pages/dashboard/PageLanguages.vue — icon-only reload button has `aria-label` ✓; no other new markup
Result: no findings.

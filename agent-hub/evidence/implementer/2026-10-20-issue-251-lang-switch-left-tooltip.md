# 2026-10-20 - issue-251-lang-switch-left-tooltip

- Worker: implementer
- Version: 0.1.0
- Node: `issue-251-lang-switch-left-tooltip` in `haven/diagrams/dev-loop.prime-mermaid.md` (new row appended after `issue-251-header-language-switch`, `IN_PROGRESS`). A new node rather than editing the SEALED `issue-251-header-language-switch` row (LAI-13).
- Task (verbatim operator prompt): "dời EN/VI qua góc trái, cho nó nằm riêng, thêm icon info tooltip ghi rõ nó sẽ áp dụng luôn cho cả CV's language" — move the EN/VI switch to the left corner of the header, on its own, and add an info icon whose tooltip says it also applies to the CV language. Follow-up to #251 before it ships. https://github.com/datvt243/resume-vuejs-website/issues/251

## Hub bytes before: 199605
From the previous `worker-runs.log` line's `hub_bytes_after`; the hub was unchanged between that verdict and this pass.

## Branch
`feature/issue-251-header-language-switch` (same branch as the sealed #251 node; not yet shipped). Not `main`, not `staging`.

## Diff (on top of the sealed #251 diff)
| File | Why |
|---|---|
| `src/pages/_layouts/LangSwitch.vue` (new) | VI \| EN `SegmentedControl` + a 32px info `<button>` (`fa-circle-info`, `aria-label`, `aria-describedby="lang-switch-tip"`) + `<span role="tooltip">`. Tooltip styling per DESIGN.md §6.4 (`bg-surface border border-line shadow-float rounded p-2 text-xs`). Shown via `peer-hover:block peer-focus:block` (hover, keyboard focus, tap); `hidden` otherwise so it takes no layout width. Positioned `absolute left-0 top-full` against the whole group (not the icon) so it stays inside 375px. |
| `src/pages/_layouts/Header.vue` | Removed the two inline switches from the right-side groups; `LangSwitch` placed right after the brand link in both header variants (on desktop logged-in the brand link is `lg:hidden`, so the switch is the first thing at the left). Dropped now-unused `setLang`/`LANG_OPTIONS`. 375px fit: header "Tải CV" shortcut `hidden sm:inline-flex` (the Home page CV card still has download); logged-out brand text `hidden sm:inline` (same as the logged-in header); `ghostLink` gets `whitespace-nowrap` so "Log in"/"Sign up" don't wrap. |
| `src/i18n/index.ts` | `header.languageInfoLabel` (button label) + `header.languageInfo` (tooltip) in vi/en. vi: "Áp dụng cho cả giao diện và ngôn ngữ CV: xem trước, link CV công khai và file PDF tải về." en: "Applies to both the interface and your CV language: the preview, the public CV link and the downloaded PDF." |
| `src/pages/_layouts/LangSwitch.spec.ts` (new) | Clicking EN sets the shared `useCvLang` value and the tooltip text switches language; the info button's `aria-describedby` points at the `role="tooltip"` element and it has an `aria-label`. |

## Command
From repo root:
- `npx vitest run src/pages/_layouts src/i18n src/composables/useCvLang.spec.ts`
- `npm run test`, `npm run build`, `npm run lint`
- Typecheck: CANNOT RUN — pending add-typecheck-script
- Manual check in a real browser (Playwright MCP) against the running `npm run dev` on :5173: logged-in tab at 1440 and 375, logged-out header in a new tab (`/login`, own sessionStorage → logged out) at 375.

## Output
`npx vitest run src/pages/_layouts src/i18n src/composables/useCvLang.spec.ts`:
```
 ✓ src/composables/useCvLang.spec.ts (6 tests) 15ms
 ✓ src/i18n/index.spec.ts (1 test) 30ms
 ✓ src/pages/_layouts/LangSwitch.spec.ts (2 tests) 84ms
      Tests  9 passed (9)
```

`npm run test`:
```
 FAIL  src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
 Test Files  1 failed | 39 passed (40)
      Tests  1 failed | 254 passed (255)
```
Same pre-existing `staging` failure as in the previous #251 and #249 notes.

`npm run build`: `✓ built in 3.83s`

`npm run lint`: `eslint src --ext .js,.ts,.vue` printed no errors.

Browser (manual observation, not an automated test):
- 1440, logged in: header left edge 240 (sidebar width), switch left 264 (= 24px header padding) → switch is the first item at the left. Tooltip `visibility` hidden by default; on hover it rendered below the icon with the en text (screenshot `251b-1440-hover-crop.png`).
- 375, logged in, first attempt (`invisible` tooltip anchored to the icon): `docScroll 424` with tooltip open (`tipLeft 168, tipRight 424`). Second attempt (anchored to group, `hidden`): tooltip `83–339`, but header row `docScroll 412` (info icon added ~37px). After hiding the download shortcut below `sm`: `closedScroll 375, openScroll 375, tip [83, 339]` (screenshot `251b-375-focus.png`).
- 375, logged out (`/login`): first `docScroll 375` but "Resume API" and "Log in"/"Sign up" wrapped to two lines (`251b-375-login.png` first version). After the brand/nowrap changes: `docScroll 375, headerScroll 375, headerH 56`, single line: icon, VI|EN, info, Log in, Sign up, theme.
- Screenshots are in `.playwright-mcp/` (gitignored; the logged-in ones show personal profile data — not committed).

## Acceptance
| Criterion | Evidence |
|---|---|
| Switch at the header's left corner | 1440: switch left 264 = header left 240 + 24px padding; 375 screenshots show it right after the menu/brand icon. |
| On its own, separate from the right-side actions | `LangSwitch` is its own group before `.ms-auto`; the right-side group only has theme / download / user menu (logged in) or auth links / theme (logged out). |
| Info icon with a tooltip saying it also applies to the CV language | Tooltip text vi/en above; shown on hover (1440 screenshot) and focus (375 screenshot); `LangSwitch.spec.ts` checks text + `aria-describedby` → `role="tooltip"`. |
| No horizontal scroll at 375px, tooltip open or closed, logged in or out | `closedScroll 375, openScroll 375`; logged-out `docScroll 375`. |
| Build green, no new test failures | `✓ built in 3.83s`; 254 passed, 1 pre-existing failure. |
| Comments per code-comments.md | `LangSwitch.vue` has a short file description (why the tooltip exists, why it is anchored to the group). No `(#N)` refs. |

## Noticed, not done
- The header "Tải CV" shortcut is now hidden below 640px (to make room for the info icon). Download is still on the Home page CV card. Operator may prefer a different trade-off (e.g. move theme toggle into the user menu on mobile).
- Tooltip has no Esc-to-dismiss (WCAG 1.4.13 "dismissible"); it closes on blur / pointer leave. Moving the pointer from the icon onto the tooltip hides it (`peer-hover`), so long text can't be hovered — text is short.
- Items from the previous #251 note still open: follow-up translation issues not filed; `yarn.lock` lacks `vue-i18n`; `Dropdown.vue:90` sr-only raw markup; `VeeForm.spec.ts:287`.

## Seal gate
None — no commit, push or API write.

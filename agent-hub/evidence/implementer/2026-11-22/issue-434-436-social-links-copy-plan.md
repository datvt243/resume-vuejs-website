# 2026-11-22 - issue-434-436-social-links-copy

- Worker: implementer · Version: 0.1.0
- Node: `issue-434-436-social-links-copy` (`haven/diagrams/dev-loop.prime-mermaid.md`, IN_PROGRESS)
- Branch: `feature/issue-434-436-social-links-copy` (off `staging` @ 8c87138, via `gh issue develop 434`; an empty `feature/issue-434-social-links-validate` made first was deleted local + remote before any change, both pointed at 8c87138)
- Task: `/todo #434, #436` — one node, like `issue-432-433-personal-info-select`.
  - #434 "Social links: validate GitHub / LinkedIn / Website as http(s) URLs" — optional fields; when filled each must be an `http`/`https` URL; invalid → field error (vi + en), no request.
  - #436 "Share: add a "Copy link" button for the public link" — a Copy button next to the link (Clipboard API) with a success toast (vi + en).

## Hub bytes before: 100323

## Feature doc: doctrine/features/personal-information.md
Analyst pass 0 (one subagent, resumed for #436): `evidence/analyst/2026-11-22/issue-434-social-links-validate-spec.md`, `evidence/analyst/2026-11-22/issue-436-share-copy-link-spec.md` (both spec_ready, no open questions). Node criteria = the doc's (#434)/(#436) criteria below (Behavior 5a, 7a, 7b).

## Diff
| File | Why |
|---|---|
| `src/models/information.model.ts` | new exported `validSocialUrl` (yup `.trim().url()` + `.matches(/^https?:\/\//i, excludeEmptyString)`, message `validation.urlInvalid`); 1-line why comment: `.url()` alone passes `ftp://` and `//host` |
| `src/pages/dashboard/PageInformation.vue` | `valid: validSocialUrl` on the 3 live social fields (github/linkedin/website); `copyPublicLink()` (writeText → success toast, any throw/reject → danger toast); `Button` `fa-solid fa-copy` beside the link text (inside the existing `v-if="publicLink"`, so no link → no button) |
| `src/models/information.model.spec.ts` | `validSocialUrl` cases from the doc |
| `src/i18n/index.ts` | `information.copyLink`, `linkCopied`, `copyLinkFailed` in both `vi` and `en`; no `@ $ \| { }` in them |

`modalSocial` in the model stays unused (the analyst noted the live fields are in the page) — not touched (`SmallestDiff`). `fa-copy` was already registered (`src/plugins/initFontAwesomeIcon.js:41`). Button has no `action` color per Behavior 7a (copy is not in DESIGN.md §5.3).

## Command
- `npx vitest run src/models/information.model.spec.ts`
- `npm run test`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- live check: `npx vite --port 5173 --strictPort` (started by this session, stopped after) + Playwright in an own window on `http://localhost:5173/resume-vuejs-website/#/dashboard/information`, logged in as `qa.full@example.com`

## Output
```
 Test Files  1 passed (1)
      Tests  5 passed (5)
```
```
 Test Files  65 passed (65)
      Tests  421 passed (421)
```
```
✓ built in 4.26s
```
(only the pre-existing chunk-size warning)
```
> resume-vuejs-website@1.43.0 lint
> eslint src --ext .js,.ts,.vue
lint exit 0
```
typecheck: `grep -c "error TS"` → `78` (baseline 78 per doctrine/MEMORY.md); `grep -E "PageInformation|information.model|i18n/index"` → no lines.

Live check, VI (default UI language):
```
{"ghBefore":"https://github.com/example","errorText":["Link không đúng định dạng"],"saveDisabled":true,"reqsAfterInvalid":[],"ftpDisabled":true,"restoredDisabled":false,
 "shownLink":"http://localhost:5173/resume-vuejs-website/#/resume/qa-full-2zd2","clipboard":"http://localhost:5173/resume-vuejs-website/#/resume/qa-full-2zd2","match":true,"toast":"Đã sao chép link",
 "failToast":"Không sao chép được link. Hãy chọn link và sao chép thủ công.","noClipboardToast":"Không sao chép được link","pageErrors":[],"mutatingReqs":[]}
```
- `reqsAfterInvalid`/`mutatingReqs` = every non-GET request to `api/v1/candidate*` while the page was driven (incl. a forced click on Save with `github.com/a`) → none.
- `failToast`: `navigator.clipboard.writeText` replaced by a `NotAllowedError` rejection. `noClipboardToast`: `navigator.clipboard` set to `undefined`. `pageErrors` (Playwright `pageerror`, = uncaught errors) → none.
- GitHub field restored to its stored value before leaving; nothing was saved.

Live check, EN (`localStorage.uiLang='en'` + reload, restored to `vi` after):
```
{"lang":"en","err":["Invalid link format"],"toast":"Link copied","hScroll":false}
```
`hScroll` at 375px viewport. Screenshot (375px, EN): button sits beside the wrapped link, toast "Link copied" — scratchpad `copy-mobile.png` (not kept in repo).

## Acceptance
| Criterion | Evidence |
|---|---|
| (#434) spec covers: empty valid; `https://github.com/a`, `http://a.dev` valid; `github.com/a`, `ftp://a.com`, `javascript:alert(1)`, `abc` invalid with `validation.urlInvalid` | `information.model.spec.ts` `validSocialUrl` block (also `//a.com`, `undefined`, padded `https`); `Tests 5 passed (5)` |
| (#434) live: `github.com/a` → "Invalid link format" / "Link không đúng định dạng" under GitHub, no PATCH | VI `errorText`, EN `err`; `reqsAfterInvalid: []` |
| (#436) Copy → toast "Link copied" / "Đã sao chép link", clipboard == shown link | VI `toast`, `match: true`; EN `toast` |
| (#436) writeText rejects / clipboard undefined → danger toast, no uncaught error | `failToast`, `noClipboardToast`, `pageErrors: []` |
| (#436) new keys in vi + en, build green | `src/i18n/index.ts` diff (3 keys each side); `✓ built in 4.26s` |
| (#436) no link → no button | button inside the existing `v-if="publicLink"` block (code, not live — qa.full has a slug) |
| Pre-existing doc criteria (`information.model.spec.ts`, slug, theme link, clear LinkedIn) | spec passes; slug/link/payload code untouched |
| full suite, lint, typecheck ≤ baseline | 421/421; lint exit 0; 78 / 0 in changed files |
| comments per code-comments.md | 2 one-line why comments (`.url()` scheme gap; missing clipboard lands in catch) |

## Supersedes: none
`grep -n "#434\|#436\|issue-434\|issue-436"` on the active diagram (before adding this row) and the archive → no row.

## Review
`/code-review medium` done inline (4 files, read with callers: `VeeForm.vue` `valid` → schema at :56, Save disabled on `!meta.valid` at :214; `Button.vue` attrs fall through to `<button>`, so `@click` binds). No correctness/security findings. `copyPublicLink` can't run with an empty link (button behind `v-if="publicLink"`). Clipboard text is the app's own computed link, no user HTML.

## Noticed, not done
- Padded input `' https://a.dev '` passes validation (`.trim()`), but VeeForm submits raw values, not the yup cast — the spaces would reach the PATCH. Same as the existing `award.model.ts` link field; not in either issue.
- `modalSocial` in `information.model.ts` is dead code (only a comment in the page references it).

## Seal gate: none (no commit/push; `/ship` is separate)

# 2026-11-21 - issue-427-450-dev-host-pdf-lang
- Worker: implementer · Version: 0.1.0
- Node: `issue-427-450-dev-host-pdf-lang` on `haven/diagrams/dev-loop.prime-mermaid.md`
- Task: "#427 + #450 (branch fix/issue-427-450-dev-host-pdf-lang). #427: \"View API\" / application links ignore a dev server on a port (localhost:5173) — `window.location.host === 'localhost'` (src/pages/_layouts/Header.vue:37, src/pages/dashboard/PageApplication.vue:44) never matches localhost:5173 because host includes the port; in local dev 'View API' opens the production API. Expected: compare window.location.hostname (or use the configured API base) in both places. #450: Per-application PDF: pass the current CV language — the per-application 'Download PDF' link (/dashboard/application) always uses template=ats and never passes lang, so it is always Vietnamese. Expected: add lang from the shared CV language setting (useCvLang)."
- Issues: https://github.com/datvt243/resume-vuejs-website/issues/427 · https://github.com/datvt243/resume-vuejs-website/issues/450

## Branch
`fix/issue-427-450-dev-host-pdf-lang` (cut from synced `staging` via `gh issue develop 427 --base staging`; linked to #427 — #450 must be closed by the commit/PR body too, `/ship` only appends `Closes #427` from the branch name)

## Hub bytes before
100303

## Feature doc
- `doctrine/features/auth-login.md` — Behavior #12: "View API" opens `<API>api/me/<email>`; Open question 6 answered "Bug — #427".
- `doctrine/features/job-applications.md` — Behavior #5 (PDF link); Open questions 2 (#450) and 4 (#427) answered by the operator 2026-11-07 as bugs.

## Feature doc changed
`job-applications.md` Behavior #5: `…download-pdf?template=ats&profile=<id>` → `…download-pdf?template=ats&profile=<id>&lang=<CV language>` (shared CV language setting, `useCvLang`); Changelog row 2026-11-21. Matches the operator's 2026-11-07 answer to open question 2 ("Bug: pass the CV language — #450"). `auth-login.md` unchanged — its Behavior #12 already says `<API>`, which is now exactly what the code does.

## Fix choice for #427
The issue allows "compare `hostname` **or** use the configured API base". I took the configured base (`API` = `import.meta.env.VITE_API_URL`, `src/config/api.config.js`): the axios instance already uses it (`src/services/axios.ts:19` `baseURL: API`), so the links now point at the same API the app actually talks to. A `hostname` check would hard-code `http://localhost:3001/` and be wrong whenever dev points at another API — e.g. this machine's `.env.development.local` sets `VITE_API_URL=https://nodejs-resume-api-ts.onrender.com/` (dev server output below), where the app talks to prod but a hostname check would link to an unstarted localhost:3001. `.env.development` (committed) defaults to `http://localhost:3001/`, so a plain dev checkout still gets localhost.

## Diff
| File | Why |
|---|---|
| `src/pages/_layouts/Header.vue` | `_settings.host: API` (was the `window.location.host === 'localhost'` ternary) — #427 |
| `src/pages/dashboard/PageApplication.vue` | drop `_host` ternary, PDF link uses `API` (#427); import `useCvLang`, append `&lang=${selectedLang.value}` to `pdfLink` (#450). `getProfileLinks` is called from the template, so the link re-renders when the shared language changes |
| `src/pages/dashboard/PageApplication.spec.ts` | existing PDF assertion now expects `&lang=vi` (default); new test: `setLang('en')` → PDF href ends `&lang=en` |
| `doctrine/features/job-applications.md` | see Feature doc changed |
| `haven/diagrams/dev-loop.prime-mermaid.md` | new node row, IN_PROGRESS |

Not mine: `.claude/skills/todo/SKILL.md` shows as modified in `git status` — it was already modified on `staging` before this branch was cut (session-start git status), not touched by this pass; leave it out of this commit.

## Command
From `doctrine/MEMORY.md`, repo root:
- `npm run test`
- `npm run build`
- `npm run lint`
- `npm run typecheck` (Typecheck row: standalone command; baseline 78)

## Output
`npm run test` (tail):
```
 Test Files  61 passed (61)
      Tests  394 passed (394)
   Start at  17:38:23
   Duration  6.77s (transform 2.55s, setup 0ms, collect 12.11s, tests 2.55s, environment 17.94s, prepare 2.82s)
```
`npm run build` (tail):
```
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 3.75s
```
`npm run lint` (tail):
```
> resume-vuejs-website@1.42.0 lint
> eslint src --ext .js,.ts,.vue

lint exit 0
```
`npm run typecheck 2>&1 | grep -c "error TS"` → `78`; `npm run typecheck 2>&1 | grep -E "Header.vue|PageApplication"` → no output (none in touched files).

Coverage: `grep -rn "location.host" src | grep -v "^src/pages/_layouts/Header.vue:43"` → no output, exit 1. The only remaining hit is `Header.vue:43`, inside a commented-out block (`/* const HOST = … */`), not executed.

Dev server (`npm run dev`, started by me, stopped after; base `/resume-vuejs-website/`):
```
src/pages/dashboard/PageApplication.vue 200
src/pages/_layouts/Header.vue 200
lang=${selectedLang.value}
host: API
import.meta.env = {"VITE_API_URL": "https://nodejs-resume-api-ts.onrender.com/", "BASE_URL": "/resume-vuejs-website/", "MODE": "development", "DEV": true, "PROD": false, "SSR": false};export const API = import.meta.env.VITE_API_URL
```
Both changed modules compile and serve on the dev server. No click-through in a browser: no logged-in session was driven. The link values are covered by the page spec.

## Acceptance
| Criterion | Evidence |
|---|---|
| #427: Header "View API" no longer uses the `location.host === 'localhost'` check; uses the configured API base | Diff row Header.vue; dev server serves `host: API`; coverage grep → no executable `location.host` left |
| #427: application PDF link uses the configured API base | Diff row PageApplication.vue (`${API}api/me/…`); spec `toMatch(/api\/me\/dat-vo\/download-pdf\?template=ats&profile=p1&lang=vi$/)` passes in "Tests 394 passed (394)" |
| #450: per-application PDF passes `lang` from `useCvLang` | new spec "passes the shared CV language to the PDF link" (`setLang('en')` → `&lang=en$`) in "394 passed"; dev server serves `lang=${selectedLang.value}` |
| matches `features/job-applications.md` Behavior #5 (as updated) and `features/auth-login.md` Behavior #12 | Behavior #5 now names `&lang=`; #12 says `<API>api/me/<email>` = `${this.host}api/me/…` with `host: API` |
| test/build/lint green, typecheck ≤ baseline, none in touched files | "Tests 394 passed (394)", "✓ built in 3.75s", "lint exit 0", typecheck count 78 (= baseline 78), touched-file grep empty |
| comments per code-comments.md | No comment added or changed. The existing `shortcut:` JSDoc on `getProfileLinks` is still accurate |

## Supersedes
none. `grep -n "427\|450" haven/diagrams/dev-loop.prime-mermaid.md` showed no other row for either issue before this one was added.

## Still open
none

## Review
`/code-review` not run as a skill. Inline pass over the full diff + `getProfileLinks`' only caller (`PageApplication.vue` template l.159-166) + `useCvLang.ts`:
- Reactivity: `selectedLang` is a module-scope `ref`, and `getProfileLinks` is called during render → a language switch re-renders the link. No finding.
- Spec state leak: the new test resets `setLang('vi')` before `expect`, so a failed assertion still leaves the default for later tests. No finding.
- `lang` value is always `vi`|`en` (`resolveCvLang`), so it's safe in a query string unencoded. No finding.
No findings.

## Noticed, not done
- `Header.vue:43-45` keeps a commented-out `HOST`/`API_GET_ME`/`API_DOWNLOAD_PDF` block (still with the old `location.host` check). Commented-out code is in the Delete list in `code-comments.md`, but it's outside these issues. Left as is.
- The per-application PDF still always uses `template=ats` (the issue only asks for `lang`); it also still goes through the public endpoint (#448).

## Seal gate
none — no commit/push/real API call in this pass.

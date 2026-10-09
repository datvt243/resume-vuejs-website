# 2026-10-09 - issue-176-178-sanitize-html

- Worker: implementer
- Version: 0.1.0
- Node: `issue-176-178-sanitize-html` in `haven/diagrams/dev-loop.prime-mermaid.md` (appended at end of PM table)
- Task (verbatim): "#176 + #178: (#176) CvResumeLayout.vue renders CKEditor HTML descriptions (experience/award description, careerGoal, etc.) via {{ }} so public CV /resume/:slug and Preview show raw HTML tags — fix by sanitizing with DOMPurify and rendering with v-html. (#178) Unsanitized v-html in src/components/global/ItemTemplate.vue:66 (item descriptions, partly from LinkedIn import) and src/pages/_layouts/Header.vue:61 (firstName/lastName interpolated into an HTML string rendered via Dropdown.vue v-html) — add dompurify, a shared sanitizeHtml() helper used by both fixes, and render the header name without building HTML from user data. Branch fix/issue-176-178-sanitize-html, base staging."

## Hub bytes before: 169591

(measured after the diagram row was appended; no other hub file touched before measuring)

## Branch
`fix/issue-176-178-sanitize-html` — created off freshly pulled `staging` (`519d4da`) via `gh issue develop 176 --checkout --base staging`. Never on `main`/`staging` while editing.

## Diff
| File | Why |
|---|---|
| `package.json`, `package-lock.json` | add `dompurify@^3.4.16`. Lock also synced its root `version` to `1.14.3` (matches `package.json`, previously stale `1.9.0`) and dropped an unused optional `tailwindcss/node_modules/yaml` entry — npm's own reconciliation. `yarn.lock` was rewritten by npm and **reverted** (`git checkout -- yarn.lock`), per the npm-only rule. |
| `src/utilities/index.ts` | new `sanitizeHtml()` (DOMPurify, default config) and `escapeHtml()` |
| `src/components/cv/CvResumeLayout.vue` | the 3 CKEditor-backed fields (`generalInformation.careerGoal`, `exp.description`, `aw.description`) → `<div v-html="sanitizeHtml(getLocalizedText(...))">` (`<p>`→`<div>` since the content itself contains `<p>`/`<ul>`). Plain-text fields (education/project/certificate description, introduction) untouched — they are textarea input, interpolation stays correct. |
| `src/components/global/ItemTemplate.vue` | `description` computed now wrapped in `sanitizeHtml()` |
| `src/pages/_layouts/Header.vue` | `escapeHtml(fullName)` before interpolating into the HTML string `Dropdown.vue` renders via `v-html` (smallest fix — keeps the existing `<small>`/`<span>` markup and `Dropdown` API unchanged) |
| `src/utilities/index.spec.ts` | 5 tests: sanitize empty/keeps formatting/strips script+onerror+javascript:, escape chars, plain name unchanged |
| `src/components/cv/CvResumeLayout.spec.ts` (new) | regression for #176: HTML rendered as elements, no raw `<p>` text, `<script>` stripped |

## Command
From repo root, per `doctrine/MEMORY.md`:
- `npm run test`
- `npm run build`
- `npm run lint`
- Typecheck: CANNOT RUN (no script; `vue-tsc` incompatible — see MEMORY.md)
- Extra: `npx vitest run src/components/cv` with the `CvResumeLayout.vue` change stashed (prove the new test catches the bug)
- Extra: `npm run dev -- --port 5199` + `curl` of the 4 changed source files

## Output
`npx vitest run src/components/cv src/utilities`:
```
 ✓ src/utilities/index.spec.ts (22 tests) 501ms
 ✓ src/components/cv/CvResumeLayout.spec.ts (2 tests) 354ms
      Tests  24 passed (24)
```
Same spec with the `CvResumeLayout.vue` fix stashed (old code):
```
   × CvResumeLayout > renders CKEditor descriptions as HTML instead of raw tags 338ms
   × CvResumeLayout > strips scripts from descriptions 300ms
      Tests  2 failed (2)
```
`npm run build`:
```
✓ built in 10.53s
```
(only the pre-existing chunk-size advisory)

`npm run lint`: `> eslint src --ext .js,.ts,.vue` → exit 0, no findings.

`npm run test` (full):
```
   × VeeForm > BUG (real, verified — not asserting correctness): typing then clearing a required field does NOT disable submit 1836ms
   × VeeForm > clicking submit on a pristine form calls submitFn anyway, because pristine meta.valid is true 346ms
   × VeeForm > BUG (real, verified): clicking submit after touching+clearing a required field still calls submitFn 1023ms
 Test Files  1 failed | 20 passed (21)
      Tests  3 failed | 141 passed (144)
```
**These 3 failures are NOT from this diff** — evidence:
1. `VeeForm.vue` / `VeeForm.spec.ts` / vee-validate are untouched by this diff.
2. With the whole diff stashed (`git stash`, pure `staging` code), `npx vitest run src/components/veevalidate/VeeForm.spec.ts` → `Tests  3 failed | 8 passed (11)` — same failures.
3. Flaky, not deterministic: repeated runs of that one file on this branch gave `1 failed`, then `2 failed`.
4. `node_modules` matches `staging`'s `package-lock.json` exactly (script comparing every lock entry's version to installed `package.json` → `diffs 0`).
5. Earlier today (22:57, pre-diff, before `npm install`) the same suite was `137 passed (137)`. The difference is machine load: `uptime` load averages 15–20 during these runs (a game + a hung `npm install` were running) — the 3 tests rely on `flushPromises()` timing around vee-validate's async validation.

Dev server (`vite --port 5199`): `CvResumeLayout.vue 200`, `ItemTemplate.vue 200`, `Header.vue 200`, `utilities/index.ts 200` — all transformed, each contains the new helper references. No live authenticated browser check this session (machine under heavy load, no logged-in debug tab) — the rendered-DOM check is the `CvResumeLayout.spec.ts` mount test instead, disclosed not implied.

## Acceptance
| Criterion | Evidence |
|---|---|
| #176: CKEditor HTML on public CV/Preview renders as formatted HTML, not raw tags | `CvResumeLayout.spec.ts` "renders CKEditor descriptions as HTML…" passes; fails on old code (`× … 338ms`) |
| #176/#178: HTML sanitized before `v-html` | `sanitizeHtml` tests (script, `onerror`, `javascript:` stripped) pass; `CvResumeLayout.spec.ts` "strips scripts" passes |
| #178: `ItemTemplate.vue` v-html sanitized | `description` computed = `sanitizeHtml(getLocalizedText(...))` (diff); covered by helper tests |
| #178: Header name not injected as HTML | `escapeHtml(fullName)`; `escapeHtml` test turns `<img … onerror=…>` into entities |
| One shared helper used by both fixes | `sanitizeHtml` exported from `src/utilities/index.ts`, imported by `CvResumeLayout.vue` and `ItemTemplate.vue` |
| Build green | `✓ built in 10.53s` |
| Lint clean | exit 0 |
| Tests | all new/affected specs green (`24 passed (24)`); full suite `141 passed`, 3 pre-existing flaky `VeeForm` failures proven independent of the diff (see Output) |
| comments per code-comments.md | added: JSDoc on exported `sanitizeHtml` (WHY: token readability → XSS impact) and `escapeHtml`; one `//` in `Header.vue` (WHY: Dropdown uses v-html, name is user data). No issue refs, no history narration. |

## Noticed, not done
- `VeeForm.spec.ts` — 3 tests are timing-flaky under load (`flushPromises()` around vee-validate async validation). Should await `vi.waitFor`/explicit validate instead. Separate node.
- `Dropdown.vue:78` still renders `props.text` via `v-html`; only caller (`Header.vue`) now escapes user data, but the API itself stays HTML-accepting. Could switch to a slot later.
- `npm install dompurify` hung for ~20 minutes after writing `package.json`/lock/`node_modules` (likely network/audit step under load); killed by me, integrity confirmed by the lock-vs-installed comparison above.

## Seal gate
none — no commit/push/merge in this pass. Commit + PR into `staging` is `/ship`'s step.

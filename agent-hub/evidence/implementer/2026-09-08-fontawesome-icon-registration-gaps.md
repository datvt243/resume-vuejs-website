# 2026-09-08 — fontawesome-icon-registration-gaps

- Worker: implementer
- Version: 0.1.0
- Node: `fontawesome-icon-registration-gaps`
- Task (verbatim, operator-directed): "Fix missing FontAwesome icon
  registrations: fa-copy (used in 6 files since issue #60) and fa-camera
  (used in PageInformation.vue since issue #58) are not registered in
  src/plugins/initFontAwesomeIcon.js, causing invisible icons + console
  errors in production. Same bug class as the fa-grip-vertical issue
  just fixed for issue #57." — recommended as a follow-up by
  `issue-57-manual-reorder`'s verifier pass.

## Hub bytes before: 101241

## Branch
`fix/fontawesome-icon-registration-gaps`, checked out from `staging`
before any file was touched.

## Fix
Added `faCopy` and `faCamera` to both the import list and `library.add(...)`
call in `src/plugins/initFontAwesomeIcon.js` — same 2-line-per-icon
pattern every other icon in that file already follows (and the same fix
shape as `faGripVertical` in `issue-57`).

## Regression guard — the real point of this node
A 2-line fix alone doesn't prevent a 4th instance of this exact bug
class from shipping again (3 times now: `fa-camera`/issue #58,
`fa-copy`/issue #60, `fa-grip-vertical`/issue #57). Added
`src/plugins/initFontAwesomeIcon.spec.ts`: walks every `.vue` file under
`src/`, regex-extracts every `icon="..."` attribute value (handles both
the 2-part form `"fa-solid fa-x"` used directly on `<FontAwesomeIcon>`,
and the 1-part form `"fa-x"` used on this codebase's own `Button.vue`/
`ItemTemplate.vue` wrappers, which always prefix with `fa-solid`
internally), normalizes each to its FontAwesome registry key, and
asserts every single one resolves against the REAL registered
`library.definitions.fas` object (populated by actually running
`initFontAwesomeIcon.install(...)`, not a hand-maintained duplicate
list that could itself drift).

**Proved this test isn't a rubber stamp, not just asserted it:**
temporarily removed `faCopy` from the file (`sed`), re-ran the test —
failed, correctly listing all 6 files using `fa-copy`
(`PageAward.vue`, `PageCertificate.vue`, `PageReference.vue`,
`EducationItem.vue`, `ExperienceItem.vue`, `ProjectItem.vue`). Restored
the file, re-ran — passed again. This is real, demonstrated fault
detection, not a description of what the test is supposed to do.

## Diff
| File | Why |
|---|---|
| `src/plugins/initFontAwesomeIcon.js` | Registered `faCopy` + `faCamera` (4 lines total, 2 icons × import + `library.add`). |
| `src/plugins/initFontAwesomeIcon.spec.ts` (new) | Regression guard — scans every real icon usage in `src/`, asserts each resolves. Empirically proven to catch a real removed registration (see above). |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | New PM status row, `IN_PROGRESS`. |

No other file touched — this node does not re-fix `faGripVertical`
(already fixed and SEALED under `issue-57-manual-reorder`), only the
2 newly-disclosed gaps plus the regression guard.

## Command
`npm run build` (repo root, exact command from `doctrine/MEMORY.md`)

## Output
```
dist/assets/index-DLGrmW_J.js                     350.18 kB │ gzip: 121.26 kB
dist/assets/VeeForm-DDfxV5ev.js                   954.96 kB │ gzip: 270.19 kB
...
✓ built in 5.57s
```
Same pre-existing >500kB chunk warning as every prior SEAL.

```
npm run lint
> resume-vuejs-website@1.8.0 lint
> eslint src --ext .js,.ts,.vue
(no output, exit 0)
```
One real finding caught + fixed during this pass: the new spec file
used `__dirname`, which doesn't exist in this project's ESM `src/`
context (only works in `vitest.config.ts` at repo root via Node's CJS
config-loading shim) — `no-undef` lint error. Fixed with the standard
ESM equivalent (`path.dirname(fileURLToPath(import.meta.url))`).
Re-ran lint clean after.

```
npm run test -- --run
 Test Files  1 failed | 12 passed (13)
      Tests  3 failed | 89 passed (92)
```
1 new test file, 1 new test, passing. The 3 failures are the same
pre-existing `VeeForm.spec.ts` cases established as unrelated across
every SEAL this session — `git diff staging --stat -- src/components/
veevalidate/` is empty on this branch, confirming zero changes there.

## Manual verification (per `implement.md` step 7)
Same disclosed limitation as recent sessions: no authenticated login
possible (no test credentials). This node is a pure logic/registration
fix though, not new UI — the regression test itself (empirically proven
above to catch a real fault) is stronger evidence for THIS diff's
correctness than a visual click-through would have been. Also confirmed
via `npm run dev` + curl that `initFontAwesomeIcon.js` compiles cleanly
and both new icons are present in the served module.

## Acceptance
| Criterion | Evidence |
|---|---|
| Node on diagram before code | `fontawesome-icon-registration-gaps` row added, `IN_PROGRESS`, before `initFontAwesomeIcon.js` was touched |
| Branch dedicated, branched before code | `git branch --show-current` → `fix/fontawesome-icon-registration-gaps` |
| Both disclosed gaps fixed | `faCopy`/`faCamera` added, same pattern as every other icon in the file |
| Regression guard genuinely catches faults, not just described as doing so | `sed`-removed `faCopy`, test failed correctly (all 6 files listed), restored, test passed again |
| Build green | `✓ built in 5.57s` |
| Lint clean | exit 0, no output (1 real ESM finding caught + fixed) |
| No test regressions | 89/92 pass, 3 pre-existing unrelated failures, 1 new test passing |

## Noticed, not done
Nothing further noticed — this was a targeted, disclosed follow-up with
a known, bounded scope.

## Seal gate
No outward-facing action taken in this pass (no commit, no push, no
merge). Merging this branch into `staging` is a separate `/ship` step,
pending operator approval.

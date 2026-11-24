# 2026-11-23 — issue-408-452-download-overlay-menu
Worker: implementer · Version: 0.1.0 · Node: `haven/diagrams/dev-loop.prime-mermaid.md` → `issue-408-452-download-overlay-menu` (sealed_pending_verifier)
Branch: `feature/issue-408-452-download-overlay-menu` (off `staging` @ e693f73 after fetch+pull, linked to #408 via `gh issue develop`; #452 named in the branch — `gh issue develop` links one issue only)
Task: /todo #452 and #408 — #408 "Download PDF: full-page status overlay, block route changes until the download finishes" · #452 "Small screens: add Download CV to the account menu".

## Hub bytes before: 100367
(measured with the evidence/README.md command after the analyst pass, before the diagram row was added)

## Feature doc
`doctrine/features/cv-preview-export.md` Behavior #10–#17 + the (#408)/(#452) acceptance criteria and edge cases. Analyst spec: `evidence/analyst/2026-11-23/cv-preview-export-408-452-spec.md` (spec_ready round 2; operator answered Q7–Q10 on 2026-11-23: DESIGN.md exception yes · success silent · menu item below `sm` only · cancel silent). Feature doc changed by implementer: no.

## Diff
| File | Why |
|---|---|
| `src/composables/useDownloadCv.ts` | module-level shared state: `downloadStatus` (`idle`/`generating`/`downloading`), exported `isDownloading` computed and `cancelDownload()`; one `AbortController` per download, `signal` + `onDownloadProgress` passed to `instanceAxios.get`; `beforeunload` listener added on start, removed in `finally`; aborted → no file, no toast. `onDownloadProgress` only moves `generating → downloading` (see Live bug below). |
| `src/components/DownloadOverlay.vue` (new) | full-page dialog (`role=dialog`, `aria-modal`, `aria-labelledby`, `aria-describedby` → status `<p aria-live="polite">`), Cancel focused on open, Esc cancels, Tab kept on Cancel, `tabindex=-1` root; focus returns to the trigger (menu item → menu trigger fallback only when the trigger was in `.user-menu`). Router `beforeEach` guard: no download or signed out → pass; else `confirmDiscardChanges({ title: download.leaveTitle, confirmText: download.leave })` → Stay cancels navigation, Leave aborts + navigates; a download that ends while the prompt is open closes it (`Swal.close()`) and the navigation goes through. z-index 1050 so Swal (1060) sits above it. |
| `src/App.vue` | mounts `<DownloadOverlay />`; app `inert` while `isDownloading` (same as cold start) |
| `src/pages/_layouts/Header.vue` | account-menu item "Tải CV" in `li(class="sm:hidden")`, same `download({ lang: selectedLang })` call as the header button (Classic) |
| `src/lib/swal.lib.js` | `confirmDiscardChanges` takes optional `{ title, confirmText }` (defaults unchanged; only other caller `Modal.vue:94` calls it with no args) |
| `src/i18n/index.ts` | new `download.{title,generating,downloading,leaveTitle,leave}` in vi (line 100) and en (line 647); reused `common.cancel`, `confirm.stay`, `header.downloadCv` |
| `DESIGN.md` §5.9 | second "Exception" bullet: the CV PDF download overlay |
| `src/composables/useDownloadCv.spec.ts` | +4 cases: shared state + generating→downloading→idle + unload guard + trailing progress event after settle; failure removes unload guard; cancel aborts signal, no file even when response resolves after, no toast; cancel that rejects → no toast. First case's exact-args assertion → `objectContaining` (signal/onDownloadProgress added). |
| `src/components/DownloadOverlay.spec.ts` (new) | 5 cases: no download → no prompt; dialog + Cancel focused + aria-live text, Stay keeps route & download, Esc aborts; Leave aborts + navigates; download ending under the prompt → `Swal.close` + navigation proceeds; forced logout → no prompt, request not aborted by the guard |

## Command
From repo root (doctrine/MEMORY.md): `npm run test` · `npm run lint` · `npm run build` · `npm run typecheck`; plus `npx vitest run <files>`.

## Output (final run, after review fixes)
```
 Test Files  66 passed (66)
      Tests  456 passed (456)
LINT_EXIT=0
✓ built in 3.83s
TC_EXIT=2
79   <- first run: 1 new error src/components/DownloadOverlay.spec.ts(49,12): TS2532 Object is possibly 'undefined'
```
Fixed (`mock.calls.at(-1)?.[1]`), then:
```
78            <- npm run typecheck | grep -c "error TS"  (baseline 78)
      Tests  5 passed (5)   <- npx vitest run src/components/DownloadOverlay.spec.ts
LINT_OK       <- npx eslint src/components/DownloadOverlay.spec.ts
```
Touched-file filter on the 78: `grep -E "useDownloadCv|DownloadOverlay|Header.vue|App.vue|swal.lib|i18n/index"` → 0 after the fix.
Regression proof for the progress fix: with the `if (downloadStatus.value === 'generating')` guard removed → `Failed Tests 3` (`expected true to be false`); restored → `Tests 15 passed (15)`.

## Live check (Playwright over CDP, own Chrome profile on :9888, Vite on :5173 started by me, prod API, QA account `qa.full@example.com`)
Live bug found and fixed: axios throttles `onDownloadProgress` and fires a trailing event after the request settles → status flipped back to `downloading` after `finally`, overlay stuck forever (observed: `{"s":"none","t":9376},{"s":"Đang tải xuống…","t":9515}`, overlay up >90s, abort a no-op). Fix + spec case above.

After the fix (1440px):
```
header success: st [Đang tạo PDF… @38ms, Đang tải xuống… @9456ms, none @9694ms], dl ["Nguyen_Van_Full_Cong_nghe_Thong_tin_CV_VI.pdf"], toast null, focus back on BUTTON "Tải CV"
cancel button:  activeElement on open "Hủy"; st [Đang tạo PDF…, none @463ms]; 12s later dl [], toast null
Esc:            st [Đang tạo PDF…, none @435ms]; 12s later dl [], toast null
Home overlay:   {"role":"dialog","modal":"true","active":"Hủy"}, aria-live "polite", .clearfix inert true
Back, no download: no swal, route changes
Back during download (history entries made via sidebar RouterLinks): swal "CV đang được tải. Rời trang và hủy tải?" [Ở lại | Rời trang]
  Stay → url "/" (restored), view "Tổng quan", overlay still up; later done → url "/"
  Leave → url "/dashboard/information", overlay gone, dl [], toast null, requestfailed ["net::ERR_ABORTED"]
ATS page: "Tải CV mẫu này" → overlay; request "template=ats"
375px: account menu item visible, header button hidden; click → request "(no params)", overlay up, menu closed; after Esc focus on the .user-menu [aria-haspopup] trigger
640px: menu item not visible, header button visible
After review fixes: Tab×2 → still "Hủy"; backdrop click then Esc → overlay closed; prompt left open until the download ended → swal closed by itself, navigation went through (url "/dashboard/information")
```
Test artefact, not a bug: switching pages with `location.hash = …` leaves no vue-router `history.state.position`, so a cancelled Back can't restore the URL (seen once: url `/dashboard/information` with Home view). Re-run with RouterLink navigation restored the URL correctly (above).
`beforeunload`: one Playwright `goBack` past the app's first entry during a download raised Chrome's native "beforeunload" dialog (dismissed). A scripted `location.reload()` raised none (Chrome needs a user gesture) — the listener add/remove is covered by the spec (`defaultPrevented`).
Vite and Chrome stopped afterwards (`lsof :5173` → 0, `:9888` → 0).

## DESIGN.md §10
- Tokens grep on added lines (`#hex|[N px/rem]|opacity-N`) → only `#408`/`#452` text hits from issue refs, since removed; overlay uses `bg-black/50` (same as Spinner cold start), `z-[1050]` (no unit, layer below Swal).
- Screenshots (reviewed): `evidence/implementer/2026-11-23/issue-408-452-shots/` — `1440-light-overlay.png`, `1440-dark-overlay.png`, `1440-dark-leave-confirm.png`, `375-dark-account-menu.png`, `375-dark-overlay.png`. 375 card box left 16 / right 359, `scrollWidth` 375 (no overflow).
- Keyboard: Cancel focused on open, Tab stays on it, Esc cancels; menu item reachable in the open dropdown.
- States: generating / downloading / success / error (toast) / cancel covered; long text n/a (fixed strings).
- web-design-guidelines pass: not run (skipped, the review below covered a11y of the dialog).

## Review (`/code-review medium`, background fork)
| # | Finding | Action |
|---|---|---|
| 1 | guard doesn't recheck after prompt; stale prompt when download ends | fixed: `if (!leave && isDownloading.value) return false`; watcher `Swal.close()` when idle under the prompt; spec case |
| 2 | focus restore steals focus from an open Swal | fixed: watcher returns early while the prompt is open |
| 3 | menu-trigger fallback fires for any trigger | fixed: only when `returnFocusTo.closest('.user-menu')` |
| 4 | no focus trap; Esc only works with focus inside | fixed: `@keydown.tab.prevent` (Cancel is the only focusable), root `tabindex=-1` (live-verified) |
| 5 | aria-live region mounted with its text → first status not announced | fixed: `aria-describedby` → status, announced with the dialog on focus |
| 6 | template `t()` vs `$t` convention | false positive once the component has a spec — CLAUDE.md: "components mounted in specs → `import { t }`" (`$t` fails under the spec mount: `_ctx.$t is not a function`) |
| 7 | overlay calls `useDownloadCv()` only for state | fixed: exports `downloadStatus`, overlay imports state directly; composable no longer returns `status` |
| 8 | `if (signal.aborted) return` rarely reachable | kept: acceptance criterion "no file even when the mocked response resolves after" depends on it; cheap |
| 9 | `:disabled`/`aria-busy` on entry buttons now dead under the inert overlay | new menu item: dropped `:disabled`; existing buttons → `## Noticed, not done` |
| 10 | leave guard untested | fixed: `DownloadOverlay.spec.ts` (5 cases) |

## Acceptance
| Criterion | Evidence |
|---|---|
| `useDownloadCv.spec.ts` passes (withLangSuffix, name, params) + (#408) success generating→downloading→idle, failure toast, success no toast, cancel aborts signal + no file + no toast, two instances share `isDownloading`, `beforeunload` defaultPrevented during / not after success/error/cancel | `Tests 15 passed (15)`; cases "shares one state…", "removes the unload guard after a failure", "cancel aborts the request…", "cancel that rejects…", existing "shows an error toast…" |
| PagePreview / useCvTheme / useCvLang / useActiveProfile / jsonResume specs pass | part of `npm run test` → `66 passed / 456 passed` |
| (#408) Live: overlay dialog + aria-modal + Cancel focused + aria-live polite from Home, header, ATS | Live check: Home overlay, header success, ATS overlay |
| (#408) Live: Back → Swal; Stay keeps URL + overlay; Leave → route changes, request canceled, no file, no toast; no download → no prompt | Live check: Back rows, `net::ERR_ABORTED` |
| (#408) Live: Cancel → overlay gone, canceled, no file, no toast; success → overlay gone, file saved, no toast | Live check: cancel button / Esc / header success |
| (#452) Live 375px: menu item → request with no `template`, overlay; ≥640px no menu item, header button shown | Live check: 375px / 640px rows |
| i18n keys in vi + en; lint + build pass | `src/i18n/index.ts:100` (vi) and `:647` (en) same 5 keys; `LINT_EXIT=0`, `✓ built` |
| DESIGN.md lists the download overlay as an allowed blocking overlay | DESIGN.md §5.9 new "Exception: CV PDF download (`DownloadOverlay.vue`)…" bullet |
| Typecheck ≤ baseline, none in touched files | 78, 0 in touched files (after fixing the 1 spec error) |
| comments per code-comments.md | added comments are WHY-only, no `(#N)` refs (removed from useDownloadCv.ts / swal.lib.js / Header.vue / DownloadOverlay.vue after self-check): shared-state note, trailing-progress note, 401-retry-carries-signal JSDoc line, forced-logout guard note, prompt-close note, menu-trigger fallback, Tab/tabindex template comment, `title`/`confirmText` reuse note, `sm:hidden` pug note, spec `attachTo` note |

## Supersedes: none
(`grep -n "408\|452" haven/diagrams/dev-loop.prime-mermaid.md` → no other row)

## Noticed, not done
- `:disabled`/`:aria-busy`/spinner bindings on the Header, PageHome and PageAtsCheck download buttons can no longer be seen while the app is inert under the overlay — harmless, left to keep the diff small.
- `.claude/skills/todo/SKILL.md` has an uncommitted change that predates this task (in `git status` at session start) — not part of this node; `/ship` should leave it out unless the operator says otherwise.
- `npm run test` doesn't run in CI yet (doctrine/MEMORY.md known gap).

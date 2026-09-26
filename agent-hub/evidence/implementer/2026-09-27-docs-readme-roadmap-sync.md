# 2026-09-27 - docs-readme-roadmap-sync

- Worker: implementer
- Version: 0.1.0
- Node: `docs-readme-roadmap-sync` (new node — no prior node covers README's Known Issues/Roadmap sections specifically; closest precedent is the SEALED `docs-known-bugs-table-sync`/`docs-readme-issue7-close-sync` nodes, same class of task)
- Task (verbatim, operator): "update README.md's roadmap to match" — following up on the just-published wiki `Roadmap.md` page (this session, `2026-09-27`), whose accurate-from-GitHub-issue-state version the operator explicitly chose over mirroring the stale README checklist.

## Hub bytes before: 147702

## Branch
`docs/readme-roadmap-sync`, cut from `staging` (`git checkout staging && git pull --ff-only && git checkout -b docs/readme-roadmap-sync`). A pre-existing uncommitted diff on `main` (this session's earlier `issue-120` recheck agent-hub bookkeeping — evidence note + diagram row, no `src/` code) was stashed first (`git stash push -u -m "main: uncommitted issue-120 recheck agent-hub bookkeeping (pre docs/readme-roadmap-sync)"`) so it wouldn't carry onto this branch or get committed here, matching the isolation technique used by the `issue-119-cv-theme-templates` node. That stash is restored onto `main` after this task, untouched.

## Diff
| File | Why |
|---|---|
| `README.md` | `## Known Issues` section: removed the stale entry for issue #8 (JWT/localStorage) — confirmed CLOSED on GitHub (`gh issue view 8` → CLOSED, closed 2026-09-24), fixed by the httpOnly-cookie migration now itself in the Roadmap's shipped list. Table replaced with a short note that no bug/tech-debt issue is currently open. `## Roadmap` section: marked #55, #56, #57, #58, #59, #60, #61, #63 as done (`[x]`) — all confirmed CLOSED via `gh issue view`, were previously shown unchecked. Added `[x]` rows for #62 (dark mode, already shipped, was missing from the list entirely), #117, #119, #121, #123, #118, #8, #116 (all CLOSED, shipped since the README was last touched, none previously listed). Added `[ ]` rows for the 2 genuinely open issues, #120 and #122, replacing the old stale `[ ]` rows. Added a pointer to the wiki's `Roadmap.md` page as the always-current source, since a static README checklist will drift again. |

## Command
```
npm run build
```
Run from repo root, exactly as in `doctrine/MEMORY.md`.

## Output
```
dist/assets/PageApplication-__IgSt5R.js             5.08 kB │ gzip:   2.24 kB
dist/assets/TableDefault-CacIIo-t.js                5.18 kB │ gzip:   2.03 kB
dist/assets/PageEducation-DvqL3mXm.js               5.45 kB │ gzip:   2.57 kB
dist/assets/PageProject-DYd0MUyI.js                 5.98 kB │ gzip:   2.76 kB
dist/assets/PageExperience-fBoM1b_G.js              6.07 kB │ gzip:   2.75 kB
dist/assets/PageProfile-DUrjYmBP.js                 6.46 kB │ gzip:   2.98 kB
dist/assets/CvResumeLayout-3hFuKg_X.js              6.86 kB │ gzip:   2.11 kB
dist/assets/PageHome-BPPkbLJ2.js                    7.12 kB │ gzip:   3.29 kB
dist/assets/PageGeneralInformation-1zqPRSLf.js      8.69 kB │ gzip:   3.61 kB
dist/assets/PageInformation-D7jZ3R6-.js            31.15 kB │ gzip:  12.66 kB
dist/assets/index.esm-B1zl171F.js                  42.53 kB │ gzip:  13.42 kB
dist/assets/swal.lib-CsHxP0jm.js                   42.65 kB │ gzip:  13.92 kB
dist/assets/index-BFdV1mQR.js                     270.96 kB │ gzip:  96.99 kB
dist/assets/VeeForm-CrTFThF0.js                   955.01 kB │ gzip: 270.19 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 3.87s
```
Same pre-existing chunk-size advisory as every other recent SEALED node — not a regression, and expected: a README-only diff can't change bundle output at all.

## Acceptance
| Criterion | Evidence |
|---|---|
| Every checklist item's state verified against real GitHub state, not assumed from the old README | `gh issue view <n> --json number,title,state` run individually for #8, #55–63, #116–123, #120, #122 (see conversation-level tool output this session) |
| Build still green after a docs-only change | `✓ built in 3.87s` above, no new warning |
| Diff scoped to only the 2 stale sections, no opportunistic rewrite of the rest of README | `git diff staging -- README.md` touches only `## Known Issues` and `## Roadmap` (see below) |
| Wiki and README now agree on Roadmap content | Cross-checked against `Roadmap.md` pushed to the GitHub wiki this same session |

```
$ git diff staging --stat -- README.md
 README.md | 33 +++++++++++++++++----------------
 1 file changed, 17 insertions(+), 16 deletions(-)
```

## Noticed, not done
- Nothing new outside this node's own scope.

## Seal gate
Outward-facing action pending: merging `docs/readme-roadmap-sync` into `staging` via `/ship` (PR + merge) — not yet done, waiting for operator approval per the seal gate. This note covers the diff + build verification only.

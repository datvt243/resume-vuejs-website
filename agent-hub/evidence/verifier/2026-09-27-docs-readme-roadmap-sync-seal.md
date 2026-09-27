# 2026-09-27 — docs-readme-roadmap-sync — SEAL

- Worker: verifier
- Node: `docs-readme-roadmap-sync`
- New PM status: SEALED

## Isolation proof
Spawned as the dedicated `verifier` worker for this hub, cold session:
loaded `haven/workers/verifier/manifest.yaml`, `SOUL.md`,
`doctrine/MEMORY.md`, and `recipes/verify_seal.md` from scratch, with no
memory of the implementer session that wrote
`evidence/implementer/2026-09-27-docs-readme-roadmap-sync.md` (that note
was written at commit `74b2ba8`, an entirely separate session; this
session did not touch `README.md`, the evidence note, or the diagram row
before this verify pass). `NeverVerifyOwnWork` satisfied by construction.

## Reasoning
Per `EvidenceOnly`, the note itself
(`evidence/implementer/2026-09-27-docs-readme-roadmap-sync.md`, present
on `staging`/the PR, not yet on `main`'s working tree since `/release`
hasn't run) was read first, not the diff. All 6 points then
independently re-derived:

1. **Branch / `NoMainEdit`**: note claims branch `docs/readme-roadmap-sync`
   cut from `staging`, merged via PR into `staging`
   (merge commit `1226a80f3c4a5d233e93fe1148f0e007cb0d08d9`). Confirmed
   independently: `gh pr view 153 --json title,state,mergeCommit,baseRefName,headRefName`
   → `{"baseRefName":"staging","headRefName":"docs/readme-roadmap-sync","mergeCommit":{"oid":"1226a80f3c4a5d233e93fe1148f0e007cb0d08d9"},"state":"MERGED", ...}`
   — branch name, base, and merge commit all match the note exactly, and
   the branch is a dedicated non-`main`/non-`staging` branch (`MAIN_EDIT`
   clear). `git log --all --oneline | grep readme-roadmap` also confirms
   `1226a80 Merge pull request #153 from datvt243/docs/readme-roadmap-sync`
   in real repo history, and `git branch -a --contains 74b2ba8` (the
   implementer's commit) → only `staging`/`remotes/origin/staging`, i.e.
   it reached `staging` through this exact merge, not a direct commit.

2. **Spot-checked issue states (closed)**: ran `gh issue view <n> --json state -q .state`
   independently for 5 of the note's claimed-closed issues:
   `#8` → `CLOSED`, `#55` → `CLOSED`, `#116` → `CLOSED`, `#118` → `CLOSED`,
   `#121` → `CLOSED`. All 5 match the note's claim; none trusted from the
   note's own citation.

3. **Remaining open items**: `gh issue view 120 --json state -q .state` →
   `OPEN`; `gh issue view 122 --json state -q .state` → `OPEN`. Both match
   the note's claim that these 2 stay unchecked.

4. **Diff scope (`SmallestDiff`)**: `git show 1226a80 --stat` →
   ```
   README.md                                          | 38 +++++++-----
   .../2026-09-27-docs-readme-roadmap-sync.md         | 67 ++++++++++++++++++++++
   agent-hub/haven/diagrams/dev-loop.prime-mermaid.md |  2 +
   3 files changed, 94 insertions(+), 13 deletions(-)
   ```
   Exactly 3 files: `README.md`, the implementer's own evidence note, and
   the diagram row — no `src/`, no config, no unrelated file. No
   opportunistic scope creep.

5. **Build green**: re-ran independently in an isolated `git worktree`
   checked out at the merged commit `1226a80` (not the implementer's own
   claim), using the main checkout's already-installed `node_modules`
   (symlinked in — a docs-only diff cannot touch `package.json`/
   `package-lock.json`, confirmed by the `--stat` above showing neither
   file touched, so a fresh `npm ci` added no verification value over a
   reused `node_modules`). `npm run build` output: `✓ built in 15m 2s`,
   exit code 0, same single pre-existing "(!) Some chunks are larger than
   500 kB" advisory as the note's own run, same asset chunk list (several
   asset hashes identical to the note's `✓ built in 3.87s` run, e.g.
   `dist/assets/PageApplication-__IgSt5R.js` at the same 5.08 kB / gzip
   2.24 kB in both) — no red, no new warning. The absolute wall-clock time
   differs a lot (15m2s vs 3.87s) but that's filesystem/cold-cache
   overhead from the ad-hoc worktree, not a build regression — consistent
   with this task's own guidance that exact timing may differ.

6. **Diagram row append (`AppendOnly`)**: `git diff 18127f9 1226a80 -- agent-hub/haven/diagrams/dev-loop.prime-mermaid.md`
   shows a single hunk `@@ -217,5 +217,7 @@` — pure addition of 2 new
   lines at the very end of the file (line 220 of 223 total at that
   commit), immediately after the prior last row
   (`issue-116-multi-profile-frontend`) and before the closing
   "Any regression must be a **new node**" sentence. No existing line
   changed or removed — confirmed append, not a mid-table insert.

**Note file location caveat (not a defect)**: the evidence note and the
staging-side diagram row don't exist on `main`'s current working tree
(only on `staging`, since `/release` hasn't happened yet) — this is
expected given the 2-tier branch model, not `NO_EVIDENCE`; the note's
content was read via `git show 74b2ba8:...` from the merged history,
which is the note, not the diff.

## Missing
None — every acceptance criterion in the implementer's note has citable,
independently-re-derived evidence above.

## Re-run
`partial` — re-ran `npm run build` from scratch in an isolated worktree
at the merged commit (outward-facing-adjacent: this diff has already
been merged into `staging`, a higher-risk class than an ordinary
in-flight node per "Re-run scope"), reusing the existing `node_modules`
rather than a fresh `npm ci` since the diff provably never touches
`package.json`/`package-lock.json` (confirmed under point 4). Did not
re-run `npm run lint`/`npm run test` — the note only claims a build
result and `doctrine/MEMORY.md` treats build-only as sufficient for a
non-`src/` diff.

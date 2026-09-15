# 2026-09-16 — fix-header-dropdown-outline-theme — SEAL

- Worker: verifier
- Node: `fix-header-dropdown-outline-theme`
- New PM status: SEALED (updated in place on
  `haven/diagrams/dev-loop.prime-mermaid.md`, row for this node — status
  column changed IN_PROGRESS → SEALED, findings appended to the END of
  the row's existing text, no reordering, per `AppendOnly`)

## Isolation proof
Spawned as a fresh subagent via `/worker verifier
"agent-hub/evidence/implementer/2026-09-16-fix-header-dropdown-outline-theme.md"`,
launched from a separate coordinating session that explicitly stated it
never touched the diff under review. This session's first actions were
loading `manifest.yaml`/`SOUL.md`/`recipes/verify_seal.md` fresh, then
reading the implementer's evidence note before touching any diff or
source file. Wrote no part of the diff under review. `NeverVerifyOwnWork`
satisfied.

## Reasoning
Read the implementer's note FIRST (`EvidenceOnly`), then independently
re-derived every claim against the real repo state:

1. **Branch**: `git branch --show-current` → `fix/header-dropdown-outline-theme`
   — not `main`/`staging`. `git stash list` shows the 4 other unrelated
   session branches' stashes present and untouched. `NoMainEdit`
   satisfied.
2. **Diff, read directly**: `git diff origin/staging -- src/pages/_layouts/Header.vue`
   → `1 file changed, 1 insertion(+), 1 deletion(-)`, exactly:
   `-Dropdown(:text="mesUser" :style="'outline-light'" split is-sm)` /
   `+Dropdown(:text="mesUser" :style="theme === 'dark' ? 'outline-light' : 'outline-dark'" split is-sm)`
   at line 102 — matches the note verbatim.
3. **`theme` not newly added**: read `Header.vue`'s `<script setup>` —
   `const { theme, toggleTheme } = useTheme()` at line 22, already
   present pre-diff (confirmed via the diff itself only touching line
   102), already used for the theme-toggle icon. Matches the note's
   claim it's reused, not new state.
4. **Root-cause CSS claims**, read `src/styles/tailwind.css` directly:
   `.btn-outline-light` (lines 331-335): `color/border-color:
   var(--bs-light)`. `.btn-outline-dark` (lines 340-344):
   `color/border-color: var(--bs-dark)`. Root-token block: `--bs-light:
   #f8f9fa` declared exactly once (line 48, under the combined
   `:root,[data-bs-theme='light']` block, never redefined under
   `[data-bs-theme='dark']`) — theme-invariant, matches the note.
   `--bs-tertiary-bg` declared twice: `#f8f9fa` (line 54, light) and
   `#2b3035` (line 71, `[data-bs-theme='dark']`) — theme-reactive,
   matches the note. `.bg-body-tertiary` (lines 991-993) uses
   `var(--bs-tertiary-bg)`.
   One nuance the note didn't flag: lines 936-969 carry an older comment
   calling this exact `.bg-body-tertiary` rule (and several neighbors)
   "DELIBERATELY DORMANT" because Bootstrap's own compiled CSS used to
   win the cascade via `!important` under the former dual-framework
   setup. Checked whether that's still true: `grep -n bootstrap
   package.json` → no match; `src/main.ts` itself states "`bootstrap.scss`
   and the `bootstrap` npm package are gone" (node
   `tailwindcss-bootstrap-removal`, already SEALED per
   `2026-09-14-tailwindcss-bootstrap-removal-seal.md`). So Bootstrap's
   competing rule no longer exists — this custom `.bg-body-tertiary` rule
   IS live today, exactly as the note assumes; the "dormant" comment is
   stale pre-removal documentation, not a defect in this diff. Doesn't
   change the verdict.
5. **`npm run build`**, re-ran myself: `✓ built in 3.22s`, only the
   pre-existing "chunks are larger than 500 kB" advisory — matches.
6. **`npm run lint`**, re-ran myself: exit clean, no output beyond the
   npm command header — matches.
7. **`npm run test`**, re-ran myself: `Test Files 16 passed (16)`,
   `Tests 111 passed (111)`, including `VeeForm.spec.ts` 11/11 — clean on
   this run, no flake surfaced. Consistent with the note's disclosure
   that the `VeeForm.spec.ts` flake is isolated/pre-existing and unrelated
   to `Header.vue`.
8. **Live CDP reproduction**, independent of the note's own numbers:
   `curl localhost:9888/json/version` confirmed the operator's real
   debug Chrome session still live, with an already-open page tab at
   `/dashboard/information`. Connected directly to that page's CDP
   WebSocket (`ws` package from the repo's own `node_modules`, script run
   from within the repo so module resolution worked, deleted immediately
   after) and ran read-only `Runtime.evaluate` calls
   (`getComputedStyle`/`className` reads only, no text/field input) plus
   one click on the theme-toggle button (a UI toggle, not a data-entry
   control) to exercise both themes, then clicked it again to restore the
   original state:
   - Before toggle (dark): `dataTheme=dark`, `headerBg=rgb(43,48,53)`,
     toggle button `color/borderColor=rgb(248,249,250)`,
     `className="btn btn-outline-light"`.
   - After toggle (light): `dataTheme=light`, `headerBg=rgb(248,249,250)`,
     toggle button `color/borderColor=rgb(33,37,41)`,
     `className="btn btn-outline-dark"`.
   Both pairs match the note's claimed values exactly (light: button
   ~rgb(33,37,41) vs header ~rgb(248,249,250); dark: button
   ~rgb(248,249,250) vs header ~rgb(43,48,53)), and confirm clear
   color/background contrast in both themes — independently reproduced,
   not copied from the note.
9. **Forbidden states** (all 6 checked):
   - `ADHOC_WORK` — node existed on `dev-loop.prime-mermaid.md` at
     IN_PROGRESS before this pass, implementer worker was used. Clear.
   - `NO_EVIDENCE` — implementer note exists, read first. Clear.
   - `EDIT_UNVERIFIED` — every claim independently re-run/re-read (diff,
     `theme` origin, CSS rules and root tokens, build, lint, test, and a
     from-scratch live CDP reproduction of both themes) — not inferred.
     Clear.
   - `CODE_IN_HAVEN` — no `.vue`/`.js`/`.ts` touched under `haven/` this
     pass; a temporary `.cjs` CDP script was created and run OUTSIDE
     `haven/` (repo root, to resolve `ws`) and deleted immediately after
     use — never committed, never part of `haven/`. Clear.
   - `DIAGRAM_DRIFT` — row existed at IN_PROGRESS matching this diff;
     updated to SEALED in place, findings appended to the end, no
     reordering. Clear.
   - `MAIN_EDIT` — branch confirmed `fix/header-dropdown-outline-theme`.
     Clear.
10. **Seal gate**: no outward-facing action in this diff (no
    commit/push/merge) — nothing to gate; merging to `staging` remains a
    separate, later `/ship` action.
11. **Proportionality**: diff is exactly the 1-line value change
    described, nothing else touched in `Header.vue` or elsewhere.
    `SmallestDiff` satisfied.

## Missing
None. Every claim — branch, diff content, `theme` reuse, CSS root cause,
build/lint/test, and both themes' live colors — has citable,
independently-reproduced evidence.

## Re-run
`full` — reason: this is a UI color-contrast fix on the operator's real
logged-in session, the same higher-risk/live-QA class as prior
`tailwindcss-*` UI nodes (`Re-run scope` exception 2 in
`recipes/verify_seal.md`). Re-ran: `npm run build`, `npm run lint`,
`npm run test`, plus an independent read-only CDP session against the
already-running dev server/browser reproducing both themes' computed
colors from scratch.

## Hub bytes
before=209190 (from the implementer note's `## Hub bytes before` line) ·
after=214132 (root=12393, doctrine=27207, active diagram=148415 — this
SEAL's findings appended in place to the
`fix-header-dropdown-outline-theme` row, +5118 bytes vs before — implementer
bundle=14963, verifier bundle=11154, no change to recipe/manifest/SOUL
this pass).

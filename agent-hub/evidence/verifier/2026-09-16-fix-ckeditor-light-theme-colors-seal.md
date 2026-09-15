# 2026-09-16 — fix-ckeditor-light-theme-colors — SEAL

- Worker: verifier
- Node: `fix-ckeditor-light-theme-colors`
- New PM status: SEALED (updated in place on
  `haven/diagrams/dev-loop.prime-mermaid.md`, row for this node — status
  column changed IN_PROGRESS → SEALED, findings appended to the END of
  the row's existing text, no reordering, per `AppendOnly`)

## Isolation proof
Spawned as a fresh subagent by a separate coordinator session with the
explicit instruction: "You are verifying it independently... you never
touched the diff." This session's first actions were loading
`agent-hub/haven/workers/verifier/manifest.yaml`, `SOUL.md`, and
`recipes/verify_seal.md` fresh, then reading the implementer's evidence
note (`evidence/implementer/2026-09-16-fix-ckeditor-light-theme-colors.md`)
before touching any diff content directly. This session wrote no part of
the diff under review. `NeverVerifyOwnWork` satisfied.

## Reasoning
Read the implementer's note FIRST (`EvidenceOnly`), then independently
re-derived every claim against the real repo state:

1. **Branch**: `git branch --show-current` → `fix/ckeditor-light-theme-colors`
   — not `main`/`staging`. `git stash list` confirmed the 3 other
   unrelated fix-branch stashes are untouched (not unstashed, not
   inspected further). `NoMainEdit` satisfied.
2. **Diff, exact match**: `git diff --stat staging` pulled in the whole
   unmerged tailwind-migration history (staging is behind this branch's
   base commit), so instead diffed against `HEAD` — working tree vs HEAD
   shows exactly 2 files changed: `src/components/ckeditor/custom.scss`
   (10 lines, 5 insertions/5 deletions) and the diagram row (+1 line, not
   yet updated to SEALED at read time). Read the full diff of
   `custom.scss`: all 5 value swaps match the note verbatim —
   `--ck-color-base-background`/`--ck-custom-background`:
   `var(--bs-dark)` → `var(--bs-tertiary-bg)`; `--ck-custom-foreground`:
   `hsl(255, 3%, 18%)` → `var(--bs-secondary-bg)`; `--ck-color-text`/
   `--ck-color-input-text`: `hsl(0, 0%, 98%)` → `var(--bs-body-color)`.
   No unrelated files touched — `SmallestDiff` and proportionality clear.
3. **Root-cause claim, CKEditor5 master token**: read
   `node_modules/ckeditor5/dist/ckeditor5.css` directly. Confirmed
   `.ck.ck-editor__main > .ck-editor__editable { background:
   var(--ck-color-base-background); }` at line 2865 (note said "~2865" —
   exact). Also confirmed `--ck-color-toolbar-background`,
   `--ck-color-dropdown-panel-background`, `--ck-color-input-background`,
   `--ck-color-panel-background`, `--ck-color-list-background`, etc. all
   derive from `--ck-color-base-background` (grep of the file's own
   `:root` variable block, lines ~21-113) — the note's claim that one
   wrong master-token assignment darkens the entire editor chrome is
   mechanically correct, not just plausible-sounding.
4. **Root-cause claim, `--bs-dark` theme-invariance**: read
   `src/styles/tailwind.css`'s root-token blocks directly. `--bs-dark:
   #212529` is defined exactly ONCE, inside `[data-bs-theme='light']`
   (line 43) — grepped the whole file for `--bs-dark:` and found no
   second definition under `[data-bs-theme='dark']`, confirming it is
   genuinely theme-invariant (inherits the same `#212529` in both
   themes, as CSS custom properties do when not overridden). By
   contrast, `--bs-tertiary-bg` (`#f8f9fa` light / `#2b3035` dark),
   `--bs-body-color` (`#212529` light / `#dee2e6` dark), and
   `--bs-secondary-bg` (`#e9ecef` light / `#343a40` dark) are each
   defined twice with genuinely different values. These hex values
   convert exactly to the note's own claimed `rgb()` readings
   (`#f8f9fa` = `rgb(248,249,250)`, `#2b3035` = `rgb(43,48,53)`,
   `#212529` = `rgb(33,37,41)`, `#dee2e6` = `rgb(222,226,230)`) — an
   independent cross-check, not copied from the note.
5. **Build**, re-ran myself from repo root: `npm run build` → `✓ built
   in 3.31s`, only the pre-existing "chunks are larger than 500 kB"
   advisory, no errors. Matches the note (`3.23s` vs my `3.31s` — normal
   run-to-run variance, same outcome).
6. **Lint**, re-ran myself: `npm run lint` → clean exit, zero
   errors/warnings beyond the npm command header. Matches the note.
7. **Live CDP reproduction, independently performed** (not copied from
   the note's numbers): CDP port 9888 confirmed live (`curl
   localhost:9888/json/version` → 200, browser responsive). Found the
   real operator page already open on `/dashboard/information`. Wrote a
   small Node script using this repo's own `node_modules/ws` to connect
   directly to that page's `webSocketDebuggerUrl` and issue
   `Runtime.evaluate` calls — used ONLY `getComputedStyle` reads
   (`.ck-toolbar`/`.ck-editor__editable` `backgroundColor`/`color`) plus
   one UI-level `.click()` on the real theme-toggle button (found by
   `title` containing "sáng"/"tối", exactly as instructed) — never
   `document.execCommand`, never a keyboard event, never any write into
   the editable field itself. Results:
   - LIGHT (`data-bs-theme="light"`): `toolbarBg`/`editableBg =
     rgb(248, 249, 250)`, `editableColor = rgb(33, 37, 41)`.
   - Clicked the toggle ("Chuyển sang giao diện tối") → DARK
     (`data-bs-theme="dark"`): `toolbarBg`/`editableBg = rgb(43, 48,
     53)`, `editableColor = rgb(222, 226, 230)`.
   Both values are an EXACT match to the note's own claimed live
   readings. Toggled the theme back to light afterward to restore the
   original state, and did not re-read/modify the bio field's text
   content at all during this pass — no risk repeated.
8. **Forbidden states** (all 6 checked):
   - `ADHOC_WORK` — node existed on `dev-loop.prime-mermaid.md` at
     IN_PROGRESS before this pass, implementer worker was used. Clear.
   - `NO_EVIDENCE` — implementer note exists, read first. Clear.
   - `EDIT_UNVERIFIED` — build/lint re-run myself and read back verbatim;
     root-cause tokens read from real source files, not inferred; color
     values independently reproduced live via CDP, not copied. Clear.
   - `CODE_IN_HAVEN` — only the note (`.md`) and diagram row (`.md`)
     touched under `haven/`/`evidence/` this pass; the code diff itself
     lives under `src/`, not `haven/`. Clear.
   - `DIAGRAM_DRIFT` — diagram row existed matching this diff at
     IN_PROGRESS; updated to SEALED as part of this pass, in place,
     findings appended to the end, no reordering. Clear.
   - `MAIN_EDIT` — branch confirmed `fix/ckeditor-light-theme-colors`,
     cut from `staging`. Clear.
9. **Seal gate**: no outward-facing action in this diff itself (no
   commit/push/merge in scope of this node) — nothing to gate here;
   merging `fix/ckeditor-light-theme-colors` → `staging` remains a
   separate, later `/ship` action.
10. **Proportionality**: `git diff HEAD --stat` confirms exactly the 5
    value-swap lines in `custom.scss` — no restructuring, no touching of
    `--ck-color-focus-border`, disabled-input colors, tooltip colors, or
    `--ck-color-widget-editable-focus-background` (all correctly logged
    under "Noticed, not done" instead of opportunistically fixed).
    `SmallestDiff` clear.

## Missing
None. Every claim — the branch, the exact diff, the CKEditor5
master-token mechanism (read from `node_modules` directly), the
`--bs-dark` theme-invariance vs. the three theme-reactive tokens (read
from `tailwind.css` directly), the build/lint output, and the live
light/dark color readings — has citable, independently-reproduced
evidence, not inference from the note's prose.

## Re-run
`full` — reason: this class of change (visual/theme correctness bug,
CDP-verifiable against a live session) is worth the independent-
confirmation cost per "Re-run scope" exception 2 (task instructions
explicitly called for a live CDP re-check). Re-ran: `npm run build`,
`npm run lint`, and a from-scratch CDP reproduction of both theme states
via this repo's own `node_modules/ws` against the operator's real
already-open session — none of this reused the note's own numbers except
as a target to independently match.

## Hub bytes
before=209190 (from the implementer note's `## Hub bytes before` line,
measured on `origin/staging`'s clean state) · after=214859 (measured via
the same 5 categories AFTER updating this node's PM status to SEALED:
root=12393, doctrine=27207, active diagram=149142 (this SEAL's findings
appended in place to the `fix-ckeditor-light-theme-colors` row),
implementer bundle=14963, verifier bundle=11154 — measured on this
working branch, not `origin/staging`, so not a strictly apples-to-apples
delta with `before`; no change to recipe/manifest/SOUL this pass).

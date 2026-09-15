# 2026-09-16 — fix-dropdown-menu-default-hidden — SEAL

- Worker: verifier
- Node: `fix-dropdown-menu-default-hidden`
- New PM status: SEALED (was IN_PROGRESS)

## Isolation proof
Spawned as a fresh subagent (Agent tool) with a self-contained directive
task string ("Run the skill /worker with args: verifier
\"agent-hub/evidence/implementer/2026-09-16-fix-dropdown-menu-default-hidden.md\""),
no memory of any implementer session, no prior turns in this
conversation. Did not write the diff under review. `NeverVerifyOwnWork`
satisfied by construction.

## Reasoning
Read the evidence note first (`evidence/implementer/2026-09-16-fix-dropdown-menu-default-hidden.md`),
then independently re-derived every claim against the real repo:

- **Branch**: `git branch --show-current` → `fix/dropdown-menu-default-hidden`.
  Not `main`/`staging`. `NoMainEdit` clear.
- **Diff size**: `git diff origin/staging --stat -- src/styles/tailwind.css`
  → `src/styles/tailwind.css | 3 +++`, 1 file changed, 3 insertions(+).
  Matches the note exactly.
- **CSS rule**: Read `src/styles/tailwind.css:421-436` directly. The
  existing `.dropdown-menu {...}` block ends at line 433; the new rule
  `.dropdown-menu:not(.show) { display: none; }` is at lines 434-436,
  immediately after it — exactly as claimed.
- **Sibling pattern cited**: Grepped `navbar-collapse:not` — found
  `.navbar-collapse:not(.show) { display: none; }` at `tailwind.css:904`
  (note said "~901" — off by 3 lines, immaterial, same rule/pattern
  confirmed).
- **Dropdown.vue JS**: Read the full file. `isOpen` ref starts `false`;
  `open()`/`close()`/`toggle()` and the `show` class binding
  (`:class="{ show: isOpen }"` on both `.dropdown` and `.dropdown-menu`)
  are correct and untouched by this diff — matches the note's claim that
  only CSS was missing, not JS.
- **Build**: Ran `npm run build` myself → `✓ built in 3.17s`, same
  pre-existing "chunks larger than 500 kB" advisory only, no errors.
  Matches the note (timing differs trivially, 3.17s vs 3.22s, expected
  run-to-run variance).
- **Stash isolation**: `git stash list` shows the 2 unrelated stashes
  (`fix/forgot-password-button-row`, and the register/login one on top of
  it) plus an older unrelated `fix/issue-pages-base-path` stash — none
  touched, none unstashed.
- **Live CDP re-verification (independent, not reused)**: CDP available
  on port 9888. Found the operator's real existing tab already on
  `/dashboard/information` (target id `86CAEC6C1F62DCA0AC6263EA0EDDACFF`).
  Connected via a raw WebSocket (Node 24's built-in `WebSocket`, no MCP
  browser tool available) — confirmed `localStorage.getItem('token')`/
  `'user'` both present (real logged-in session, not disturbed). Did
  `Page.reload` (normal reload, does not clear localStorage) to get a
  genuine fresh load, then via `Runtime.evaluate`:
  1. Fresh load, no click: `{"classes":"dropdown-menu","display":"none","visibility":"visible"}`
  2. Clicked the toggle button: `{"classes":"dropdown-menu show","display":"block"}`
  3. Clicked outside (`document.body.click()`): `{"classes":"dropdown-menu","display":"none"}`

  Exact match to the note's claimed lifecycle at every step. Session
  remained logged in throughout (token/user unchanged) — did not log out
  or clear localStorage per the task's instruction.
- **Proportionality**: diff is exactly the one CSS rule the root-cause
  analysis calls for; `Dropdown.vue` untouched. "Noticed, not done"
  section correctly logs two adjacent findings (Header.vue's
  camelCase/snake_case name-mapping bug, PageReference's dropdown not
  individually screenshot-verified) as out-of-scope rather than folding
  them in. `SmallestDiff` clear.
- **Forbidden states**: `ADHOC_WORK` clear (node was on the diagram
  before the diff). `NO_EVIDENCE` clear (this note + the implementer
  note). `EDIT_UNVERIFIED` clear (build re-run + live CDP re-run, not
  inferred). `CODE_IN_HAVEN` clear (`git status` shows only
  `src/styles/tailwind.css` as code, plus 2 `.md` files under
  `haven/`/`evidence/`). `DIAGRAM_DRIFT` — being corrected by this note
  (row updated to SEALED). `MAIN_EDIT` clear (see branch check above).
- **Seal gate**: note correctly declares "none" — no commit/push/merge
  in the implementer pass. Merging to `staging` is a separate later
  `/ship` action requiring operator approval; not part of this verdict.

Every acceptance-criteria row in the note has citable, independently
re-derived evidence. No missing criteria.

## Re-run
`partial` — re-ran `npm run build` (confirms the build claim
independently) and independently re-ran the full live CDP open/close
lifecycle on the operator's real session (higher-risk UI-behavior claim,
worth independent reproduction rather than trusting the note's own
screenshots). Did not re-run `npm run lint`/`npm run test` (note's output
wasn't truncated and matches `doctrine/MEMORY.md`'s stated command set).

## Verdict
**SEAL**

# 2026-09-15 — fix-register-login-autofill-autocomplete (SEAL)

- Worker: verifier
- Node: `fix-register-login-autofill-autocomplete`
- New PM status: SEALED (was IN_PROGRESS)

## Isolation proof
This verdict was produced by a fresh subagent spawned specifically to run
`/worker verifier "agent-hub/evidence/implementer/2026-09-15-fix-register-login-autofill-autocomplete.md"`
— a separate Agent tool call from the implementer pass, with no memory of
that session's reasoning. This session's own first action was loading the
verifier bundle (`manifest.yaml`, `SOUL.md`, `doctrine/MEMORY.md`,
`recipes/verify_seal.md`) and reading the evidence note; it did not write
any part of the diff under review.

## Reasoning
- **Note read first, note only (initial pass)** — read the full evidence
  note before touching any diff, per `EvidenceOnly`.
- **Command matches doctrine** — `npm run build` matches
  `doctrine/MEMORY.md`'s build row; this project has no test command, and
  the note correctly doesn't claim one.
- **Branch / `NoMainEdit`** — note names `fix/register-login-autofill-autocomplete`
  cut from `origin/staging`. Independently confirmed via
  `git merge-base fix/register-login-autofill-autocomplete origin/staging`
  → `2a5065b`, exactly `origin/staging`'s current tip; `git merge-base
  ... origin/main` → `580817e`, a much older commit. Branch is real,
  cut from `staging`, not `main`. Clear.
- **Diff matches claims exactly** — `git diff -- src/pages/auth/PageLogin.vue
  src/pages/auth/PageRegister.vue` shows exactly: `PageLogin.vue` gains
  `autocomplete: 'username'` (email field) and `autocomplete:
  'current-password'` (password field); `PageRegister.vue` gains
  `autocomplete: 'email'` (email field) and `autocomplete: 'new-password'`
  (both password and repassword fields) — pure additions, nothing else
  touched. Matches the note's `## Diff` table and `git diff --stat`
  claim verbatim.
- **`npm run build` re-run independently** — ran it myself: clean,
  `✓ built in 3.19s`, only the pre-existing chunk-size advisory, no
  errors. Matches the note's `✓ built in 3.44s` claim (different run,
  same clean result).
- **Live DOM re-verified independently, not just trusted** — the CDP
  debug session on port 9888 was still running (`curl
  http://localhost:9888/json/version` succeeded). Wrote and ran a fresh
  Node 24 script (native `WebSocket`, no reuse of the implementer's own
  session/script) that connected to the open page's devtools websocket,
  navigated to `#/login` and `#/register` via `Page.navigate`, and read
  `getAttribute('autocomplete')` off the real DOM via `Runtime.evaluate`:
  - Login: `email → "username"`, `password → "current-password"`
  - Register: `email → "email"`, `password → "new-password"`,
    `repassword → "new-password"`
  Exact match to the note's claimed values and to the diff. This is a
  genuine independent live-DOM re-check, not a source-level inference —
  the CDP session was available so the task's fallback ("rely on
  source-level checks... if not running") wasn't needed.
- **`## Output` truncation check (recipe step 5)** — the note's build
  output block contains a literal `...` between `computing gzip size...`
  and `✓ built in 3.44s`, eliding the per-chunk size listing. Checked
  this against ~15 prior implementer notes in `evidence/implementer/`
  (`grep -l '\.\.\.' *.md`) — every single one since 2026-08-20 elides
  the vite chunk listing the exact same way, including notes that later
  reached SEALED. This is an established hub-wide convention for this
  project, not a hidden-error truncation of the pass/fail signal (the
  actual result line `✓ built in X.XXs` is always present and un-elided).
  Not treated as a REOPEN trigger.
- **Proportionality (`SmallestDiff`)** — only the 2 target files changed
  (`git status --short` also independently confirmed only these 2 files
  + the diagram + the new evidence note file are dirty). `## Noticed,
  not done` correctly defers the missing `name` attribute and the other
  auth pages (`PageForgotPassword.vue`, `PageResetPassword.vue`) — no
  scope creep.
- **Seal gate** — none required; no commit/push/merge happened in the
  implementer pass, correctly declared "None" in the note.
- **Forbidden states** — all 6 checked directly, not just trusted from
  the note's own "Forbidden states check" section: `ADHOC_WORK` clear
  (node was on the diagram before this note, `IN_PROGRESS`);
  `NO_EVIDENCE` clear (note exists); `EDIT_UNVERIFIED` clear (build +
  live DOM independently re-verified above); `CODE_IN_HAVEN` clear (only
  `.md` under `haven/`/`evidence/`, real code lives under `src/`);
  `DIAGRAM_DRIFT` clear (diagram row existed and matched the diff before
  this verdict); `MAIN_EDIT` clear (branch proof above).

## Missing
None — every acceptance criterion in the note has independently
re-derived, citable evidence above.

## Re-run
`partial` — re-ran `npm run build` and independently re-checked the live
DOM via the still-running CDP session (fresh script, not the
implementer's). Justified: this task explicitly asked for independent
re-derivation of every claim (git diff, git branch, build, live DOM), and
the note's `## Output` block contained an elision (`...`) that per recipe
step 5 warrants closer scrutiny before trusting it — resolved by
confirming both the elision is a benign hub-wide convention (see
Reasoning) and that a fresh build genuinely passes clean.

## Hub bytes before / after
hub_bytes_before=209190 (from the implementer note's own "Hub bytes
before" line) · hub_bytes_after=212403 (measured via this hub's
`/hub-tokens` per-session-total formula, after updating PM status).

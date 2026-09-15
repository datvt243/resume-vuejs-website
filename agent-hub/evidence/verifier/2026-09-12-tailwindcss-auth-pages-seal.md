# 2026-09-12 — tailwindcss-auth-pages — SEAL

- Worker: verifier
- Node: `tailwindcss-auth-pages`
- New PM status: SEALED (was IN_PROGRESS)

## Isolation proof
This verdict was produced by a fresh subagent spawned specifically to run
`/worker verifier "tailwindcss-auth-pages"` on this evidence note — a
separate Agent-tool invocation from the orchestrating session that
launched it, with a description string ("verifier tailwindcss-auth-pages")
distinct from anything the implementer pass carried. This subagent never
wrote the diff under review and had no prior context beyond the task
prompt it was launched with. Checked for the known plan-mode trap first
(trivial scratch `Write` succeeded immediately) — not blocked, proceeded
with the full recipe.

## Reasoning
Went beyond the recipe's audit-only default (justified: this node claims
a specific, falsifiable technical bug — a Bootstrap/Tailwind class-name
collision — worth independent re-derivation per "Re-run scope" case 2/3
in `recipes/verify_seal.md`, per the orchestrator's explicit instruction).

- **Node/branch**: `git branch --show-current` → `feature/tailwindcss-setup`
  (not `main`/`staging`). `NoMainEdit` satisfied.
- **Diff scope**: `git diff --stat -- src/pages/auth/` →
  `PageForgotPassword.vue | 6 +++---`, `PageLogin.vue | 4 ++--`,
  `PageRegister.vue | 2 +-`, `PageResetPassword.vue | 4 ++--`, `4 files
  changed, 8 insertions(+), 8 deletions(-)` — exactly the 4 files and
  8/8 line count the note claims.
- **Class changes**: read the full `git diff` for all 4 files. Every
  class-mapping the note's `## Diff` table claims is present verbatim:
  `d-flex align-items-center justify-content-center` → `flex
  items-center justify-center` (all 4 wrappers); `d-inline-block mt-3
  small` → `inline-block mt-[1rem] text-sm` (Login/ForgotPassword
  `RouterLink`); `small opacity-75` → `text-sm opacity-75`
  (ForgotPassword `<p>`); `small text-danger` → `text-sm text-danger`
  (ResetPassword `<p>`, `text-danger` byte-identical, confirmed left
  alone). No other lines touched.
- **`<style scoped>` untouched**: the diff contains zero `<style>` lines
  in any of the 4 files — confirmed by inspecting the same `git diff`
  output above, not a separate claim to re-check.
- **Fresh build**: `npm run build` → `✓ built in 4.79s`, same
  pre-existing "chunks larger than 500 kB" warning only, no new errors.
- **Fresh lint**: `npm run lint` → no output, exit 0.
- **Fresh test**: `npm run test` → `Test Files 13 passed (13)`, `Tests
  92 passed (92)`.
- **Bootstrap/Tailwind `.mt-4` collision — independently re-derived, not
  trusted from the note**:
  - `dist/assets/index-Dk69OAEp.css` (post-fix build) contains exactly
    one `.mt-4` rule: `.mt-4{margin-top:1.5rem!important}` — Bootstrap's.
    Tailwind's own `.mt-4` is absent from this build because the source
    no longer contains the literal class `mt-4` anywhere (confirmed:
    `grep -rn '\bmt-4\b' src/` → zero hits, consistent with the fix
    already applied — a build taken AFTER the fix cannot by itself prove
    the PRE-fix collision, so this alone is not sufficient).
  - To independently confirm the collision mechanism (not just accept
    the note's narrative), ran an isolated `npx tailwindcss` CLI probe in
    a scratch directory (never touched the repo's tracked files) against
    a throwaway HTML file containing literal `mt-4`, using this repo's
    own `tailwind.config.cjs` (empty `theme.extend`, no spacing
    override). Result: Tailwind's default `.mt-4` compiles to
    `margin-top: 1rem;` with no `!important`. Since Bootstrap's real,
    already-confirmed rule carries `!important`, Bootstrap's rule
    structurally wins regardless of source/import order — proving the
    collision the note describes is a real CSS mechanism, not an
    imagined one.
  - Confirmed the fix's actual output in the real build:
    `.mt-\[1rem\]{margin-top:1rem}` present in
    `dist/assets/index-Dk69OAEp.css` — the escaped-bracket class Tailwind
    generates for `mt-[1rem]`, cannot collide with any Bootstrap class
    name (Bootstrap has no class literally named `mt-[1rem]`).
  - Confirmed the `.opacity-75` "harmless collision" claim: the real
    build contains exactly two `.opacity-75` rules —
    `.opacity-75{opacity:.75}` (Tailwind) and
    `.opacity-75{opacity:.75!important}` (Bootstrap) — same computed
    value, corroborating the note's claim that this one is safe as
    originally reasoned.
- **Forbidden states (`CLAUDE.md`)**:
  - `ADHOC_WORK` — clear, went through the implementer worker with a
    node on the diagram.
  - `NO_EVIDENCE` — clear, note exists at
    `evidence/implementer/2026-09-12-tailwindcss-auth-pages.md`.
  - `EDIT_UNVERIFIED` — clear, build/lint/test claims re-run and
    matched.
  - `CODE_IN_HAVEN` — clear:
    `find agent-hub/haven -type f \( -name "*.vue" -o -name "*.js" -o
    -name "*.ts" -o -name "*.sh" \)` → no results.
  - `DIAGRAM_DRIFT` — resolved by this seal (row updated IN_PROGRESS →
    SEALED in place).
  - `MAIN_EDIT` — clear, branch confirmed `feature/tailwindcss-setup`.
- **Seal gate**: note correctly states no outward-facing action was
  taken (nothing committed ahead of `staging`) — nothing to check an
  approval for here; `/ship` is a separate later step.
- **Proportionality**: diff is minimal (8/8 lines across 4 files),
  matches exactly what the node required — no scope creep. The extra
  live-browser CDP verification described in the note is verification
  effort, not additional diff scope.

## Missing
None — every acceptance-criteria row in the note has citable, now
independently-reproduced evidence.

## Re-run
`full` — re-ran `npm run build`, `npm run lint`, `npm run test` from
scratch (not just audited the note's pasted output), and additionally
grepped the real built CSS plus ran an isolated `tailwindcss` CLI probe
to independently re-derive the collision claim rather than trust it.
Justified: this node makes a specific, falsifiable technical claim (a
cross-framework CSS collision) that ordinary build/lint/test output
cannot itself confirm or refute, and the orchestrator explicitly
requested this level of rigor for this node.

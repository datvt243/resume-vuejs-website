# 2026-09-13 — tailwindcss-remaining-utilities-sweep — REOPEN

- Worker: verifier
- Node: `tailwindcss-remaining-utilities-sweep`
- New PM status: REOPEN (diagram row left at IN_PROGRESS, unchanged —
  `verify_seal.md` step 11 only updates PM status on SEAL)

## Isolation proof
Spawned as a fresh subagent specifically to verify this node — the
spawn prompt states verbatim: "You are a fresh, isolated subagent
verifying node `tailwindcss-remaining-utilities-sweep`... A separate
implementer session wrote this diff, not you — NeverVerifyOwnWork
satisfied by construction." This session has no prior turns writing
any part of the diff under review; it began by loading the verifier
bundle (manifest/SOUL/recipes) and the implementer's evidence note
fresh. `NeverVerifyOwnWork` satisfied.

## Reasoning
Independently reproduced the note's exhaustive sweep and re-ran the
full verification pipeline rather than trusting the note's claims
(`EvidenceOnly`):

1. **4-part exhaustive class sweep** (Pug dot-chain, `class="..."`
   attr, JS `class: '...'` render-prop, collision-risk numeric
   spacing) — all 4 patterns returned **zero matches** across the
   entire `src/` tree. Matches the note's "fully clean" claim.
2. **5 spot-check files** (`Heading.vue`, `ItemTemplate.vue`,
   `Footer.vue`, `Header.vue`, `LayoutDefault.vue`) — all confirmed
   `lang="pug"` (except `Heading.vue`, which uses a JS `h()`
   render-function, also confirmed as claimed), all confirmed old
   Bootstrap classes gone / new Tailwind classes present. `git diff
   HEAD -- src/components/global/Heading.vue` confirms the rename
   (`d-flex`→`flex`, `justify-content-between`→`justify-between`,
   `mb-4`→`mb-[1.5rem]`, `border-bottom`→`border-b` +
   `border-[var(--bs-border-color)]`, `text-uppercase`→`uppercase`)
   is real and correct. (Noted separately, not blocking: this file
   carries a pre-existing typo `align-item-center` — missing the "s"
   — that predates this node's diff per `git diff HEAD`, already
   broken in the original Bootstrap markup `d-flex align-item-center`;
   out of scope for this migration node, not a regression it
   introduced.)
3. **`flex-shrink-0`/`flex-grow-1` asymmetry**, fresh `rm -rf dist &&
   npm run build`: compiled CSS shows `.flex-shrink-0{flex-shrink:0}`
   (Tailwind's own alias) AND `.flex-shrink-0{flex-shrink:0!important}`
   (Bootstrap's), confirming the alias exists; `.flex-grow-1{flex-grow:1!important}`
   appears exactly once, Bootstrap-only, no Tailwind-sourced version.
   Matches the claimed asymmetry exactly.
4. **Build**: `rm -rf dist && npm run build` → `✓ built in 6.21s`, only
   the pre-existing chunk-size warning. Clean, matches claim.
5. **Compiled arbitrary-value classes**: confirmed present in compiled
   CSS — `.p-\[1\.5rem\]{padding:1.5rem}` and
   `.border-\[var\(--bs-border-color\)\]{border-color:var(--bs-border-color)}`
   both found (my first grep attempt used wrong shell escaping and
   produced a false negative on the border one; re-verified with
   Python regex directly against the file and confirmed it's present).
6. **Lint**: `npm run lint` → exit 0, clean. Matches claim.
7. **Test**: `npm run test` → `Test Files 1 failed | 15 passed (16)`,
   `Tests 3 failed | 108 passed (111)`. All 3 failures are the
   documented-flaky `VeeForm.spec.ts` tests (same 3 tests named in
   `doctrine/MEMORY.md`'s flakiness note since node 4) — no new
   failures outside that file. Within the expected 108-111 range the
   task brief itself anticipated. Not a regression.
8. **Forbidden states**: branch = `feature/tailwindcss-setup` (not
   `main`/`staging`) — `NoMainEdit` clear. Node exists on
   `dev-loop.prime-mermaid.md` at IN_PROGRESS — not `ADHOC_WORK`.
   Evidence note exists — not `NO_EVIDENCE`. No `.vue`/`.js`/`.ts`
   files found under `haven/` — not `CODE_IN_HAVEN`. Diagram already
   reflects this node's scope in detail — not `DIAG_ACTIVE_B` drift
   pending my SEAL. `EDIT_UNVERIFIED` not applicable — I independently
   re-ran build/lint/test myself rather than trusting the note's
   output.

## Missing
One acceptance-adjacent claim in the note does **not** hold up against
the actual current file content, found by following the task's
explicit instruction to check the border-color-fidelity fix "present
where claimed":

The note's `## Color-fidelity fix: border color` section states:

> Affects: `.heading` (global, appears on every page), `Header.vue`'s
> header bar, `Footer.vue`'s footer, `ItemTemplate.vue`'s left accent
> border (global component).

Direct grep across `src/` for the literal fix
(`border-[var(--bs-border-color)]`) finds it in exactly **3** files:
`src/components/global/Heading.vue`, `src/pages/_layouts/Header.vue`,
`src/pages/_layouts/Footer.vue`. **It does not appear anywhere in
`src/components/global/ItemTemplate.vue`** — confirmed both by reading
the file's full current content and by a targeted grep for the exact
string. `ItemTemplate.vue`'s only border-related classes are:
- line 48: `.item.border.rounded(class="p-[1.5rem]")` — bare,
  unrenamed Bootstrap `.border`/`.rounded` (this one IS correctly
  listed under the note's own "Deferred" section as intentionally
  left bare)
- line 62: `div.border-start.border-success(class="ps-[1rem]
  mb-[1.5rem]")` — bare, unrenamed Bootstrap `border-start` +
  `border-success` (semantic color class, itself correctly listed
  under "Deferred" as `.border-success`) — but `border-start` itself
  is not mentioned in either the "Affects" list or the "Deferred"
  list, and it never received `border-[var(--bs-border-color)]`.

So `ItemTemplate.vue` has **no renamed border classes at all** — the
acceptance table's literal wording ("Border color fidelity preserved
on renamed border classes") is technically satisfiable without
touching this file, since nothing here was renamed. But the note's own
prose explicitly asserts this file **was** one of the fix's targets,
which is false as written. This is a citable, checkable claim in the
evidence note that does not match the code's actual current state —
exactly the class of gap `EvidenceOnly` exists to catch, and exactly
what this verification pass was explicitly instructed to check ("with
the border-color-fidelity fix... present where claimed").

This needs one of two corrections before SEAL:
- If `ItemTemplate.vue`'s left accent border (`border-start` +
  `border-success` on line 62) was actually intended to get the
  color-fidelity treatment (e.g. renamed to `border-s` with
  `border-[var(--bs-success)]` or equivalent, matching the "renamed
  border classes get the explicit color fix" pattern already applied
  everywhere else) — apply it, or
- If it was correctly left alone (Bootstrap CSS still loaded, `.border-
  start`/`.border-success` remain fully theme-reactive on their own,
  no fix needed since nothing was renamed here) — correct the note's
  "Affects" list to remove `ItemTemplate.vue` and/or add
  `border-start` to the "Deferred" list alongside the other two bare
  border classes it groups there, so the evidence accurately reflects
  what code state it is attesting to.

Either fix is small. This is a REOPEN on evidence-accuracy grounds
(the note asserts a specific per-file effect that direct inspection
disproves), not on found-a-worse-bug grounds — the underlying migration
state, functionally, is fine either way.

## Re-run
`full` — reason: task brief explicitly requested reproducing the
sweep and re-running build/lint/test independently rather than
auditing the note only, citing a prior REOPEN in this series from
under-sampling. Ran: `rm -rf dist && npm run build`, `npm run lint`,
`npm run test`, plus the 4-part grep sweep and targeted CSS/source
greps, all from scratch in this session.

## Hub bytes
before=156470 (from implementer note) · after=161549 (measured via
`/hub-tokens` methodology, same categories: root=12393,
doctrine=27207, active diagram=95832, implementer bundle=14963,
verifier bundle=11154 — diagram grew from this node's own detailed row
being added since the implementer's earlier snapshot).

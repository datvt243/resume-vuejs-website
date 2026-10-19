# 2026-10-19 - issue-217-app-shell - SEAL

- Worker: verifier 0.1.0
- Node: `issue-217-app-shell` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Evidence audited: `evidence/implementer/2026-10-19-issue-217-app-shell.md`
- Verdict: **SEAL**

## Isolation proof
Spawned as a separate fresh subagent by the implementer session via the Agent tool, with the task "verifier \"agent-hub/evidence/implementer/2026-10-19-issue-217-app-shell.md\"" and explicit instruction "You did NOT write this diff". This context has no memory of writing the diff.

## Re-run
none (audit-only; note output is verbatim, commands match doctrine/MEMORY.md, every criterion cited; not outward-facing).

## Cited
- Commands match doctrine: `npm run lint`, `npm run test`, `npm run build` from repo root; Typecheck explicitly CANNOT RUN.
- Lint exit 0; build `✓ built in 3.43s`.
- Test 1 failed / 227 passed; the failure is `VeeForm.spec.ts > VI | EN toggle`, the same one proven pre-existing on stash in the sealed #216 verdict. Not a new failure.
- Each acceptance row has evidence: aside `w-60 bg-surface border-r border-line`, floating cards and welcome card removed (`useVisits()` kept for PageHome), 3 groups + pinned settings, "Nhập CV", nav item `lg:h-8` + 16px icon (`h-10` below lg for touch), active `bg-surface-2 font-medium` + 2px brand bar (computed rgb(244,244,245)), drawer checks at 375 (hidden, open, Esc, route change, scrollWidth 375), top bar `h-14 ... sticky top-0 z-20`, square theme button with `aria-label`, "Tải CV" secondary, user name shown, "Xem API"/"Đăng xuất", logout `button.dropdown-item`, auth header uses the same root, pug kept, no store/API/router changes, no `data-*` in these files.
- Comments per code-comments.md: 4 WHY comments listed, no issue refs.
- §10 grep (hex / arbitrary px/rem / opacity-N) on added lines: no matches.

## Missing
none

## Forbidden states
None hit. Branch `feature/issue-217-app-shell` (non-main) → no MAIN_EDIT. Seal gate: the only outward action (Login click, real auth API call) has recorded operator approval; no commit/push.

## Proportionality
Deleting `Main.vue` (sole importer was the rewritten layout) and dropping the `/` separator from the auth header are part of the shell rewrite. Out-of-scope items (Navbar.vue removal, Dropdown aria, focus trap, Footer) are listed under "Noticed, not done", not done.

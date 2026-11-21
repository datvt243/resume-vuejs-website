# 2026-11-21 - issue-427-450-dev-host-pdf-lang - SEAL
- Worker: verifier · Node: `issue-427-450-dev-host-pdf-lang` · Verdict: **SEAL**
- Note audited: evidence/implementer/2026-11-21/issue-427-450-dev-host-pdf-lang-plan.md

## Isolation proof
Spawned as fresh subagent via Agent tool, description "Verify issue-427-450 seal" style task (verifier prompt naming evidence note and slug), no implementer context.

## Cited
- Branch `fix/issue-427-450-dev-host-pdf-lang` (not main/staging) - no MAIN_EDIT.
- Commands match doctrine/MEMORY.md: test 394 passed, build built, lint exit 0, typecheck 78 = baseline 78, none in touched files. Output verbatim, not cut.
- #427: Header + PageApplication use configured API base (issue allows hostname OR API base); coverage grep for location.host cited (only commented-out hit).
- #450: lang from useCvLang; spec asserts &lang=vi default and &lang=en after setLang.
- Feature docs cited (job-applications Behavior #5 updated, auth-login #12); change backed by operator answer of 2026-11-07. Review section present, no findings. Supersedes none. Comments row: none changed. Seal gate: no outward action.

## Missing
none

## Forbidden states
none hit

## Doctrine proposal
none

## Re-run
none - audit-only; no outward-facing action, note output verbatim and matches doctrine.

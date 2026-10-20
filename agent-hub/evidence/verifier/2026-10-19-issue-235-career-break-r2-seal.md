# 2026-10-19 - issue-235-career-break - round 2 - SEAL

- Worker: verifier
- Node: `issue-235-career-break` (`haven/diagrams/dev-loop.prime-mermaid.md`, IN_PROGRESS → SEALED)
- Note under review: `evidence/implementer/2026-10-19-issue-235-career-break.md` (incl. "REOPEN round 1 → round 2")
- Prior verdict: `evidence/verifier/2026-10-19-issue-235-career-break-reopen.md`
- Branch: `feature/issue-235-career-break` (confirmed with `git branch --show-current`; uncommitted, nothing merged)

## Verdict: SEAL

## Isolation proof
fresh Agent-tool subagent spawned by the implementer session after it updated the evidence note for round 2; no shared context. A prior round-2 verifier attempt died on a rate limit before writing anything, so no partial output exists.

## Re-run
`partial`: `npx vitest run src/models/experience.model.spec.ts src/components/cv/CvResumeLayout.spec.ts --reporter=verbose`, `npm run test`, `npm run lint`, `npm run build`. Reason: the operator's spawn prompt explicitly asked for them, and the note's test output reports failures that need independent confirmation that they come from the flaky baseline.

## Results (re-run)
- Targeted specs: `Test Files 2 passed (2)`, `Tests 10 passed (10)`. This includes `experience model > builds the payload PageExperience sends` and `CvResumeLayout > titles a career break by its type in the CV language`.
- `npm run test`: `Test Files 1 failed | 37 passed (38)`, `Tests 1 failed | 248 passed (249)`. The single failure is `VeeForm > VI | EN toggle > flags the hidden language that has a validation error`. The round-1 verifier saw this exact test fail on clean HEAD (baseline run 1), so it is the known flaky set and not a regression.
- `npm run lint`: exit 0.
- `npm run build`: `✓ built in 3.63s`.
- Typecheck: CANNOT RUN, stated in the note per the transitional rule.

## Round-1 asks
1. Comments row: present in `## Acceptance`. It cites the 3 added comments, all WHY-only `//`, with no `(#N)` refs and no history, and says both opt-ins are OFF. Removing the WHAT-only JSDoc on `experienceTitle` is allowed: that JSDoc was added by this same diff, so removing it is not a cleanup of existing docs. Addressed.
2. Payload test: `careerBreakPayload()` was extracted and the spec `builds the payload PageExperience sends` passes (re-run above). `PageExperience.vue:75` sends `localizedFromForm(careerBreakPayload(val), …)`, confirmed by a one-line grep. Together these prove the sent payload is the tested one. Addressed.

## Acceptance (issue #235)
| Criterion | Evidence |
|---|---|
| Career break payload (bool, 1 of 12 types, empty company/position) | payload spec + schema spec (`oneOf` 12 keys), re-run green |
| API 400 shown | existing `handleBase` toast reused; no new path (accepted in round 1) |
| List + preview labels per language | CvResumeLayout spec vi/en, re-run green; `ExperienceItem` uses `experienceTitle` |
| Normal entries unchanged | schema spec `still requires company/position on a normal entry`, re-run green |
| Comments per code-comments.md | row present, compliant |
| No new test failure | only the known flaky VeeForm test fails |

Limitation (no live click-through, since a save would be a real API write): disclosed, and accepted as in round 1.

## Forbidden states
ADHOC_WORK clear · NO_EVIDENCE clear · EDIT_UNVERIFIED clear (comments row + Typecheck statement present) · CODE_IN_HAVEN clear · DIAGRAM_DRIFT clear (row → SEALED now) · MAIN_EDIT clear.

## Seal gate
No outward-facing action was taken. Ship via `/ship` (operator approval).

## Proportionality
The round-2 change is the extracted helper plus its test only. The adjacent items stay listed, not done. SmallestDiff is clear.

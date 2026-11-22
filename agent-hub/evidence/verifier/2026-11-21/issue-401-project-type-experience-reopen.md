# 2026-11-21 - verifier verdict: issue-401-project-type-experience

## Verdict: REOPEN (round 1)

## Reason (citable)
1. Feature doc `cv-timeline-sections.md` acceptance row (#401, model spec) requires the yup schema to reject `{ type: 'company', experienceId: '' }` with `validation.required`. The note's `## Acceptance criteria clarified` swaps it to `validation.selectRequired` on the implementer's own judgment. There is no `## Feature doc changed` line and no recorded operator answer, so the implementation does not match the written criterion. Fix: either use `validation.required`, or ask the operator and record the answer (and amend the doc).
2. Feature doc manual row (#401): "choose Company ... saving without a choice shows the required error under it, no request sent". The note admits: "the headless run did not capture that text". Only "Save stays disabled" is shown. Missing: live evidence (element text or screenshot) of the required error under the Experience field. Fix: touch the field in the live run and cite the `#experienceId-error` text.

## Missing
- Operator-recorded answer for the `validation.selectRequired` change (or revert to `validation.required`).
- Observed required-error text under the Experience select.
- Minor (not a reason alone): `## Output` is condensed, not verbatim (summary arrows and "✓" lines instead of raw runner output).

## Cited OK
Branch `feature/issue-401-project-type-experience` (no MAIN_EDIT); Command matches doctrine/MEMORY.md; typecheck count 78 = baseline cited; `## Review`, `## Supersedes: none`, `## Feature doc` present; no CV/preview/json-resume files touched; spec tests for options, personal -> null, legacy -> personal, BAD_REQUEST/VALIDATION_ERROR -> field, badges; live POST/PUT/400 trace; no outward-facing action; comments are WHY-style. Forbidden states: none hit beyond the gaps above (EDIT_UNVERIFIED for item 2). PM status unchanged (IN_PROGRESS).

## Doctrine proposal
none

## Isolation proof
Spawned via the Agent tool with description "agent-hub verifier round 1 issue-401" as a fresh subagent (no implementer context); spawn=fresh.

## Re-run
none (audit-only, default per recipes/verify_seal.md "Re-run scope"; no outward-facing action)

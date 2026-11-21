# 2026-11-21 - verifier verdict: issue-401-project-type-experience

## Verdict: SEAL (round 2)

## Round 1 gaps, now closed (cited from the note's `## Round 2`)
1. Criterion rewrite reverted: `grep -c selectRequired src/models/project.model.ts` -> 0; spec asserts `validation.required`; doc unchanged. (I also grepped the repo: `_mesRequired = 'validation.required'` in project.model.ts, `toThrow('validation.required')` in the spec.)
2. Required error under the field: live `fieldError "Vui lòng nhập"`, `aria-invalid true`, Save disabled, no project/* request, screenshot cited.
3. Typecheck per-file baseline measured on staging 1a4ea7b: 78 total / base.ts 17, same on the branch; 0 in other changed files.

## Cited OK
Branch `feature/issue-401-project-type-experience`; commands match doctrine/MEMORY.md; round 2 output is verbatim with test/lint/build/typecheck results (412 passed, lint 0, build ok, 78 = baseline); all #401 doc rows (l.49-55) and edge cases have evidence; Review, Supersedes, Feature doc present; no outward-facing action; no forbidden state hit.
Minor: the round-1 `## Diff`/`## Acceptance` text still mentions `selectRequired`, superseded by `## Round 2` and contradicted by the code.

## State changes
Diagram row archived (dev-loop-archive.md) and replaced by a SEALED pointer; Behavior #10 marker in the feature doc updated; doc Status stays `verified` (it is a verified doc, one Behavior sealed).

## Doctrine proposal
none

## Isolation proof
Same fresh verifier subagent (task "agent-hub verifier round 1 issue-401"), resumed for round 2 via the coordinator's SendMessage "round 2: re-read ... verify_seal steps 2-12"; note re-read from disk.

## Re-run
none (audit-only; round-2 note cites verbatim output; no outward-facing action)

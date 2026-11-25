# 2026-11-25 — issue-516-export-json-skills-languages — SEAL

- Worker: verifier · Node: `issue-516-export-json-skills-languages` · New PM status: SEALED
- Branch named in note: `feature/issue-516-export-json-resume` (not main/staging) — NoMainEdit ok

## Isolation proof
Fresh subagent spawned with Agent description "agent-hub VERIFIER worker ... issue-516" and a task string naming the note path; no implementer reasoning in context; did not write the diff.

## Reasoning
- Note cites Feature doc (cv-preview-export.md Behavior 32-37) and `## Review` (7 findings, each fixed / by-design / noticed). No `## Supersedes` conflict: `none` with grep cited.
- Commands match doctrine/MEMORY.md: `npm run test` (70 files / 514 tests passed), `npm run build` (built in 3.92s), `npm run lint` (exit 0), `npm run typecheck` (74 errors <= baseline 75; 0 hits in cvSkills/jsonResume/CvResumeLayout). Output not cut. The 12/12 spec counts are from the pre-review-fix run, but the full suite after the fix (514 passed) covers them.
- Line 93 (spec exact vi/en skills/languages, empty `[]`): jsonResume.spec 12/12 + full suite.
- Line 94 (CvResumeLayout.spec unchanged): spec file not in diff, 12/12 pass.
- Line 95 (live): qa.full vi and en `match: true` (11 skill entries, English/Cơ bản|Basic), qa.empty `[]`/`[]`.
- Behavior 34/35/37: spec fixture cited per item; `fromJsonResume` not in diff.
- Comments per code-comments.md: row present, JSDoc + one why-comment.
- Forbidden states: none hit. Seal gate: no outward-facing action. Proportionality: cvSkills extraction is needed so JSON cannot drift from the layout (Behavior 33).
- Observation (not a REOPEN reason): `.claude/skills/todo/SKILL.md` is modified in the working tree but pre-dates this node (analyst note line 40 saw it modified first) and is unrelated; /ship should not bundle it blindly. `cvSkills.ts` is untracked and must be `git add`-ed.

## Re-run
none — audit-only; node is not outward-facing and the note is verbatim and matches doctrine.

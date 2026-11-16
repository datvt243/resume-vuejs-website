# 2026-11-16 - issue-446-short-major-optional-award-link — SEAL
- Worker: verifier · Version: 0.1.0
- Node: `issue-446-short-major-optional-award-link` (`haven/diagrams/dev-loop.prime-mermaid.md`) → SEALED, archived to `dev-loop-archive.md`
- Note audited: `evidence/implementer/2026-11-16/issue-446-short-major-optional-award-link-plan.md`
- Branch: `fix/issue-446-validation-allow-short` (non-main/staging)

## Verdict
SEAL

## Isolation proof
Fresh subagent spawned by the coordinator with the prompt "You are a fresh, isolated verifier subagent for the resume-vuejs-website agent-hub ... Run `/worker verifier` ... append the worker-runs.log line with spawn=fresh" — differs from the implementer's task string; this context never saw the implement pass.

## Cited
| Criterion | Evidence in note | OK |
|---|---|---|
| 1 Major "IT" accepted, still required, max 255 | "accepts a short major like \"IT\"" + `education major` 1–255 describe.each pass; FAIL against HEAD models (mutation check) | yes |
| 2 Major EN: empty/short pass, >255 fails | "still apply the VI length rules once filled" (`'CS'` true, 256 false) passes, FAILs on HEAD; "are optional…" passes | yes |
| 3 Award link optional, URL ≤ 100 when filled | "award link > is optional, but a valid URL…" (`''` true, `not-a-url` false, 100 true, 101 false) passes; FAILs on HEAD | yes |
| 4 Project link still required | "project link > is required and max 100 characters" passes | yes |
| 5 test / build / lint / typecheck | `58 passed` / `378 passed`; build tail verbatim ending `✓ built in 3.81s`; lint exit 0; typecheck 78 ≤ baseline 78, 0 in touched files | yes |
| 6 Comments per code-comments.md | one now-false comment removed, none added | yes |
| Feature doc (fix: timeline Behavior #6, simple Behavior #5) | both Behavior lines read in the docs, match the new rules; `## Feature doc changed` cites operator answers 2026-11-07 (timeline OQ6, simple OQ1), recorded in the docs + changelog rows | yes |
| Review | `## Review` present, inline; no correctness/security findings open | yes |
| Supersedes | `none`, grep 446 cited | yes |

## Missing
none

## Forbidden states
- ADHOC_WORK: no — node existed on the diagram (IN_PROGRESS).
- NO_EVIDENCE: no — implementer note present.
- EDIT_UNVERIFIED: no — commands match doctrine/MEMORY.md (test, build, lint, typecheck with baseline count cited); outputs verbatim, not elided.
- CODE_IN_HAVEN: no — diff is under `src/models/`.
- DIAGRAM_DRIFT: no — PM status updated by this verdict.
- MAIN_EDIT: no — branch `fix/issue-446-validation-allow-short`.

## Seal gate
No outward-facing action (no commit/push/API call) — nothing to approve.

## Proportionality
Two one-line model edits + spec updates for the changed rules. Minimal.

## Doctrine proposal
none in note.

## Re-run
none — audit-only; note outputs verbatim, commands match doctrine, criteria covered.

## Risk carried forward
Backend counterpart datvt243/resume-nodejs-api#414 is closed, but whether the deployed Render API already accepts a 1-char major / empty award link was not verified (no live API call). If not deployed, saves will fail server-side until it is.

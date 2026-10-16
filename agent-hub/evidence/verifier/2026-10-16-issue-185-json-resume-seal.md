# 2026-10-16 - issue-185-json-resume — SEAL

- Worker: verifier
- Version: 0.1.0
- Node: `issue-185-json-resume` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- New PM status: `IN_PROGRESS` → `SEALED` (row updated in place)
- Evidence reviewed: `evidence/implementer/2026-10-16-issue-185-json-resume.md`

## Isolation proof
This is a separate Agent-tool subagent that the implementer session launched only to verify. The spawn prompt was: "You are a fresh verifier for the resume-vuejs-website agent-hub ... You were launched as a separate subagent by the implementer session specifically to verify, so NeverVerifyOwnWork is satisfied". The task args were `verifier "agent-hub/evidence/implementer/2026-10-16-issue-185-json-resume.md"`, with the instructions "Do not edit any file under src/" and "do not commit, push, or switch branches". This context has no memory of writing the diff and did not open the source diff (EvidenceOnly). It only ran `git status`/`git diff --stat` to confirm the file list.

## Reasoning
| Criterion | Verdict | Cited |
|---|---|---|
| Branch (NoMainEdit) | OK | `feature/issue-185-json-resume`, cut from `origin/staging` `8683c91` via `gh issue develop`. `git branch --show-current` confirms it, and `git log origin/staging..HEAD` is empty (nothing committed) |
| File list matches the note | OK | `git status --porcelain` shows the 4 modified and 3 untracked `src/` files from the Diff table, plus the diagram row and the evidence note. Nothing extra |
| Commands match doctrine | OK | `npm run test`, `npx vitest run <path>`, `npm run lint`, `npm run build`, `Typecheck: CANNOT RUN (pending add-typecheck-script)` |
| Output not truncated | OK | The result lines are quoted verbatim, with `LINT EXIT 0` and `BUILD EXIT 0` |
| Export candidate → `resume.json` download | OK | `PagePreview.spec.ts` test 1 (filename, `application/json`, basics/work/education from the store). It fails against the old `PagePreview.vue` |
| Export follows the previewed CV (profile + lang) | OK | `PagePreview.spec.ts` test 2 (only `Acme` with `cvActiveProfileId=p1`). The en/vi fallback is tested in `jsonResume.spec.ts` |
| Import `resume.json` → preview → section forms, no auto-save | OK | Import spec: entries listed, `handleBase` never called, "Nguồn: JSON Resume". It fails against the old `PageImportLinkedin.vue` |
| Invalid file handled | OK | Import spec: invalid JSON gives "File JSON không hợp lệ", and non-resume JSON gives the thrown message. Neither shows results |
| Export → import round-trip | OK | `jsonResume.spec.ts` round-trip test |
| LinkedIn/PDF import not regressed | OK | The 4 pre-existing import tests are unchanged and pass on both the old and new code |
| Test suite | OK (disclosed) | 18/18 tests pass in the new and changed specs. The full suite has 1–2 failures, all in `VeeForm.spec.ts`. "VI \| EN toggle" also fails on clean `8683c91` (×4) and was accepted as pre-existing in the #158 and #183 seals. The extra VeeForm "BUG" flake (2/10) is disclosed as timing-dependent and not proven. The diff touches no VeeForm file |
| Build green | OK | `✓ built in 3.58s`, `BUILD EXIT 0` |
| Lint green | OK | `LINT EXIT 0`, after fixing one error in the implementer's own new spec, as disclosed |
| comments per code-comments.md | OK | Overview JSDoc on `jsonResume.ts` and WHY JSDoc on its exports. Two `//` comments: the ongoing `endDate` convention and the legacy `company` field. The header `Description` was updated, and one `//` explains the jsdom `.text()` stub. No issue refs |

Forbidden states:
- ADHOC_WORK: no. The node is on the diagram.
- NO_EVIDENCE: no.
- EDIT_UNVERIFIED: no. Typecheck CANNOT RUN is stated explicitly, and the missing manual browser check is stated as "Not done".
- CODE_IN_HAVEN: no. Only a diagram row was added under `haven/`.
- DIAGRAM_DRIFT: no. The row is now SEALED, updated in place.
- MAIN_EDIT: no.

Seal gate: no outward action was taken. Nothing was committed or pushed, and there is no backend call (the import is client-side). `/ship` is still a separate gated step.

Proportionality: the change covers the issue's export and import points. The import scope (`work`/`education` only) matches the existing LinkedIn review flow, which the issue names as the model ("tương tự luồng import LinkedIn"). The missing sections and skills are explicitly listed as not done. The `applyParsed` extraction is a refactor that reuses the existing code, and the pre-existing tests cover it. The VeeForm flakiness was noted but not fixed. OK.

## Operator notes (not blocking)
- There was no browser click-through of the download or the file picker. Both are covered only by mounted-component specs.
- The exported file was not validated against the official JSON Resume schema.
- Import ignores projects, awards, certificates, references and basics. This is a possible follow-up issue.
- The `VeeForm.spec.ts` flakiness deserves its own node.

## Re-run
`none`. This was an audit only. The note quotes its output verbatim, its commands match doctrine, it covers every criterion, and the node is not outward-facing.

## Verdict
SEAL

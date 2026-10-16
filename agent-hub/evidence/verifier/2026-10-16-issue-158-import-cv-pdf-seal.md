# 2026-10-16 - issue-158-import-cv-pdf — SEAL

- Worker: verifier
- Version: 0.1.0
- Node: `issue-158-import-cv-pdf` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- New PM status: `IN_PROGRESS` → `SEALED` (row updated in place)
- Evidence reviewed: `evidence/implementer/2026-10-16-issue-158-import-cv-pdf.md`

## Isolation proof
Separate Agent-tool subagent launched by the implementer session for verification only. Spawn prompt: "You are a fresh verifier for the resume-vuejs-website agent-hub ... You were launched as a separate subagent by the implementer session specifically to verify, so NeverVerifyOwnWork is satisfied", task args `verifier "agent-hub/evidence/implementer/2026-10-16-issue-158-import-cv-pdf.md"`, with the instruction "Do not edit any file under src/". This context has no memory of writing the diff and did not open it (EvidenceOnly).

## Reasoning
| Criterion | Verdict | Cited |
|---|---|---|
| Branch (NoMainEdit) | OK | `feature/issue-158-import-cv-pdf`, cut from `origin/staging` `4f353d0` |
| Commands match doctrine | OK | `npm run test`, `npm run lint`, `npm run build`, `npx vitest run <path>`, `Typecheck: CANNOT RUN (pending add-typecheck-script)` |
| Output not truncated | OK | Result lines quoted verbatim with exit codes |
| PDF upload from import page | OK | New `.pdf` input and button. Spec test 1 passes on the branch and fails on the old page (`3 failed \| 1 passed (4)`) |
| `POST candidate/parse-cv-pdf`, multipart `file` | OK | Spec test 1 asserts url, method and `FormData.get('file')`. The backend route and shape were read from `../resume-nodejs-api` `origin/main` `9fa0279`, not assumed |
| Review-before-save, no auto-save | OK | Save path unchanged. Spec test 3 asserts `handleBase` is called exactly once (parse only) |
| `extractedText` shown | OK | `<details><pre>` checked by spec tests 3 and 4 |
| LinkedIn import not regressed | OK | Spec test 2 passes on both the old and the new page, and test 4 passes too |
| Test suite | OK (disclosed) | `1 failed \| 202 passed (203)`. The failure is `VeeForm.spec.ts:253` "VI \| EN toggle". The diff does not touch that file. It failed 3/3 runs on clean `4f353d0` in this note, and was already documented as pre-existing in `2026-10-10-issue-187-unsaved-modal-warning.md` and accepted in `2026-10-10-issue-186-visit-stats-seal.md` |
| Build green | OK | `✓ built in 3.56s`, `BUILD EXIT 0` |
| Lint green | OK | `LINT EXIT 0` |
| comments per code-comments.md | OK | Only the `PageImportLinkedin.vue` header Description was touched. It is rewritten as a WHY and the issue refs are removed. The spec adds one WHY `//` |

Forbidden states: ADHOC_WORK no (the node is on the diagram) · NO_EVIDENCE no · EDIT_UNVERIFIED no (Typecheck CANNOT RUN stated explicitly) · CODE_IN_HAVEN no · DIAGRAM_DRIFT no (the row is now SEALED) · MAIN_EDIT no.
Seal gate: no outward action was taken. The live API was not called and nothing was committed or pushed. `/ship` remains a separate gated step.
Proportionality: the nav label change in `LayoutDefault.vue` comes directly from the page now handling PDF. The route and file rename were declined as out of scope, and the VeeForm failure was noted but not fixed. OK.

## Operator notes (from the note, not blocking)
- No manual or visual check in a logged-in dashboard against the live backend. Behaviour is covered by the mounted-component spec only. The layout risk is limited to the 2-button `flex-wrap` row.
- That Render deploys backend `main` (v1.12.0, which has `parse-cv-pdf`) is an assumption, not verified.
- `VeeForm.spec.ts:253` fails deterministically on `staging` and CI does not run `npm run test`. It needs its own node.

## Re-run
none — audit only. The outputs are verbatim, the commands match doctrine, every criterion is cited, and the node is not outward-facing.

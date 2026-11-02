# 2026-11-02 — nodata-dashed-border — SEAL

- Worker: verifier · Version: 0.1.0
- Node: `nodata-dashed-border`
- Evidence reviewed: `evidence/implementer/2026-11-02/nodata-dashed-border-plan.md`

## Isolation proof
Separately spawned Agent subagent (fresh context). It was launched with "You are a fresh, isolated verifier subagent and did not write this diff. Follow the verifier recipe exactly", plus the operator constraints (owner account read-only, owner tabs untouched, writes only with QA accounts in a separate context) and skill args `verifier "agent-hub/evidence/implementer/2026-11-02/nodata-dashed-border-plan.md"`. This context has no memory of writing the diff.

## Verdict: SEAL

## Reason
Every criterion has cited evidence, the commands match `doctrine/MEMORY.md`, and the output is not truncated:
- Criterion 1: the new `NoData.spec.ts` asserts the root has `rounded-md border border-dashed border-line`. Live on education, the empty state is `dashed:flex flex-col items-center rounded-md bo…`. Screenshots `.playwright-mcp/nodata-{skills,education}.png` are present.
- Criterion 2: the post-change grep (`<NoData` with the previous line matching `rounded-md border border-line bg-surface`) returns no output. Live, the only solid border near an empty state on skills is `modal-content`, which belongs to the closed picker modals and is not a wrapper. The specs from `issue-374-nodata-box` were flipped to assert no `.border-line` ancestor.
- Criterion 3: the table files are not in the diff. I confirmed with `git status` that the changed-file set equals the note's diff table: 8 list pages, LoadingGate, PageVisits, PickedSkills, PageSkills, 2 specs and the new NoData spec.
- Criterion 4: `Tests  323 passed (323)` (320 + 3), `✓ built in 3.79s`, lint 0, typecheck 90 (= baseline 90), changed-files grep `grep-exit=1`.

## Cited (OK)
- Branch `feature/nodata-dashed-border` is not main or staging, so there is no MAIN_EDIT.
- Seal gate: the only outward-facing step was the local commit `b8d4e5e`. The operator approved it verbatim ("hãy commit all changed"). Nothing was pushed. `/ship` is left to the operator.
- Proportional: markup-only wrapper removal plus the spec updates it forces.
- Comments row present (contract stated in the spec name).
- Live check was read-only on `qa.empty`, with writes `[]`.

## Missing
none. Two notes, not blockers:
- The `surface-2` background from criterion 1 is not asserted in the spec. It lives in the operator-authored commit `b8d4e5e`.
- The `role="alert"` error wrappers (LoadingGate, PageVisits) are covered by the grep and the diff table only, not by a live check.

## Forbidden hit
none

## Supersedes
The note supersedes the wrapper part of `issue-374-nodata-box`, which is already SEALED and archived. Under RatchetOnly its row is left as is, and this node is the new node that changes that behavior. It is recorded in this node's archive row.

## PM status
SEALED. Collapse on seal: the full row was appended to `haven/diagrams/dev-loop-archive.md`, and the active row was replaced by a pointer. That brought the pointer count to 21, so the oldest pointer (`issue-335-register-names`, already in the archive) was dropped.

## Re-run
none (audit only). I did not repeat any build, lint, test or live run. I only ran `git status` and `ls` to confirm the file set and screenshots.

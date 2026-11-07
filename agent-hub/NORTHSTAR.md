---
title: resume-vuejs-website Northstar
date: 2026-08-20
status: active
authority: 65537
dna: resume_vuejs_website_hub
---

> The Northstar is what does NOT change when everything else does.

## One sentence
Keep resume-vuejs-website (a Vue 3 personal-resume SPA) moving forward through
small, independently-verified diffs — never relying on session memory or
an unproven "should be done."

## What "done" means
A node is done only when **ALL** of the following are true (not just some):

1. Traces to exactly one node on `haven/diagrams/`.
2. Has the smallest diff that qualifies that node (no extra refactor).
3. Ran the project's exact test/build command (from `doctrine/MEMORY.md`)
   and READ THE OUTPUT BACK — not inferred.
4. Has an evidence note at `evidence/<...>/<date>-<slug>.md`.
5. Verifier returned `SEAL` with specific cited evidence.
6. The diagram's PM status table is updated to match.

Missing (3) or (5) → forbidden state `EDIT_UNVERIFIED`.

> Project-specific note: there is currently NO test suite (`npm test`
> doesn't exist — see `doctrine/domains/PROJECT.md`). Until a real test
> suite exists, condition (3) is satisfied by `npm run build` (must be
> green) + manual check via `npm run dev` — evidence must say clearly this
> is build-only, not a real test.

## What this hub does NOT do
- Doesn't edit code outside the `/worker` loop and commit directly →
  `ADHOC_WORK`
- Doesn't claim "build/tests pass" without actually running and reading
  the output → `EDIT_UNVERIFIED`
- Doesn't let scripts/code leak into `haven/` (memory only) →
  `CODE_IN_HAVEN`
- Doesn't silently change code without updating the diagram's PM status →
  `DIAGRAM_DRIFT`
- Doesn't take a real action without an evidence note → `NO_EVIDENCE`

## The success picture (3 months out)
- REOPEN rate trending down in `/hub-health`'s verifier line (the old
  "Times replayed" metric was dropped 2026-11-07 — nothing ever counted it).
- 0 forbidden states in the last 20 evidence notes.
- `doctrine/MEMORY.md` has no `<<FILL>>` left in the command table.
- All 10 known traps in `doctrine/domains/PROJECT.md` are either fixed
  (with evidence) or still open but never repeated by accident.
- Every SEALED node on `haven/diagrams/dev-loop.prime-mermaid.md` points
  to exactly one verifier evidence note.

## Language & token policy
`agent-hub/` is read by AI agents, not by human contributors browsing the
repo — write it in **English**, concise, dense with facts. Skip flourish.
This keeps every session's context window cheaper. Historical entries
written in Vietnamese before 2026-08-22 are kept as-is (append-only rule,
see `evidence/README.md`) — only new content must be English.

## Cross-references
`CLAUDE.md` · `doctrine/MEMORY.md` · `haven/diagrams/dev-loop.prime-mermaid.md`

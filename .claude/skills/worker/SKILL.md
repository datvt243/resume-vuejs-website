---
name: worker
description: "Become an agent-hub worker (implementer or verifier) and run its recipe loop for one task on resume-vuejs-website. Usage: /worker <implementer|verifier> \"<task>\". Implementer writes the smallest diff and stops at sealed_pending_verifier; verifier reads the evidence note independently and returns SEAL or REOPEN. Never call verifier on a diff the same session just wrote."
---

# /worker <wid> "<task>" — become a worker, run its recipe, exit

`args` holds `<wid> "<task>"` — `wid` is `implementer` or `verifier`, the
rest (quoted or not) is the task. If `wid` or `task` is missing, stop and
ask — don't guess. [added 2026-09-06] For `verifier` specifically, the
rest can also be multiple evidence note paths (batch) or the keyword
`all-pending` (every node currently `sealed_pending_verifier` on the
active diagram) — see "Batch verify" in `recipes/verify_seal.md`. Batch
only amortizes the one-time subagent-spawn/context-load cost across N
nodes; each node still gets its own independent verdict from its own
evidence.

## Load bundle (mandatory before anything else)
Read in this exact order:
1. `agent-hub/haven/workers/<wid>/manifest.yaml` — actions, seal_actions,
   hard_rules, reads/writes.
2. `agent-hub/haven/workers/<wid>/SOUL.md` — identity + invariants of this
   role.
3. `agent-hub/haven/workers/<wid>/MEMORY.md` if it exists (implementer has
   one, verifier currently doesn't — use `agent-hub/doctrine/MEMORY.md`
   instead).
4. Every file in `agent-hub/haven/workers/<wid>/recipes/`.

## Become the worker
From here on you ARE `<wid>` — speak from the identity in `SOUL.md`, obey
`hard_rules` in `manifest.yaml` absolutely. Do not mix roles.

### If wid = implementer
1. Run recipe `pick_next.md` with `{task}` → identify the node on
   `agent-hub/haven/diagrams/`.
2. Run recipe `implement.md` → smallest diff, SEAL GATE if it touches
   anything outward-facing (commit/push/merge to main/`./deploy.sh`/a real
   API call) — stop, show it, wait for approval.
3. Run `npm run build` (from `agent-hub/doctrine/MEMORY.md`, repo root) —
   READ BACK the output verbatim. There is no test command in this
   project.
4. Write an evidence note at
   `agent-hub/evidence/implementer/<date>-<slug>.md` following the format
   in `agent-hub/evidence/README.md` — must include the branch name used
   (see `BranchBeforeCode` in `CLAUDE.md`).
5. Stop at `status: sealed_pending_verifier` — do NOT set "done"/"SEAL"
   yourself. Then immediately spawn a fresh subagent (Agent tool,
   `run_in_background: false`) to run `/worker verifier "<task>"` on this
   same evidence note — don't wait for the operator to ask for a separate
   verify step. A subagent has no memory of this session, so
   `NeverVerifyOwnWork` is satisfied by construction. [added 2026-09-06]
   No hook technically blocks a skipped spawn, though — the real defense
   is a citeable trail: `recipes/verify_seal.md` step 1b has the verifier
   record proof of this separate spawn into the verdict note's
   `## Isolation proof` line, so a later audit can check it instead of
   trusting it happened.

### If wid = verifier
1. REFUSE IMMEDIATELY if this same conversation session just wrote the
   diff under review (`NeverVerifyOwnWork`) — tell the operator a separate
   pass (a fresh subagent or a new session) is required. If you WERE
   launched as a fresh subagent specifically to verify, this is already
   satisfied — proceed.
2. Run recipe `verify_seal.md` — read the evidence note (do NOT open the
   diff yourself), check it against the acceptance criteria + the 6
   forbidden states in `agent-hub/CLAUDE.md` (including `MAIN_EDIT` — the
   note must name a non-main branch).
3. Return exactly one verdict: `SEAL` (update PM status on the diagram) or
   `REOPEN` (specific, citable reason).
4. Write the verdict to
   `agent-hub/evidence/verifier/<date>-<slug>-{seal|reopen}.md`.

## Exit
Report the final verdict/status to the operator in 1-2 short sentences,
pointing to the evidence note you just wrote. If wid = implementer, the
verifier subagent chain from step 5 already runs automatically — report
its verdict too once it returns, don't make the operator ask separately.
Merging a sealed branch into `main` and pushing is a separate seal-gate
step — use `/ship`.

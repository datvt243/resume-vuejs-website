> Evidence is who did what and why (`NO_EVIDENCE` if missing). Every
> worker action ends with a note.

## Layout
```
evidence/implementer/<date>-<slug>.md
evidence/verifier/<date>-<slug>-{seal|reopen}.md
evidence/worker-runs.log
```
Date as `YYYY-mm-dd`, slug kebab-case derived from the task name. Flat
files — no nested `<date>/` subfolder (this is the convention actually
used by every note in this directory; ignore any older doc that says
otherwise).

## Format — implementer note
- Title (date - node) · Worker · Version · Node (points to the diagram) ·
  Task (verbatim prompt)
- `## Hub bytes before` — [added 2026-09-02] byte count measured at
  `pick_next` step 7, before the diff starts — the verifier reads this
  back when writing `worker-runs.log`, don't skip it
- `## Branch` — the dedicated branch checked out from `main` before
  changing any file (required — see `CLAUDE.md` → Branching rule; missing
  this line = verifier REOPEN with `MAIN_EDIT`)
- `## Diff` — files | file | why |
- `## Command` — the exact command from `doctrine/MEMORY.md` (e.g. `npm
  run build` from repo root — this project has no separate test command)
- `## Output` — verbatim, no paraphrasing
- `## Acceptance` — table | Criterion | Evidence | (evidence points to a
  specific output line — never just say "build passed," quote it
  verbatim, e.g. `✓ built in 3.21s`)
- `## Noticed, not done` — things spotted outside scope but not fixed
  (e.g. another trap in `doctrine/domains/PROJECT.md` not part of this
  task)
- `## Seal gate` — record the approval if there's an outward-facing
  action (commit/push/deploy), or "none"

## Format — verifier verdict
- Worker · Node · New PM status (PENDING/SEALED/REOPEN)
- `## Isolation proof` — [added 2026-09-06, fed back from real production
  use in `datvt243.github.io`] cites whatever makes this a genuinely
  separate subagent spawn (see `recipes/verify_seal.md` step 1b) — not
  technically enforced by a hook, but a missing/suspicious line here is
  itself citeable evidence for a later audit that `NeverVerifyOwnWork`'s
  subagent-isolation step was skipped.
- `## Reasoning` — cite evidence for each criterion
- `## Missing` — only present on REOPEN
- `## Re-run` — [added 2026-09-02] `none`/`partial`/`full`, declared
  honestly per what was actually done (see "Re-run scope" in
  `recipes/verify_seal.md`), with a reason if not `none`. The verifier
  reads this back when writing `worker-runs.log` — not decorative.

## Format — worker-runs.log
- [added 2026-09-02] NOT a narrative note like the ones above — an
  **append-only file, 1 line per implementer or verifier pass that ends**.
  Written by `pick_next.md`/`implement.md`/`verify_seal.md` themselves.
- Two line shapes:
  - Implementer (only on `blocked`/`failed`, never reaching the verifier):
    `<ISO timestamp> role=implementer outcome=blocked|failed node=<slug>
    hub_bytes_before=<N> verifier_rerun=n/a`
  - Verifier (every verdict — SEAL or REOPEN):
    `<ISO timestamp> role=verifier outcome=SEAL|REOPEN node=<slug>
    rerun=none|partial|full hub_bytes_before=<N> hub_bytes_after=<N>`
  `hub_bytes_*` use this hub's own `/hub-tokens` "per-session total"
  formula.
- One line per round-trip, not one per node's whole lifetime — a node
  REOPENed 3 times has 3 verifier lines sharing the same `node=`.
- **Purpose**: real, non-inferred data to spot patterns later — repeated
  REOPEN, a verifier re-running despite the audit-only default, an
  unusual jump in hub size between two runs. Not a real token count.
- Cold storage — not re-read wholesale every worker session, only opened
  when someone audits patterns on purpose. NEVER delete a line.

## The three rules of this directory
1. **VERBATIM, ALWAYS** — never claim something without a real citable
   quote.
2. **NEVER DELETE** — a wrong note gets a correction appended, not
   deleted.
3. **BAD NOTES STAY** — a "task failed" note is kept; a clean trail
   matters less than preserving the doctrine's actual value.

## Language
New notes from 2026-08-22 onward should be written in English (see
`NORTHSTAR.md` → Language & token policy) — concise, facts first. Notes
written before that date stay in Vietnamese as historical record; don't
retranslate them, only append corrections in English if they need one.

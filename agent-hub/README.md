# agent-hub — resume-vuejs-website

This is the "persistent memory" of the **resume-vuejs-website** project (Resume/CV
management SPA, Vue 3 + Vite). It is NOT code — it is plain markdown:
doctrine (verified facts), haven (memory + conventions of the 2 AI workers),
evidence (audit trail). The real code lives in `../src/` as usual.

## Philosophy
The intelligence is not in the model — the model is labor hired per session,
reset every time it reopens. The intelligence lives in `doctrine/` (facts),
`haven/*/recipes/` (saved processes), and `haven/*/MEMORY.md` (each worker's
own accumulated craft) — things that are SAVED, not lost when the session ends.

## Where to start
1. Human reader: `NORTHSTAR.md` → `doctrine/domains/PROJECT.md` → this file.
2. Agent starting a session: run `/boot` (don't read this file by hand).

## Daily loop
```
/boot                              # 60 seconds, read-only, changes nothing
/worker implementer "<task>"       # implement + evidence note
/worker verifier "<task>"          # SEAL or REOPEN
```
Or combine the two: `/todo "<task>"` — still runs separate implementer →
verifier passes inside, only the command you type differs.

## Structure
```
agent-hub/
├── NORTHSTAR.md, CLAUDE.md, BOOT.md, INDEX.md, README.md
├── doctrine/        # verified facts
├── haven/           # memory + conventions of implementer/verifier
└── evidence/        # audit trail, committed to git, append-only

.claude/skills/       # the real harness: /boot, /worker, /todo
```

Full details: `INDEX.md` (file map) · `doctrine/domains/PROJECT.md`
(project ground truth) · `doctrine/MEMORY.md` (exact commands).

# 2026-10-19 - issue-226-dev-port - SEAL

- Worker: verifier
- Version: 0.1.0
- Node: `issue-226-dev-port` in `haven/diagrams/dev-loop.prime-mermaid.md`
- Input: `evidence/implementer/2026-10-19-issue-226-dev-port.md`
- Verdict: **SEAL**

## Isolation proof
Spawned as a separate Agent-tool subagent by the implementer session for task #226, with a fresh context whose task string was: `verifier "agent-hub/evidence/implementer/2026-10-19-issue-226-dev-port.md"` (plus the instruction not to touch `vite.config.ts`, `.env*` or `src/`, and not to start a server on 5173). This context did not write the diff and never opened it; it read only the evidence note.

## Re-run
`none` - audit-only. The output is verbatim, the commands match `doctrine/MEMORY.md` (`npm run test`, `npm run build`, Typecheck declared CANNOT RUN), and the node is not outward-facing.

## Acceptance (from issue #226 "Hướng sửa" + node row)
| Criterion | Cited evidence | OK |
|---|---|---|
| `PORT` read from env via `loadEnv` so `.env*` works | `--mode porttest` with `PORT=5191` in a file → `Local: http://localhost:5191/...` | yes |
| Shell env `PORT` honored | `PORT=5180` → `Local: http://localhost:5180/...`, `http 200` | yes |
| Default 5173 | Plain `npx vite` with no `PORT` in the shell tried 5173 (`Port 5173 is already in use`); `.env.development` `PORT=5173` | yes |
| `strictPort: true` fails loudly instead of drifting | `Error: Port 5173 is already in use` | yes |
| `PORT` declared in `.env.example` + `.env.development` | Diff table | yes |
| Build green, base unchanged | `✓ built in 9.15s`; `src="/resume-vuejs-website/` | yes |
| Tests: no new failure | 1 failure, `VeeForm > VI \| EN toggle > flags the hidden language...`. That same test fails on clean `origin/staging` in `evidence/implementer/2026-10-19-issue-212-form-select-dark.md` line 44. The diff touches no `src/` | yes |
| Typecheck row | Explicitly `CANNOT RUN - pending add-typecheck-script` | yes |
| Comments per code-comments.md | Two `//` WHY lines (`''` prefix on `loadEnv`, `strictPort` against CORS), no issue refs | yes |

## Forbidden states
- `ADHOC_WORK`: clear, the node row exists.
- `NO_EVIDENCE`: clear, the note exists.
- `EDIT_UNVERIFIED`: clear, every claim has real output.
- `CODE_IN_HAVEN`: clear, the only haven change is a diagram row.
- `DIAGRAM_DRIFT`: clear, the row is now SEALED.
- `MAIN_EDIT`: clear, the branch is `fix/issue-226-dev-port`, cut from `staging`.

## Seal gate / proportionality
- Nothing was committed or pushed, so no approval is needed. Shipping goes through `/ship`.
- Scope matches the issue exactly. The stale `.env` `BASE_URL` was noted and deliberately left alone, not fixed opportunistically.

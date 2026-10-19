# 2026-10-19 - issue-226-dev-port

- Worker: implementer
- Version: 0.1.0
- Node: `issue-226-dev-port` in `haven/diagrams/dev-loop.prime-mermaid.md` (PM row appended at end of table, `IN_PROGRESS`)
- Task (verbatim): npm run dev mỗi lần chạy lại port khác nhau, bị lỗi CORS, hãy khai báo env PORT — issue https://github.com/datvt243/resume-vuejs-website/issues/226

## Hub bytes before: 178204

## Branch
`fix/issue-226-dev-port` — created from freshly pulled `staging` via `gh issue develop 226 --checkout --base staging` (linked to #226). Not `main`, not `staging`.

## Diff
| File | Why |
|---|---|
| `vite.config.ts` | Switch to the `defineConfig(({ mode }) => …)` form. `server.port` comes from `PORT`: read with `loadEnv(mode, process.cwd(), '')` so `.env*` files work, shell env overrides it, default 5173. `strictPort: true` makes Vite fail on a busy port instead of moving to 5174+, which the API's CORS allowlist rejects. `base` deliberately still reads `process.env.BASE_URL` only, same as before: the gitignored local `.env` contains a stale `BASE_URL=/vue-resume-web/`, and routing it through `loadEnv` would have silently changed the base path. |
| `.env.development` | `PORT=5173` (committed defaults file). |
| `.env.example` | Document `PORT` with a one-line reason. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Append node row. |

## Command
From repo root:
- Busy port: with the existing dev server on 5173 (`node 42510 [::1]:5173`), run `npx vite`.
- Shell override: `PORT=5180 npx vite`, then `curl http://localhost:5180/resume-vuejs-website/`.
- `.env` file: write a temporary `.env.porttest` containing `PORT=5191`, run `npx vite --mode porttest`, then delete the file.
- `npm run build`, plus a check of the base path in `dist/index.html`.
- `npm run test`
- Typecheck: CANNOT RUN — pending add-typecheck-script.

## Output
Busy port:
```
error when starting dev server:
Error: Port 5173 is already in use
```
`PORT=5180`:
```
  ➜  Local:   http://localhost:5180/resume-vuejs-website/
http 200
```
`--mode porttest` (`PORT=5191` from file):
```
  ➜  Local:   http://localhost:5191/resume-vuejs-website/
```
`npm run build`:
```
✓ built in 9.15s
```
`grep -o 'src="/[^/]*/' dist/index.html` → `src="/resume-vuejs-website/` (base unchanged).
`npm run test`:
```
   × VeeForm > VI | EN toggle > flags the hidden language that has a validation error 34ms
 Test Files  1 failed | 34 passed (35)
      Tests  1 failed | 227 passed (228)
```
`VeeForm.spec.ts` was already failing on clean `origin/staging` (see `evidence/implementer/2026-10-19-issue-212-form-select-dark.md`). The failing test differs from run to run, and this diff touches no `src/` file.

## Acceptance
| Criterion | Evidence |
|---|---|
| Port no longer drifts: busy port fails loudly | `Error: Port 5173 is already in use` |
| `PORT` from shell env honored | `Local: http://localhost:5180/…`, `http 200` |
| `PORT` from `.env*` file honored | `Local: http://localhost:5191/…` |
| Default stays 5173 | `.env.development` `PORT=5173`, fallback `|| 5173` |
| Build + base path unchanged | `✓ built in 9.15s`, `src="/resume-vuejs-website/` |
| Tests: no new failure | Only the flaky `VeeForm.spec.ts`, which also fails on `staging` |
| Comments per code-comments.md | Two `//` lines giving the WHY: why the `''` prefix on `loadEnv`, and why `strictPort` (CORS). No issue refs. |

## Noticed, not done
- The local gitignored `.env` has a stale `BASE_URL=/vue-resume-web/` (old repo name). It is harmless today because `base` doesn't read `.env`. Operator may want to delete that line.
- `VeeForm.spec.ts` is flaky on `staging` and needs its own issue.
- `strictPort` means that if a stale dev server is still running, `npm run dev` now errors. The fix is to stop the old server, which is intended.

## Seal gate
None in this pass (no commit/push). Ship via `/ship` after verifier SEAL.

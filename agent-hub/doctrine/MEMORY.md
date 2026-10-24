> If any other doc conflicts with this file on a path or command, THIS
> FILE WINS. One home per fact — a command living in two files will drift
> wrong in one of them.
>
> Authority: 65537

## What this is
- Hub path (absolute): `/Users/_david/Workspace/Project/resume/resume-vuejs-website/agent-hub`
- Code repo path (absolute): `/Users/_david/Workspace/Project/resume/resume-vuejs-website`
- Repo remote: `https://github.com/datvt243/resume-vuejs-website.git`, branch `main` (repo renamed 2026-08-31, was `vue-resume-web`; path also moved out of `ResumeAPI/frontend`)
- Hub ↔ repo relationship: the hub only touches the repo through a
  worker, with a real build/run result and an evidence note — never
  ad-hoc.

## The exact commands
> COPY these — never type them from memory. A remembered command drifts,
> and a drifted command proves the wrong thing.

| Purpose | Command | Run from |
|---|---|---|
| Test | `npm run test` (= `vitest run`) — added 2026-08-25, issue #7. Real, covers `src/utilities/`, `src/stores/{auth,candidate}`, `src/composables/{useDocument,useCandidate,useTheme,useInitTable,useHelper}`, `src/components/veevalidate/VeeForm.vue` (76 tests total, 2026-09-01). All `.vue` components except `VeeForm.vue` still untested — see `domains/PROJECT.md` → Traps. | repo root |
| Test + coverage | `npm run test:coverage` (= `vitest run --coverage`, `@vitest/coverage-v8`) — added 2026-09-01, issue #7. Scoped to `src/{utilities,stores,composables}/**` (matches issue #7's own "business logic" target, not full-app). Measured 2026-09-01 (post `useHelper.ts` coverage, `issue-7-usehelper-composable-tests`): **96.33% statements / 91.11% branches** — issue #7's stated `>60%` target is met by a wide margin. Only remaining 0%-covered file in scope: `src/composables/index.ts` (barrel re-export, no executable logic — not a real gap). | repo root |
| Test one file | `npx vitest run <path>` | repo root |
| Build | `npm run build` (output: `dist/`) | repo root |
| Lint | `npm run lint` (`eslint-plugin-vue@^9` + `@rushstack/eslint-patch` installed, `.eslintrc.cjs` has `overrides` for `.ts`/`.vue` — fixed 2026-08-20). Currently reports **95 real errors** (`no-unused-vars`, `vue/multi-word-component-names`...) NOT YET fixed — don't claim "lint pass" until cleaned up. | repo root |
| Typecheck | `npm run typecheck` (= `vue-tsc --noEmit`, `vue-tsc@^3.3.13`) — added 2026-10-24, issue #295. Checks `.ts` AND `.vue`. Baseline: **90 pre-existing errors** (exit 2) on `staging` @ v1.34.0, mostly `TS7006`/`TS2339` in `src/stores/candidate.ts`, `src/services/{base,auth}.ts` — not yet fixed. Until cleaned up, a diff passes typecheck when it adds no new error (count ≤ baseline, none in changed files) — cite the count. | repo root |
| Run locally | `npm run dev` → http://localhost:5173 | repo root |
| Preview build | `npm run preview` | repo root |
| Deploy (outward-facing — SEAL GATE) | **NO LONGER MANUAL** — `deploy.sh` was removed (issue #16, 2026-08-20). Deploy is now automatic via `.github/workflows/deploy.yml` on every push to `main` (build + `peaceiris/actions-gh-pages@v4` to `gh-pages`). The Seal Gate now lives at the `/ship` merge-into-`main` step — merging triggers deploy automatically, no separate deploy-approval step. | GitHub Actions (not run locally) |
| CI (runs automatically) | `.github/workflows/ci.yml` — lint + build, runs on every push/PR to `main` OR `staging` (added `staging` 2026-09-01, audit finding — every day-to-day `/ship` PR into `staging` was previously getting zero independent CI check, only the agent's self-reported local build/lint) (issue #20). NO typecheck step yet — `npm run typecheck` works now (issue #295) but its 90-error baseline would turn CI red; add the step once the baseline is 0. | GitHub Actions |

**Updated 2026-08-25 (issue #7):** `npm run test` is real now, but only
covers `src/utilities/`. For a node whose diff touches code with an
existing `.spec.ts`, run `npm run test` for real evidence. For anything
else (stores/composables/components — no tests yet), NORTHSTAR.md's "done"
condition (3) still falls back to a green `npm run build` + manual check
via `npm run dev` — the implementer MUST state clearly which case applies,
not blur the two. `.github/workflows/ci.yml` does NOT run `npm run test`
yet (still lint + build only) — noted as follow-up, not done here.

## Stack
| Thing | Value |
|---|---|
| Language/runtime | Node.js ≥ 18 (per README) · Vue 3 (Composition API + `<script setup>`) · TypeScript (partial, mixed with `.js`) |
| Package manager | npm (`package-lock.json` is the source of truth) — NOTE: `yarn.lock` also exists in parallel, this is a trap, see `domains/PROJECT.md` |
| Build tool | Vite 5, alias `@` → `src/` (declared in both `vite.config.ts` and `tsconfig.json`) |
| Test runner | None |
| State management | Pinia (`src/stores/auth.js`, `src/stores/candidate.js`) |
| HTTP | Axios (`src/services/axios.js`), base URL from `src/config/api.config.js` |

## The default way to work
`/boot` → `/worker implementer "<task>"` → verifier auto-spawned as a
subagent right after implementer seals (don't wait for the operator to
type a separate `/worker verifier` request — that ceremony is no longer
needed; just launch it). Never skip step 1 on a cold session, never skip
the verifier pass.

## Git workflow (mandatory, see `CLAUDE.md` → Branching rule)
> **2026-08-30**: 2-tier release model. `main` and `staging` are both
> GitHub branch-protected (PR required, 0 approvals, `enforce_admins:
> true`) — raw `git push` to either is rejected (`GH006`), verified. See
> `CONTRIBUTING.md` for the full reasoning (why 0 approvals, why
> merge-not-squash at release).
- NEVER edit/commit directly on `main` OR `staging`. Every task → its own
  branch cut from `staging` before touching any file, named by type:
  `fix/issue-<n>-<slug>` (bugfix) · `feature/<slug>` (new feature) ·
  `chore/<slug>`/`docs/<slug>` (other).
- Merging that branch into `staging` is outward-facing → goes through the
  Seal Gate, wait for operator approval before merging (the `/ship`
  command does this via `gh pr create --base staging` + `gh pr merge`
  once invoked — never a raw `git merge && git push`, both rejected).
- After merge: `fix/*` gets deleted; `feature/*` is KEPT locally;
  everything else deleted by default. See `.claude/skills/ship/SKILL.md`.
- `staging → main` is a SEPARATE step, `/release`
  (`.claude/skills/release/SKILL.md`) — real build+lint gate, semver
  bump, tag, never done by `/ship`.
- The implementer's evidence note must name the branch used.

## Workers
| wid | Role | Actions | Seal actions |
|---|---|---|---|
| implementer | Implementer | pick_next, implement | — |
| verifier | Verifier | verify_seal | SEAL, REOPEN |

## Forbidden states
6 states — see `CLAUDE.md` for details. These states OVERRIDE any other
skill text.

## Facts that are always true
- No LLM API key anywhere in the hub — Claude Code IS the runtime.
- `haven/` is memory, not code.
- `evidence/` is committed; "bad" notes are kept too.
- Monotonic ratchet: PENDING → IN_PROGRESS → SEALED, never backward.
- Verifier owns PM status; implementer never sets it itself.
- Backend API (`https://nodejs-resume-api-ts.onrender.com/api/v1/`) runs
  on Render's free tier — cold start ~30s on first call, don't mistake
  that for an error.

## Open `<<FILL>>` values
None left — every command in the table above was verified directly
against `package.json`, `node_modules`, and the real repo filesystem at
hub-init time (2026-08-20). If `package.json` scripts change (e.g. `lint`
or `test` added), fix the table above IMMEDIATELY and log the correction
in `haven/workers/implementer/MEMORY.md`.

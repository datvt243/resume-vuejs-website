# 2026-10-21 - issue-251-ci-lockfile

- Worker: implementer
- Version: 0.1.0
- Node: `issue-251-ci-lockfile` in `haven/diagrams/dev-loop.prime-mermaid.md` (new row appended after `issue-251-lang-switch-left-tooltip`, `IN_PROGRESS`). New node, not an edit of the SEALED #251 rows (LAI-13).
- Task: operator asked "ship merge xong release" (ship #251, merge, release). `/ship` (PR #253) and `/release` v1.23.0 (PRs #254, #255, tag `v1.23.0`) ran, but the deploy run failed. This pass fixes that regression so the release can actually deploy. https://github.com/datvt243/resume-vuejs-website/issues/251

## Hub bytes before: 200289
From the previous `worker-runs.log` line's `hub_bytes_after`.

## Branch
`fix/issue-251-ci-lockfile`, created from `staging` (after the v1.23.0 bump, `9472fd5`). Not `main`, not `staging`.

## What broke
- Deploy run https://github.com/datvt243/resume-vuejs-website/actions/runs/39468949247 (`main`, `0dfbe6a`) failed at "Install dependencies":
  ```
  npm warn EBADENGINE   package: 'vue-i18n@11.4.13',
  npm warn EBADENGINE   required: { node: '>= 22' },
  npm warn EBADENGINE   current: { node: 'v20.20.2', npm: '10.8.2' }
  npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.
  npm error Missing: yaml@2.9.1 from lock file
  ```
- CI history (`gh run list --workflow=ci.yml`): last green was `f4edb61` (#250 merge into staging). Every run from `b240e60` (#251 PR) on failed, including the PR #253 check. `staging`'s protection doesn't require checks, so `gh pr merge` didn't block — the merges went through on a red check. Missed by the previous `/ship` + `/release` passes.
- Root cause: `npm i vue-i18n@11.4.13` was run with local npm 11.17.0 (node v24.19.0). The lock it wrote is accepted by npm 11 but not by CI's npm 10.8.2 (`.github/workflows/{ci,deploy}.yml` use `node-version: '20'`). Separately, vue-i18n declares `engines.node: >= 22` from 11.4.3 on (`npm view vue-i18n@<v> engines.node`: 11.4.2 `>= 16`, 11.4.3 `>= 22`, … 11.4.13 `>= 22`).
- Production impact: none observed — the deploy job stopped before build/publish, so gh-pages still serves the v1.22.0 build.

## Diff
| File | Why |
|---|---|
| `package.json` | `"vue-i18n": "11.4.2"` (exact). Newest version whose `engines.node` allows Node 20 (published 2026-05-07). Exact pin so a fresh `npm install` can't float to a `>= 22` release while CI is on Node 20. |
| `package-lock.json` | Regenerated with `npx npm@10.8.2 install vue-i18n@11.4.2 --save-exact --package-lock-only --ignore-scripts` (CI's npm version). 51 insertions, 33 deletions. |

`yarn.lock`: `npm ci` touched it again; restored with `git checkout -- yarn.lock` (same as the #251 note; CI uses npm only).

## Command
From repo root:
- Repro (scratch copy of package.json + lock, before fix): `npx -y npm@10.8.2 ci --dry-run --ignore-scripts`
- After fix, same check in scratch: `npx -y npm@10.8.2 ci --dry-run --ignore-scripts`
- In repo: `npx -y npm@10.8.2 ci --ignore-scripts`, then `npm run test`, `npm run build`, `npm run lint`
- Typecheck: CANNOT RUN — pending add-typecheck-script

## Output
Repro before fix (npm 10.8.2):
```
npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. …
npm error Missing: yaml@2.9.1 from lock file
```
After fix (npm 10.8.2 dry-run): `npm error` count `0`. Lock entry:
```
"node_modules/vue-i18n": {
    "version": "11.4.2",
    "resolved": "https://registry.npmjs.org/vue-i18n/-/vue-i18n-11.4.2.tgz",
```
Repo install: `added 1289 packages, and audited 1290 packages in 17s`; `node_modules/vue-i18n/package.json` version `11.4.2`.

`npm run test`:
```
 FAIL  src/components/veevalidate/VeeForm.spec.ts > VeeForm > VI | EN toggle > flags the hidden language that has a validation error
 Test Files  1 failed | 39 passed (40)
      Tests  1 failed | 254 passed (255)
```
Same counts as with 11.4.13; the one failure is the pre-existing `staging` failure.

`npm run build`: `✓ built in 3.73s`

`npm run lint`: `eslint src --ext .js,.ts,.vue` printed no errors.

`.github/workflows/ci.yml` and `deploy.yml` run only `npm ci`, `npm run lint`, `npm run build` (lines 21/24/27 and 22/25/28) — all three reproduced green locally under npm 10.8.2. Local node is v24, not 20, so this is not a byte-identical CI run; the PR's own CI check is the final proof (see Seal gate).

## Acceptance
| Criterion | Evidence |
|---|---|
| `npm ci` accepts the lock under CI's npm 10.8.2 | Dry-run `npm error` count 0 after fix (was `Missing: yaml@2.9.1`). |
| vue-i18n supports CI's Node 20 | 11.4.2 `engines.node: >= 16`. |
| App behaviour unchanged | Same test counts (254 passed, same pre-existing failure); build + lint green. vue-i18n API used (`createI18n` composition mode, `global.locale`, `$t`) exists in 11.4.2 — specs for i18n/LangSwitch/useCvLang pass. |
| Comments per code-comments.md | No code comments added (JSON + lockfile only). |

## Noticed, not done
- CI checks aren't required on `staging`/`main` branch protection, so a red check doesn't block `gh pr merge`. `/ship` and `/release` don't wait for or read CI either. Worth adding a "wait for green checks" step (or required status checks) — operator decision.
- Node 20 reached end-of-life in April 2026; moving CI/deploy to Node 22 would allow current vue-i18n. Out of scope here.
- Local npm (11.17.0) vs CI npm (10.8.2) mismatch will keep producing locks CI rejects; no `engines`/`.nvmrc` pins the toolchain.

## Seal gate
Not yet — commit/PR/merge and the follow-up patch release are outward-facing. Plan: PR into `staging`, wait for its CI check to pass before merging, then `/release patch` (v1.23.1), and confirm the deploy run succeeds.

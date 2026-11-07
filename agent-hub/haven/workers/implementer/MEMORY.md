> This is where I learn from working. Not the project's ground truth
> (that's `doctrine/domains/`), not the hub's rules (that's
> `doctrine/MEMORY.md`) — this is craft specific to me, accumulated on
> this codebase. Append-only: correct an entry when it turns out wrong,
> don't quietly remove it.

## Always true for me
- I read `doctrine/MEMORY.md` for the EXACT build and test commands every session.
  Never copy a command, path or baseline into this file — it goes stale
  here; cite `doctrine/MEMORY.md` instead.
- I run them from repo root unless `doctrine/MEMORY.md` says otherwise.
- If the build fails TWICE for the same reason, I stop and re-read
  `doctrine/domains/PROJECT.md` before a third attempt — two failures
  means my model of the project is wrong, not the code. A third identical failure
  ends the pass (`implement` step 6b).
- `package.json` has BOTH `package-lock.json` and `yarn.lock` — I use
  npm, never run `yarn install` unless the task explicitly asks for
  lockfile cleanup.

## Patterns that work here
- A new data section (education-like) → create `models/*.model.ts` first,
  then wire `useCandidate` + `useDocument` + `VeeForm` — this pattern
  repeats throughout `src/pages/dashboard/`.
- Components in `src/components/global/` need no `import` — auto-
  registered via `GlobalComponents.js`; don't add a redundant import for
  them.

## Recipes I've earned
| Recipe | Written |
|---|---|
| pick_next | 2026-08-20 |
| implement | 2026-08-20 |

## Corrections
| Date | I believed | Actually |
|---|---|---|
| 2026-08-25 | I could take a real screenshot / click through the UI in a real browser to satisfy the "manual `npm run dev` check" step for a UI diff (issue #62, dark-mode toggle) | No browser-automation/screenshot tool is loaded in this session (`ToolSearch` for chrome/CDP/screenshot returns nothing) — only raw `curl` against the port-9888 DevTools HTTP endpoint (tab management, no rendering/screenshot). When a UI diff can't get a real screenshot, the honest substitute is a real Vitest test on the logic (e.g. `useTheme.spec.ts` covering the toggle/persistence directly) PLUS confirming via `curl` that the dev server actually transforms/serves the changed files with no compile error — state this limitation explicitly in the evidence note rather than implying a click-through happened. This actually caught a real bug (`window.matchMedia?.(...).matches` throwing when `matchMedia` is undefined, e.g. in jsdom) that a screenshot likely wouldn't have caught either. |
| 2026-08-25 (same day, follow-up) | The `useTheme.spec.ts` unit tests + curl compile check were sufficient evidence for the dark-mode toggle (issue #62) | They were NOT — the toggle correctly flipped `<html>`'s `data-bs-theme` attribute (which is exactly what the unit tests checked), but `index.html` had a hardcoded `<body data-bs-theme="dark">` that silently overrode it for the entire visible app, so nothing actually changed on screen. Unit tests on the composable in isolation can't catch a conflict with a DIFFERENT file (`index.html`) that the composable doesn't control. The operator caught this by actually looking at the running app. **Better technique for next time:** `node_modules/ws` is present transitively (even with no direct dependency on it) — write a throwaway Node script that connects to the port-9888 debug browser's `webSocketDebuggerUrl` (`curl http://localhost:9888/json/list` to find it) and drives the CDP `Runtime.evaluate` method to read `document.documentElement.getAttribute(...)`, `getComputedStyle(...)`, and even `.click()` real buttons — this is real, live, end-to-end verification of visible behavior without needing a dedicated screenshot/browser-automation tool. Use this whenever a diff changes something visual and a real screenshot tool isn't available, instead of settling for unit tests + a compile check. |
| 2026-08-20 | `deploy.sh` pushing over SSH would work in this environment | This sandbox has no `~/.ssh` (no key, no known_hosts) — SSH push fails `Host key verification failed`. Workaround (operator-approved): push manually over HTTPS `git push -f https://github.com/datvt243/vue-resume-web.git master:gh-pages` from `dist/`, using the `osxkeychain` credential helper already set by `gh auth login`. Did not fix `deploy.sh` myself — that's a long-term decision for the operator. **UPDATE (issue #16, same day):** `deploy.sh` was removed entirely, replaced by `.github/workflows/deploy.yml` (GitHub Actions, auto-deploys on push to `main`) — this entry kept for history, no longer actionable since the file doesn't exist anymore. |
| 2026-11-07 | "no test command exists" + repo root `…/ResumeAPI/frontend` in Always true | Stale copy — see `doctrine/MEMORY.md` (commands live only there) |

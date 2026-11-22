# 2026-11-22 - issue-449-profile-stale-ids

- Worker: implementer · Version: 0.1.0
- Node: `issue-449-profile-stale-ids` (`haven/diagrams/dev-loop.prime-mermaid.md`, IN_PROGRESS)
- Branch: `fix/issue-449-cv-profiles-summary` (off `staging` @ 13d29db, linked to #449 via `gh issue develop`)
- Task: #449 "CV profiles: summary counts should ignore deleted entries" — deleting an entry doesn't remove its id from profiles, so the card summary ("2 education · 3 experience") still counts it. Expected: the summary counts only ids that match an existing entry of that section.

## Hub bytes before: 100311

## Feature doc: doctrine/features/cv-profiles.md (Behavior #1 card summary; Open question 2 answered by operator 2026-11-07: "Bug: count only existing entries — #449"). Doc not changed — the fix restores what the answer specifies.

## Acceptance criteria (node)
1. Card summary + "N items selected" count only ids present in that section's loaded list (matches `features/cv-profiles.md` Behavior #1 + Open question 2 answer).
2. A test proves a stale id is not counted, and fails without the fix.
3. `npm run test`, `npm run lint`, `npm run build` pass; `npm run typecheck` ≤ 78 baseline, none in changed files.

## Diff
| File | Why |
|---|---|
| `src/pages/dashboard/PageProfile.vue` | New `countExisting(ids, s)` — ids that match an `_id` in `s.items`. Used by `countSelected` (card subTitle), `summarize` (card description) and the modal's per-section `x/y` count (same stale-id inflation, e.g. "3/2"). Saved data / payload unchanged: `resetSelectedIds` still copies raw ids, so editing before lists load can't wipe a profile's ids. |
| `src/pages/dashboard/PageProfile.spec.ts` (new) | Mounts the page with a profile holding `['e1','gone']` and only `e1` in experiences → card reads `1 items selected|1 experience`. |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | Node row. |

Not touched: `.claude/skills/todo/SKILL.md` was already modified before this task (operator's own change, carried onto the branch) — not part of this node.

## Command
- `npm run test` · `npm run lint` · `npm run build` · `npm run typecheck` (doctrine/MEMORY.md rows, repo root)
- `npx vitest run src/pages/dashboard/PageProfile.spec.ts`

## Output
```
npx vitest run src/pages/dashboard/PageProfile.spec.ts   (with fix)
      Tests  1 passed (1)

same spec with PageProfile.vue reverted (git stash push src/pages/dashboard/PageProfile.vue)
Received: "2 items selected|2 experience"
      Tests  1 failed (1)
(stash popped, fix restored)

npm run test → exit 0
 Test Files  65 passed (65)
      Tests  419 passed (419)

npm run build → exit 0
✓ built in 3.85s

npm run lint → exit 0
> eslint src --ext .js,.ts,.vue
(no errors)

npm run typecheck → exit 2
grep -c "error TS" → 78
grep PageProfile → (no output)
(first run was 80: 2 errors in the new spec — TS7031/TS7053 on the mock's `field` param; typed `{ field: string }` + `Record<string, ReturnType<typeof ref>>`, re-run → 78, 0 in changed files)
```

Dev server (started by this session, stopped after; no other server was listening on :5173 beforehand):
```
GET http://localhost:5173/ → 302 → base http://localhost:5173/resume-vuejs-website/
GET .../src/pages/dashboard/PageProfile.vue → 200, transformed module contains countExisting (5 refs)
vite.log: no "error" lines
after stop: :5173 → 000
```
Limitation: no logged-in click-through — reproducing needs a profile with a deleted entry's id on a QA account (a write). The behavior is covered by the mounted spec above instead.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1. Counts ignore stale ids (card subTitle + description + modal x/y) | Diff row 1; spec asserts card `1 items selected|1 experience` |
| 2. Test proves it, fails without fix | Output: passes with fix, `Received: "2 items selected|2 experience"` without |
| 3. test/lint/build pass, typecheck ≤ 78 none in changed files | Output block: 65/65 files, lint 0, build ✓, typecheck 78, `grep PageProfile` empty |
| Comments per code-comments.md | One `//` one-liner (WHY: deleted entries leave ids behind); issue ref removed per "Delete" rule; spec has one fixture comment |

## Supersedes: none
## Still open: none
(`grep -n "449" haven/diagrams/dev-loop.prime-mermaid.md` → only this node's row; `dev-loop-archive.md` → no match)

## Review
`/code-review` skill not run as a separate pass — done inline per implement step 6c (touched file read in full + its spec; no other caller: `countSelected`/`summarize` are local to `PageProfile.vue`). Findings:
1. Before the section lists finish loading, counts read 0 (items empty) → acceptable: lists are the same cached `useCandidate` data every dashboard page loads, and counts update reactively once loaded. Not a data risk because the payload is untouched.
2. Stale ids stay stored and are re-sent on save → by design for this node (issue asks only for the count); pruning on save could drop real ids if a list hadn't loaded. Noted below.
3. `s.items.some` per id is O(ids×items) → negligible at CV sizes.

## Noticed, not done
- Stale ids are never pruned from profiles; a backend cascade on entry delete (resume-nodejs-api) would be the clean fix.

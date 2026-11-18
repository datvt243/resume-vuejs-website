# 2026-11-16 - issue-446-short-major-optional-award-link

- Worker: implementer · Version: 0.1.0
- Node: `issue-446-short-major-optional-award-link` on `haven/diagrams/dev-loop.prime-mermaid.md` (IN_PROGRESS)
- Branch: `fix/issue-446-validation-allow-short` (off `staging` @ 9e98491, linked to #446 via `gh issue develop`)
- Task: "#446 Validation: allow short education majors ("IT") and awards without a link. Problem: Education: major (vi) requires at least 3 characters, so "IT" is rejected. Award: link is required, so an award without a URL can't be saved. Expected: Major: min 1. Award link: optional; when filled, a valid URL ≤ 100 chars. Needs the backend change too: datvt243/resume-nodejs-api (same rules)."

## Hub bytes before: 99250

## Feature doc: doctrine/features/cv-timeline-sections.md (Behavior #6), doctrine/features/cv-simple-sections.md (Behavior #5)
## Feature doc changed: timeline Behavior #6 "major (Vietnamese required, 3–255)" → "1–255"; simple Behavior #5 "link (required, valid URL, max 100)" → "link (optional; when filled, a valid URL, max 100)" — operator: timeline open question 6 "Bug: min 1 — #446", simple open question 1 "Change: link optional (URL when filled) — #446" (both 2026-11-07, recorded in the docs). Changelog row added to each.

## Acceptance criteria
1. Education major (vi) accepts "IT" (1 char min via `.required`), still max 255, still required.
2. Major EN variant: empty passes, short passes, > 255 fails.
3. Award link: empty passes; `not-a-url` fails; valid URL ≤ 100 passes; 101 chars fails.
4. Project link unchanged (still required).
5. `npm run test`, `npm run build`, `npm run lint` green; `npm run typecheck` ≤ 78 errors, none in touched files.
6. Comments per code-comments.md.

## Diff
| File | Why |
|---|---|
| `src/models/education.model.ts:26` | drop `.min(3, …)` from `major`; `.required` already rejects "" (min 1) |
| `src/models/award.model.ts:50` | drop `.required(_mesRequired)` from `link`; `url()` skips "" in yup 1.4.0 |
| `src/models/lengthRules.model.spec.ts` | old tests asserted the min-3 major / required award link: updated to the new rules; project vs award link split into two describes (project still required) |

## Command
- `npx vitest run src/models/lengthRules.model.spec.ts`
- `npm run test`
- `npm run build`
- `npm run lint`
- `npm run typecheck`

## Output
`npx vitest run src/models/lengthRules.model.spec.ts`, with fix:
```
 Test Files  1 passed (1)
      Tests  21 passed (21)
```
Same spec with both model files restored to `HEAD` (mutation check), then the fix copied back from scratchpad:
```
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  src/models/lengthRules.model.spec.ts > education major > accepts a short major like "IT"
 FAIL  src/models/lengthRules.model.spec.ts > education school/major EN fields > still apply the VI length rules once filled
 FAIL  src/models/lengthRules.model.spec.ts > education major > accepts 1-255 characters only
 FAIL  src/models/lengthRules.model.spec.ts > award link > is optional, but a valid URL of max 100 characters when filled
      Tests  4 failed | 17 passed (21)
```
After restore: `      Tests  21 passed (21)`

`npm run test`:
```
 Test Files  58 passed (58)
      Tests  378 passed (378)
```
`npm run build | tail -6`:
```

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 3.81s
```
`npm run lint` → `lint exit 0`.
`npm run typecheck | grep -c "error TS"` → `78`; `grep -cE "education.model|award.model|lengthRules"` on its errors → `0`.

## Acceptance
| Criterion | Evidence |
|---|---|
| 1 Major "IT" | "accepts a short major like "IT"" + describe.each `education major` 1–255 pass; both FAIL against HEAD model |
| 2 Major EN | "still apply the VI length rules once filled" (`'CS'` true, 256 chars false) passes; FAILs against HEAD; "are optional…" (`''` true) passes |
| 3 Award link | "award link > is optional, but a valid URL…" passes (`''` true, `not-a-url` false, 100 true, 101 false); FAILs against HEAD |
| 4 Project link | "project link > is required and max 100 characters" passes, `defaultLink` untouched |
| 5 Commands | 378 passed; ✓ built in 3.81s; lint exit 0; typecheck 78 = baseline, 0 in touched files |
| 6 Comments per code-comments.md | One comment removed (the "API rejects majors shorter than 3" line, now false); none added |

## Supersedes: none
`grep 446` on the active diagram: only this node.

## Review
Inline review (2 one-line model edits + spec). Checked: award `link` is not rendered anywhere (`grep` of award-related components/pages: only project links in `CvResumeLayout.vue:170`), so an empty link has no display effect. `withParams` still used in both model files (no unused import). Backend counterpart datvt243/resume-nodejs-api#414 is CLOSED (`gh issue view 414 -R datvt243/resume-nodejs-api`); whether the deployed API on Render already runs it is not verified (no live API call).

## Noticed, not done
- `cv-timeline-sections.md` Behavior #2 still says dates are always sent as timestamps; #445 (shipped, PR #474) made `endDate` null when "current" — doc not updated there.

## Seal gate: none (no commit/push/API call)

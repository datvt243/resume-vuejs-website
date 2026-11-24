# 2026-11-24 - issue-440-cv-skills-languages

- Worker: implementer · Version 0.1.0
- Node: `haven/diagrams/dev-loop.prime-mermaid.md` → `issue-440-cv-skills-languages` (IN_PROGRESS)
- Branch: `feature/issue-440-441-cv-skills-languages` (off `staging` @ `ed7700c`, synced with `git pull origin staging` → "Already up to date.", linked to #440 via `gh issue develop`)
- Task: #440 "CV layout: show skills and foreign languages (Preview + public resume)" (`/todo #440, #441`)
- Status: **sealed_pending_verifier**
- Analyst pass 0: `evidence/analyst/2026-11-24/issue-440-cv-skills-languages-spec.md` — spec_ready after operator answers Q11–Q15 + home-overview Q5 (2026-11-24).
- #441 not in this node: already implemented, SEALED (`evidence/verifier/2026-11-22/issue-444-441-education-view-languages-edit-seal.md`), merged in PR #507 (`e693f73`, in tag `v1.45.0`). Operator approved closing #441 and #444 → both closed with a comment citing PR #507 / v1.45.0.

## Hub bytes before
100632

## Feature doc
- `agent-hub/doctrine/features/cv-preview-export.md` (Behavior 18–23, "(#440)" acceptance / edge cases)
- `agent-hub/doctrine/features/home-overview.md` (Behavior #4 #440 draft, "(#440)" acceptance / edge cases)

## Feature doc changed
None by the implementer (analyst wrote the docs this run).

## Diff
| File | Why |
|---|---|
| `src/components/cv/CvResumeLayout.vue` | new `LABELS` keys (skills, mainSkills, familiarSkills, professionalSkills, personalSkills, languages) vi+en; `skillRows` computed (main → familiar → `groupSkills` groups with main/familiar names removed, null group labelled "Kỹ năng chuyên môn"/"Professional skills" → personal; empty rows dropped); `languageLine` (known level → `option.languageLevel.<level>` in the CV `lang`, legacy level as stored, empty level → language only); Skills section after General information, Languages section before References, both reuse `.cv-section` / `.cv-facts` (no per-theme CSS) |
| `src/components/cv/CvResumeLayout.spec.ts` | new `skills and languages (#440)` describe with the spec's exact fixture: vi rows + order + section-title order, vi language entries, en labels/levels, empty → no sections |
| `src/composables/useProfileCompletion.ts` | `nav.skills` (any of the 4 skill lists non-empty) and `nav.languages` (`foreignLanguages` non-empty) list sections after General information, read from `candidate.getGeneralInformation`, no new request; header comment 8 → 10 |
| `src/composables/useProfileCompletion.spec.ts` | 8 → 10 sections, 7 → 9 missing, 2/10 = 20%, 100% fixture gets a personal skill + a language, routes include skills/languages; new tests: Skills complete with each one of the 4 lists, not with only group tags; Languages complete with one language; 1/10 = 10% with 9 missing and order information → generalInformation → skills → languages |
| `agent-hub/haven/diagrams/dev-loop.prime-mermaid.md` | node row appended (IN_PROGRESS) |

Not mine: `.claude/skills/todo/SKILL.md` was already modified before this run (gitStatus at session start) — not touched. `agent-hub/doctrine/features/{INDEX,cv-preview-export,home-overview,public-resume,cv-skills,cv-languages}.md` edited by the analyst pass.

No new `src/i18n` keys: `nav.skills` / `nav.languages` already exist (`src/i18n/index.ts:35-36`, `:622-623`); CV labels live in the component's own `LABELS` table (CLAUDE.md "Not i18n").

## Command
From repo root, copied from `doctrine/MEMORY.md`: `npm run test` · `npm run lint` · `npm run build` · `npm run typecheck`; per file `npx vitest run <path>`.

## Output
```
npx vitest run src/components/cv/CvResumeLayout.spec.ts src/composables/useProfileCompletion.spec.ts
 ✓ src/composables/useProfileCompletion.spec.ts (11 tests) 33ms
 ✓ src/components/cv/CvResumeLayout.spec.ts (12 tests) 80ms
 Test Files  2 passed (2)
      Tests  23 passed (23)
npm run test
 Test Files  69 passed (69)
      Tests  502 passed (502)
npm run lint → eslint src --ext .js,.ts,.vue, no errors (exit 0)
npm run build → ✓ built in 4.09s
```
Typecheck, first run: `grep -c "error TS"` → 81, with 6 new `TS7006` in my spec helpers (`CvResumeLayout.spec.ts(147..153)`, untyped `wrapper`/`title`). Fixed by typing them (`ReturnType<typeof mount>`, `string`, `!` on the `.find`). Re-run:
```
npm run typecheck | grep -c "error TS" → 75 (baseline 75)
npm run typecheck | grep -E "CvResumeLayout" → (no lines)
npx vitest run src/components/cv/CvResumeLayout.spec.ts → Tests 12 passed (12)
npx eslint src/components/cv src/composables/useProfileCompletion* → exit 0
```
Pre-existing errors in a changed file: `useProfileCompletion.ts(78..81)` `TS2339 Property 'value' does not exist on type ...` — the unchanged `educations.value` / `experiences.value` / `projects.value` / `awards.value` lines (were lines 75–78 on `staging`: `git show staging:src/composables/useProfileCompletion.ts | sed -n 75,78p` prints the same four lines), caused by `useCandidate`'s untyped return union. Shifted down 3 lines by my insert; total stays 75 = baseline, so none are new. Not fixed (`SmallestDiff`).

## Live check (dev server, QA account)
Started `npm run dev -- --port 5173 --strictPort` (nothing was listening), own CDP window (`Target.createTarget newWindow`, `document.visibilityState === 'visible'`), logged in as `qa.full@example.com` (confirmed via `localStorage.user.email`). Read-only — only the login POST was sent.
- `#/dashboard/preview` Classic vi: section titles `Thông tin chung | Kỹ năng | Học vấn | Kinh nghiệm | Dự án | Ngoại ngữ` (qa.full has no awards/certificates/references, so Languages is last); 11 skill rows, first `Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3, SCSS` (a professional group the user named "Languages"), … `Familiar with: React, React Hooks`, last `Kỹ năng cá nhân: Focus on writing clean, …`; languages `english (Cơ bản)` (lowercase as stored by the user; CSS does not capitalize). No years shown. qa.full has no `mainSkills`/`familiarSkills` stored, so those rows are absent (covered by the unit test).
- Modern vi / Compact vi: same titles, rows and language line; class `cv-theme-modern` / `cv-theme-compact`.
- Compact en: `General information | Skills | Education | Experience | Projects | Languages`, last row `Personal skills: …`, `english (Basic)`.
- Profile "Tổng hợp" selected: identical titles / rows / languages.
- Public `#/resume/qa-full-2zd2`: vi titles as Preview, 11 skill rows, `english (Cơ bản)`; `?lang=en`: English titles, 11 rows, `english (Basic)`.
- Screenshots: `/private/tmp/claude-501/-Users--david-Workspace-Project-resume-resume-vuejs-website/9f2164a2-6290-4eb4-9796-b2305d6c17b8/scratchpad/{preview-classic-vi,preview-modern-vi,preview-compact-vi,preview-compact-en,public-en}.png`
- **Not done:** `qa.empty@example.com` live check — the shared debug Chrome on :9888 went down (`connect ECONNREFUSED 127.0.0.1:9888`) before the second login; not relaunched (not started by this session). The empty case is covered by the unit test "hides both sections when every list is empty or missing". Dev server stopped afterwards (`pkill -f "vite --port 5173 --strictPort"`, nothing listening on 5173).
- Side effect: logging in in the own window overwrote the origin-shared `localStorage.user` (display name) for the other tab already open on :5173; that tab's token is memory-only and unaffected.

## Follow-up issues (Behavior 23)
- Backend: https://github.com/datvt243/resume-nodejs-api/issues/503 — all three gaps with file/line refs, re-checked on the local checkout `resume-nodejs-api` @ `staging` `28e61e5` (`grep mainSkills|familiarSkills src/services/` → nothing; `createPDF.ts:282-305, 382-392`, `createPDF.ats.ts:241-243`, `createDocx.ts:102-104, 166-167`). Body cites `datvt243/resume-vuejs-website#440`. No backend file changed (`git -C ../resume-nodejs-api status` untouched by this task).
- Frontend: https://github.com/datvt243/resume-vuejs-website/issues/516 — JSON Resume `skills`/`languages`; `src/utilities/jsonResume.ts` unchanged (not in diff).
- Linked from #440: https://github.com/datvt243/resume-vuejs-website/issues/440#issuecomment-7133575371

## Acceptance
| Criterion | Evidence |
|---|---|
| (#440) CvResumeLayout spec: vi rows/order, Vue left out of Frontend, no Backend row, no years, `English (Khá)` / `French (fluent)` / `German`, title order | spec "lists skill rows names-only…" (`toEqual` on rows, languages and the full title list) passes |
| (#440) `lang="en"`: `Skills`, `Main skills: Vue`, `Professional skills: Docker`, `Languages`, `English (Advanced)` | spec "uses English labels and levels" passes |
| (#440) all five lists empty → neither title | spec "hides both sections…" (only group tags + `foreignLanguages: []`) passes |
| (#440) Live: Classic/Modern/Compact, vi + en, public + `?lang=en`, profile unchanged | Live check above |
| (#440) Live: `qa.empty` shows neither section | done in REOPEN round 1, see `## REOPEN round 1 fixes` |
| (#440) backend issue with 3 gaps + refs, linked; no backend change | #503 + #440 comment |
| (#440) JSON follow-up issue linked; `jsonResume.ts` unchanged | #516; not in `git diff --stat` |
| (#440 home) completion spec: 10 sections in order, 0% / 10 missing, skills rules, languages rules, routes, 100% with all 10, 2/10 = 20%, 1/10 = 10% | `useProfileCompletion.spec.ts` 11 tests pass |
| (#440 home) 1/10 = 10% and 9 links; first missing after Info + GI is `/dashboard/skills` | order asserted in "rounds 1/10…" test; `missingSections` follows `sections` order |
| i18n keys in vi + en; lint, build, test pass; typecheck no new errors in changed files | no new i18n keys; outputs above; 75 = baseline |
| comments per `doctrine/standards/code-comments.md` | 3 one-line why comments (picked skills left out; level in CV language / legacy as stored; skills+languages live on general-information) + the header count fix; first draft of the third had a `(#440)` ref — removed per code-comments.md (no `(#N)` refs); spec test titles keep `(#440)` like the existing `(#406)` / `#441` describe titles |

## Review
`/code-review medium` done inline (touched files in full + callers: `PagePreview.vue`, `PagePublicResume.vue` pass `data` unchanged; `PageHome.vue` reads `percent`/`missingSections` only):
- `skillRows` `:key` — first wrote `row.label`, a user group named "Kỹ năng chính" would collide with the main row label → switched to index key. Fixed.
- `languageLine` with a missing `language` and a level → would print `undefined (Khá)`; language is required by the form (`cv-languages.md` Behavior 5), not guarded. False positive for valid data.
- `flatMap(k => gi?.[k] || [])` with a non-array value (legacy) → flatMap passes a non-array through as one element → counts complete; acceptable (data exists).
- No security impact: names rendered with `{{ }}` (escaped), no `v-html` added.

## Supersedes
none (`grep "#440" haven/diagrams/dev-loop.prime-mermaid.md` → only this node)

## Still open
none

## Noticed, not done
- `release` skill did not close #441/#444 although they shipped in v1.45.0 — closed by hand this run; the release close-issues step may miss multi-issue branch names (`issue-444-441-…`).
- Stored language names are lowercase for qa.full (`english`); the layout shows them as typed (spec: content not transformed).

## Seal gate
Outward-facing actions this run, each approved by the operator in this session (AskUserQuestion answers, 2026-11-24):
- `gh issue close 441` + `gh issue close 444` with comment "Shipped in v1.45.0 via PR #507 (merge e693f73)…" — operator answer "Close both (Recommended)".
- `gh issue create -R datvt243/resume-nodejs-api` → #503 — operator answer Q14 "Open one issue, all 3".
- `gh issue create` → #516 — operator answer Q15 "Separate issue".
- `gh issue comment 440` linking #503 / #516 — part of the Q14/Q15 criterion "linked from #440".
- Login POSTs to the prod API with QA accounts only (qa.full, qa.empty), no writes.
No commit / push / merge — that is `/ship`, not run.

## REOPEN round 1 fixes
Verifier REOPEN `evidence/verifier/2026-11-24/issue-440-cv-skills-languages-reopen.md`: (1) `qa.empty` live check missing; (2) no `## Seal gate` section.

(2) → section above.
(1) Debug Chrome relaunched with `/open-browser-debugger` (`open -na "Google Chrome" --args --remote-debugging-port=9888 --user-data-dir="$HOME/.chrome-debug-profile"` → `/json/version` up); `npm run dev -- --port 5173 --strictPort` started (nothing listening). Own window via `Target.createTarget newWindow`, logged in as `qa.empty@example.com` (`localStorage.user.email` = `qa.empty@example.com`), `#/dashboard/preview`, polled once per second for 12 s:
```
{"h":"#/dashboard/preview","n":1,"t":"","name":"Trần Thị Empty", ...}   × 12
```
`n` = `.cv-preview` count, `t` = joined `.cv-section-title` texts → empty: neither `Kỹ năng` nor `Ngoại ngữ` (nor any other section) rendered; `.cv-name` = "Trần Thị Empty". First attempt read `[]` titles too but the page then landed on `#/dashboard/information` (post-login redirect racing my `goto`), so it was re-done with the 12 s poll above. Screenshot: `/private/tmp/claude-501/-Users--david-Workspace-Project-resume-resume-vuejs-website/9f2164a2-6290-4eb4-9796-b2305d6c17b8/scratchpad/preview-qa-empty.png`. Dev server stopped (`pkill -f "vite --port 5173 --strictPort"`, nothing on 5173). No code change this round, so test/lint/build/typecheck outputs above still apply to the same diff.

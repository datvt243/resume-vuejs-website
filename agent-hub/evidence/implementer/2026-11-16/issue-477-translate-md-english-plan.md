# 2026-11-16 - issue-477-translate-md-english
Worker: implementer · Version: 0.1.0 · Node: `haven/diagrams/dev-loop.prime-mermaid.md` → `issue-477-translate-md-english`
Task (verbatim): "kiểm tra các file skill md, agent-hub và các file md ở root, nếu content là tiếng Việt, hãy đưa về tiếng Anh" → issue #477.

## Branch
`docs/issue-477-translate-md-english` (off `staging`, linked via `gh issue develop`).

## Hub bytes before
99262

## Feature doc
none (docs task, no product feature)

## Scope survey (diacritic grep over root *.md, .claude/skills/**, agent-hub/**)
- `.claude/skills/**`: 0 hits — no change.
- Root `DESIGN.md` (28 hits): all quoted Vietnamese UI labels (sidebar names, sample headings) — kept.
- `doctrine/features/{cv-preview-export,account-settings}.md`: "Tiếng Việt" = UI option label — kept.
- `doctrine/domains/PROJECT.md`: author name "Đạt Võ" — kept.
- `dev-loop.prime-mermaid.md`: 1 verbatim operator quote — kept.
- `dev-loop-archive.md`: pre-2026-08-22 Vietnamese rows; NORTHSTAR.md:59-61 + agent-hub/CLAUDE.md say keep as-is — operator chose "Keep archive as-is".
- `evidence/` (~330 notes): operator chose "Skip evidence".
- Translated: `agent-hub/README.md`, `agent-hub/INDEX.md` (current docs, not historical records).

## Diff
| File | Why |
|---|---|
| `agent-hub/README.md` | Vietnamese prose → English, same sections/code blocks/paths |
| `agent-hub/INDEX.md` | Vietnamese table/notes → English, same rows/paths |
| `haven/diagrams/dev-loop.prime-mermaid.md` | new node row |

## Round 2 (after REOPEN `evidence/verifier/2026-11-16/issue-477-translate-md-english-reopen.md`)
Fixes: typecheck now run; build output pasted in full; diacritic grep widened to all Vietnamese vowels (incl. á à é ó ú, upper case, đ/Đ); structure counts vs `staging`.

## Command
- `npm run build` (repo root)
- `npm run typecheck` (repo root)
- `grep -cE '[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]' agent-hub/README.md agent-hub/INDEX.md`
- structure: `grep -c '^#'` / `grep -c '^|'` / `grep -c '^```'` on `git show staging:agent-hub/<f>` vs working copy

## Output
### npm run build (exit 0, full)
```

> resume-vuejs-website@1.40.0 build
> vite build

vite v5.3.2 building for production...
transforming...
✓ 1409 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                            1.12 kB │ gzip:   0.53 kB
dist/assets/PageSkills-Bt62vaJN.css                        0.11 kB │ gzip:   0.11 kB
dist/assets/PageInformation-CayUSrf4.css                   0.18 kB │ gzip:   0.13 kB
dist/assets/PagePreview-9j7mkeYM.css                       0.27 kB │ gzip:   0.14 kB
dist/assets/PageEducation-BYs4di43.css                     0.32 kB │ gzip:   0.20 kB
dist/assets/PageExperience-DLYC0jYO.css                    0.32 kB │ gzip:   0.20 kB
dist/assets/PageProject-DpWBt_Nw.css                       0.32 kB │ gzip:   0.20 kB
dist/assets/PageVisits-CFYxBwfh.css                        0.74 kB │ gzip:   0.31 kB
dist/assets/VisitChart-Cuz58mMR.css                        1.05 kB │ gzip:   0.48 kB
dist/assets/TableDefault-DandbvxE.css                      1.12 kB │ gzip:   0.43 kB
dist/assets/CvResumeLayout-DXFrLRhP.css                    2.04 kB │ gzip:   0.56 kB
dist/assets/index-D2wVMqVj.css                            58.05 kB │ gzip:  12.07 kB
dist/assets/VeeForm-CEs-TdaD.css                         371.31 kB │ gzip:  51.03 kB
dist/assets/PageDashboard-D7RYIAd6.js                      0.22 kB │ gzip:   0.19 kB
dist/assets/useActiveProfile-BDHkFNsg.js                   0.28 kB │ gzip:   0.21 kB
dist/assets/badge.lib-oiwczr-w.js                          0.34 kB │ gzip:   0.22 kB
dist/assets/useCvTheme-BhPm4a6x.js                         0.46 kB │ gzip:   0.30 kB
dist/assets/education.model-CxwTMDXw.js                    0.57 kB │ gzip:   0.30 kB
dist/assets/NotFound-BHnkh1Qe.js                           0.58 kB │ gzip:   0.38 kB
dist/assets/useManualOrder-oio0Nk7x.js                     0.63 kB │ gzip:   0.40 kB
dist/assets/useDocument-CAPwWvPe.js                        0.96 kB │ gzip:   0.53 kB
dist/assets/PageForgotPassword-Vui-J8LL.js                 1.17 kB │ gzip:   0.68 kB
dist/assets/useCandidate-D8MNtUfd.js                       1.25 kB │ gzip:   0.68 kB
dist/assets/PageLogin-DWqbK4n0.js                          1.38 kB │ gzip:   0.76 kB
dist/assets/information.model-TiFpO5c8.js                  1.46 kB │ gzip:   0.56 kB
dist/assets/PageRegister-DDiv22Pf.js                       1.58 kB │ gzip:   0.76 kB
dist/assets/PageResetPassword-iCh-_hdC.js                  1.61 kB │ gzip:   0.82 kB
dist/assets/PageGeneralInformation-2TfXpiZ2.js             1.71 kB │ gzip:   0.90 kB
dist/assets/PagePublicResume-DvcWy4oP.js                   1.72 kB │ gzip:   0.91 kB
dist/assets/auth-DK6Er0TA.js                               2.04 kB │ gzip:   0.68 kB
dist/assets/model.type-Cf9Bz6j1.js                         2.13 kB │ gzip:   0.87 kB
dist/assets/experience.model-BRGQSlWh.js                   2.92 kB │ gzip:   1.31 kB
dist/assets/jsonResume-Bp2ahkw0.js                         3.16 kB │ gzip:   1.45 kB
dist/assets/PageLanguages-ltKIn-ij.js                      3.24 kB │ gzip:   1.46 kB
dist/assets/Modal-C_l7VluK.js                              3.33 kB │ gzip:   1.67 kB
dist/assets/generalInformation.model-DazZOuMl.js           3.34 kB │ gzip:   0.83 kB
dist/assets/PageReference-BSCti1XE.js                      3.55 kB │ gzip:   1.56 kB
dist/assets/PagePreview-o7FT46ox.js                        3.74 kB │ gzip:   1.66 kB
dist/assets/PageCertificate-B6cLSw0G.js                    3.91 kB │ gzip:   1.70 kB
dist/assets/VeeFormGeneralInformationUpdate-BiDDj9QY.js    4.01 kB │ gzip:   1.93 kB
dist/assets/PageAward-BMSc6Hgh.js                          4.01 kB │ gzip:   1.74 kB
dist/assets/PageAccountSettings-Dqg6MB8n.js                4.07 kB │ gzip:   1.64 kB
dist/assets/VisitChart-BxSDp_QN.js                         4.15 kB │ gzip:   2.13 kB
dist/assets/PageEducation-ZOFtNDUo.js                      4.90 kB │ gzip:   2.23 kB
dist/assets/PageAtsCheck-B_olqV6W.js                       5.38 kB │ gzip:   2.13 kB
dist/assets/PageProject-CWQZhP9p.js                        5.92 kB │ gzip:   2.56 kB
dist/assets/PageProfile-D_PAXDAK.js                        6.27 kB │ gzip:   2.60 kB
dist/assets/PageApplication-D5DFFoPc.js                    7.10 kB │ gzip:   2.69 kB
dist/assets/TableDefault-CMIMJuPS.js                       7.34 kB │ gzip:   2.91 kB
dist/assets/PageVisits-Dh2xYgXp.js                         7.49 kB │ gzip:   2.96 kB
dist/assets/PageImportLinkedin-BY6Zfa5B.js                 7.71 kB │ gzip:   3.02 kB
dist/assets/PageExperience-BoZa_R2v.js                     8.01 kB │ gzip:   3.22 kB
dist/assets/CvResumeLayout-B7zFs_E6.js                     8.19 kB │ gzip:   2.50 kB
dist/assets/PageHome-DUU_Dffa.js                          10.09 kB │ gzip:   3.64 kB
dist/assets/PageSkills-DBiSdsMF.js                        13.31 kB │ gzip:   4.33 kB
dist/assets/PageInformation-CVEU0drb.js                   31.94 kB │ gzip:  12.50 kB
dist/assets/index.esm-B1zl171F.js                         42.53 kB │ gzip:  13.42 kB
dist/assets/swal.lib-BX7iF3c5.js                          43.00 kB │ gzip:  13.98 kB
dist/assets/index-Bqr0DA1d.js                            415.66 kB │ gzip: 146.30 kB
dist/assets/VeeForm-CtfF9_sK.js                          993.37 kB │ gzip: 281.68 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 4.33s
```
### npm run typecheck (exit 2)
`grep -c "error TS"` → `78`; errors in `.md`/touched files → `0` (diff touches no .ts/.vue). Last lines:
```
  No index signature with a parameter of type 'string' was found on type '{}'.
src/stores/candidate.ts(89,20): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.
```
### diacritic grep (wide class)
```
agent-hub/INDEX.md:0
agent-hub/README.md:0
```
### structure counts
```
README.md staging: h=5 rows=0 code=4 ; now: h=5 rows=0 code=4
INDEX.md staging: h=2 rows=20 code=0 ; now: h=2 rows=20 code=0
```

## Acceptance
| Criterion | Evidence |
|---|---|
| No Vietnamese left in the 2 files | wide-class grep `INDEX.md:0`, `README.md:0` |
| Meaning/structure/paths preserved | structure counts identical to `staging` (headings 5/5 & 2/2, table rows 0/0 & 20/20, fences 4/4 & 0/0); all paths unchanged |
| Build green | `✓ built in 4.33s`, exit 0 (pre-existing chunk-size warning only) |
| Typecheck ≤ baseline 78, none in changed files | `78` errors, exit 2, 0 in touched files (markdown only) |
| comments per code-comments.md | n/a — no code comments touched |

## Supersedes
none

## Review: skipped — docs

## Noticed, not done
- `evidence/` notes and `dev-loop-archive.md` still contain Vietnamese — intentionally kept per operator + NORTHSTAR policy.

## Seal gate
none (no outward-facing action)

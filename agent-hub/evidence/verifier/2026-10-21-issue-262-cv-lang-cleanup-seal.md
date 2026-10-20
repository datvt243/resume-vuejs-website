# 2026-10-21 - issue-262-cv-lang-cleanup - SEAL

- Worker: verifier (v0.1.0)
- Node: `issue-262-cv-lang-cleanup` (`haven/diagrams/dev-loop.prime-mermaid.md`)
- Evidence reviewed: `evidence/implementer/2026-10-21-issue-262-cv-lang-cleanup.md`
- Verdict: **SEAL**

## Isolation proof
Spawned as a fresh subagent with the task string "verifier \"#262 [CHORE] Dọn chỗ chọn ngôn ngữ CV còn sót sau khi chuyển VI/EN lên header — evidence note: agent-hub/evidence/implementer/2026-10-21-issue-262-cv-lang-cleanup.md (node issue-262-cv-lang-cleanup, branch chore/issue-262-cv-lang-cleanup)\"". This context has no implementer history and did not write the diff; the diff was not opened (EvidenceOnly).

## Re-run
none (audit only). The note is verbatim, not truncated, uses the doctrine commands, and covers every criterion. Not outward-facing.

## Checks
| Check | Result |
|---|---|
| Commands vs `doctrine/MEMORY.md` | `npm run test`, `npm run build`, `npm run lint` from repo root; Typecheck declared "CANNOT RUN — pending add-typecheck-script". OK |
| Output not truncated | Excerpts given with verbatim summary lines, no `...`/"truncated". OK |
| Branch (NoMainEdit) | `chore/issue-262-cv-lang-cleanup`, cut from `staging` `56f0be6`. OK |
| Seal gate | No commit/push/API write. N/A |
| Proportionality | 3 files (PageAtsCheck.vue, useCvLang.ts, its spec), ~12+/19-. Out-of-scope token-on-reload finding recorded under "Noticed, not done" without being fixed. OK |

## Acceptance criteria
| Criterion | Cited evidence |
|---|---|
| No second CV-language picker on ATS page | Browser check: `selects: 0`, `#ats-lang` absent |
| ATS check + download follow header switch | Spec "sends … the header CV language" (`lang: 'en'` after `setLang('en')`); download-link spec `?lang=en`; browser href toggles `lang=en` / none with header EN/VI |
| Unused `CV_LANGS` removed | Survey grep: no remaining refs in `src` |
| Non-redundant language UI kept | Survey table: VeeForm content toggle, foreign-languages field, Chia sẻ CV note kept with reasons |
| Build green, no new test failures | `✓ built in 3.97s`; 254 passed / 1 failed. The failing `VeeForm.spec.ts > VI \| EN toggle > flags the hidden language…` is the known pre-existing failure, also cited in earlier verifier notes (`2026-10-21-issue-251-*-seal.md`, `2026-10-20-issue-211-*`) |
| Comments per code-comments.md | One why-comment in PageAtsCheck, no `(#N)` refs |

## Forbidden states
None hit (MAIN_EDIT, NO_EVIDENCE, EDIT_UNVERIFIED, seal-gate bypass, etc. all clear).

## Missing
None.

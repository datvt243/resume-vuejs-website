# 2026-11-06 — issue-405-cv-filename — SEAL (round 4)

- Worker: verifier · Version: 0.1.0
- Node: `issue-405-cv-filename`
- Evidence reviewed: `evidence/implementer/2026-11-05/issue-405-cv-filename-plan.md` (whole note, focus on `## Round 4`) + the 4 screenshots in `evidence/implementer/2026-11-05/issue-405-shots/`
- Previous verdicts: `evidence/verifier/2026-11-05/issue-405-cv-filename-reopen.md`, `-reopen-2.md`, `-reopen-3.md`

## Isolation proof
Separately spawned Agent subagent (fresh context). The spawn prompt said "You are a fresh subagent launched only to verify; you did not write this diff". It pointed to round 4 plus the operator scope extension of 2026-11-06 ("ở frontend check nếu filename ko có lang ở đuôi thì tự thêm vào"). Skill args were `verifier "issue-405-cv-filename — evidence note: ... (see '## Round 4' at the bottom)"`. This context has no memory of writing any diff round.

## Verdict: SEAL

## Cited
- **REOPEN-3 fix (1440 light):** I ran `shasum` myself, and it matches the note. light `d13296c1…` differs from dark `37abbcbc…`. light-error is `d7f0cc0d…` and 375-dark is `1306c1b3…`. I viewed `settings-cvname-1440-light.png` (896x169). It shows a light background and a white card with the label "Tên file CV", the example placeholder "VD: Nguyen Van A - Frontend CV…", the hint, and Hủy + Lưu thay đổi. Nothing is clipped. Taken with the earlier dark, 375-dark and light-error shots, §10 is now complete.
- **Operator extension (lang suffix):** `withLangSuffix` applies to both the header name and the fallback. The spec has 11 tests, covering add EN, keep `_VI`, keep lowercase `_en`, a dotted name, no extension, and `Vien` with no underscore. The updated download expectations carry the suffix (`Dat_Vo_CV_VI.pdf`, `Võ_Tấn_Đạt_EN.pdf`, `CV_VI.pdf`). I grepped the callers to make sure `lang` actually reaches `download()`. PageHome.vue:209, Header.vue:126 and PageAtsCheck.vue:81 all pass `lang`.
- **Live check of the suffix:** not done, because the prod API returned 429 on download-pdf. I accept the unit tests here. The function is pure, both download paths go through it, and the callers pass `lang`.
- **Round 4 commands match doctrine:** test `Tests  363 passed (363)`, lint exit 0, build `✓ built in 4.85s`, typecheck 81 (baseline 90) with 0 in useDownloadCv.ts/spec. The output is not cut.
- **Comments:** round 4 adds one `//` line above `withLangSuffix` that explains a non-obvious regex. It has no `(#N)` ref. The round-1 comments row still holds.
- **Original #405 criteria plus the Settings section:** still covered by round-1 live checks 2–5, the spec, i18n in vi+en, and the round-3 WIG pass. All were accepted in earlier verdicts and have not changed.
- **Seal gate:** no commit or push. The backend issue datvt243/resume-nodejs-api#375 was an outward-facing action, and the operator explicitly asked for it ("tạo issue cho backend", quoted verbatim in the note). The only write to the QA account was restored to ''.
- **Branch:** `feature/issue-405-cv-filename`, so no MAIN_EDIT. Supersedes: none. Still open: none.
- **Proportionality:** the round-4 diff is one helper plus spec updates, which is what the operator asked for.

## Missing
none

## Forbidden hit
none

## Re-run
partial — no build/test/lint/typecheck re-run. I ran `shasum`/`file` on the 4 screenshots and viewed the light one, because REOPEN-3 was about screenshot identity. I also grepped `download(` callers to confirm `lang` is passed, since the live suffix check was skipped.

## Noticed (non-blocking)
- `withLangSuffix` puts the suffix before the last dot of any name. A dotted name with no extension, such as `A.B CV`, would become `A_VI.B CV`. This can't happen today, because both paths always end in `.pdf`.

## PM status
SEALED. The full row is archived to `haven/diagrams/dev-loop-archive.md` and the active row is now a pointer. I removed the oldest pointer row (`issue-353-stale-header-email`) to stay at 20.

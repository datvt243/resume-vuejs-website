# 2026-11-02 - issue-374-main-skills live save (post-release check)

- Worker: implementer · no code change, so no new node. This closes the "Not proven live: a 200 save" gap on the SEALED node `issue-374-main-skills`.
- Frontend: shipped to `staging` (PR #376, merge `d26c203`). The live run was on the operator's Vite, against the prod API.
- Backend: `origin/main` = `564a9c0 Merge pull request #347 … release/v2.3.0`. `git merge-base --is-ancestor ef79e0a origin/main` → true (mainSkills).
- Task (verbatim): "backend đã release xong, test lại phần lưu kỹ năng chính"

## Command
I used Playwright as `qa.full@example.com` in a separate `browser.newContext()`. The owner account and tab were not touched.

## Output
```
before: []
pick (search "type" → TypeScript, group filter → first item, then 1 more) + Lưu:
  {"status":200,"req":["TypeScript","Vue.js 2 & 3","JavaScript (ES6+)"],"saved":[same]}, modalOpen 0, ui = 3 badges
reload: ["TypeScript","Vue.js 2 & 3","JavaScript (ES6+)"]
reopen picker: preChecked 3, "Đã chọn 3/5"
tick 2 more: "Đã chọn 5/5", 38 checkboxes disabled → Lưu 200, saved 5, modalOpen 0
× TypeScript: 200, saved ["Vue.js 2 & 3","JavaScript (ES6+)","HTML5","CSS3"], ui matches
professional skills: 43 badges (untouched)
cleanup (my script's first cleanup loop hit a stale locator; second run): untick all → 200, saved []
reload: 0 main skills, "Chưa có dữ liệu" box shown, professional 43
```
The QA account was restored to 0 main skills, 43 professional skills and no tags.

## Seal gate
none (no commit/push). QA writes only, restored.

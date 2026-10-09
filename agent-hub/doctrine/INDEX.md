# doctrine/INDEX.md — map của doctrine

> Doctrine là VERIFIED TRUTH. Phỏng đoán, ý tưởng dang dở KHÔNG
> thuộc về đây — chúng thuộc `evidence/` note hoặc diagram note.

## Read in this order
| File | What it is | When you need it |
|---|---|---|
| `SOUL.md` | Identity của hub agent | Trước khi tự ý quyết định thay đổi gì |
| `MEMORY.md` | Path, stack, lệnh chính xác | Mọi phiên, ngay từ đầu |
| `domains/PROJECT.md` | Ground truth riêng resume-vuejs-website | Trước khi implement |
| `standards/edit-verification.md` | Luật không claim thứ chưa quan sát | Trước khi báo "done" |
| `standards/recipes.md` | Recipe là gì, khi nào viết | Khi lặp lại 1 quy trình lần 2 |
| `standards/initiative-scoping.md` | Measure exhaustively by rule+file before/after a multi-phase count-based initiative | Before carving up any "clean up X across the codebase" effort into phases |
| `standards/code-comments.md` | What a source comment may say + its style, plus project opt-ins (file header, object params) | Before writing/changing any comment or function signature |

## The three kinds of knowledge here
| Kind | Home | Example |
|---|---|---|
| Về hub | `SOUL.md` / `MEMORY.md` | Lệnh build chính xác |
| Về domain/project | `domains/PROJECT.md` | `_id` presence quyết định POST vs PUT trong `useDocument` |
| Về cách làm việc | `standards/*.md` | Format recipe bắt buộc |

Một fact nằm sai ngăn là một fact không ai tin.

## Growing the doctrine
Chỉ thêm file/mục khi CẢ 3 đúng: (1) verified, (2) durable, (3) NOT
INFERABLE — agent đọc code 2 phút không tự suy ra được. Trượt điều (3) thì
đừng viết — doctrine mà chỉ nhại lại code sẽ cũ đi âm thầm và đánh lừa người
đọc.

## Correcting the doctrine
Sửa file, VÀ ghi "tôi từng tin gì / thực tế là gì" vào bảng Corrections
trong `MEMORY.md` của worker liên quan. Xoá âm thầm một fact sai = mất luôn
bài học đằng sau nó.

## Deliberately absent
Không có `laws/`, `architecture/`, `uplifts/`, `training/`. Chỉ thêm khi đã
có bài học thật sự cần nó — không thêm trước.

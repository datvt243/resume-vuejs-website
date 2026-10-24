# Resume Vuejs Website

Ứng dụng web quản lý hồ sơ xin việc (CV) cá nhân, xây dựng bằng Vue 3 + Vite: nhập và quản lý toàn bộ thông tin CV dưới dạng dữ liệu có cấu trúc, xuất PDF, chia sẻ link CV công khai.

- **Live:** https://datvt243.github.io/resume-vuejs-website/
- **Backend API:** https://nodejs-resume-api-ts.onrender.com/ ([resume-nodejs-api](https://github.com/datvt243/resume-nodejs-api))

> Backend chạy trên Render free tier — lần gọi API đầu tiên có thể chậm (cold start ~30s).

## Bắt đầu nhanh

Yêu cầu: Node.js 20 (bản CI đang dùng), npm.

```bash
git clone https://github.com/datvt243/resume-vuejs-website.git
cd resume-vuejs-website
npm install
npm run dev        # http://localhost:5173
```

`.env.development` và `.env.production` có sẵn trong repo (chỉ chứa URL API công khai), nên chạy được ngay. Muốn trỏ tới backend khác thì copy [`.env.example`](.env.example) thành `.env` hoặc `.env.development.local` (cả hai đã được gitignore).

Các lệnh khác:

```bash
npm run build      # build production → dist/
npm run preview    # xem thử bản build
npm run lint
npm run test       # vitest
```

## Tính năng

- **Thông tin cơ bản** — họ tên, giới tính, ngày sinh, địa chỉ, số điện thoại, mạng xã hội, ảnh đại diện
- **Thông tin chung** — vị trí mong muốn, mức lương, kỹ năng chuyên môn, kỹ năng cá nhân, ngoại ngữ
- **Học vấn, dự án, giải thưởng, chứng chỉ, người tham khảo** — thêm / sửa / nhân bản / xoá, sắp xếp kéo thả
- **Kinh nghiệm làm việc** — khi thêm mới chọn *kinh nghiệm* hoặc *khoảng nghỉ việc (career break)*, có chế độ xem chi tiết
- **Nhiều phiên bản CV** — mỗi phiên bản là một tập con dữ liệu, có link chia sẻ và PDF riêng
- **Chia sẻ & xuất CV** — link công khai (slug tuỳ chỉnh, QR code), xuất PDF với nhiều theme
- **Theo dõi ứng tuyển** — ghi lại nơi đã nộp CV và trạng thái
- **Tài khoản** — quên / đổi mật khẩu, dark mode, giao diện song ngữ Việt/Anh

## Công nghệ

Vue 3 (Composition API) · Vite 5 · Pinia · Vue Router 4 · VeeValidate 4 + Yup · Axios · Tailwind CSS 3 · CKEditor 5 · FontAwesome 6 · SweetAlert2 · TypeScript (một phần) · Vitest

Kiến trúc và quy ước code (model-driven form, composables, i18n): xem [`.claude/CLAUDE.md`](.claude/CLAUDE.md). Hướng dẫn giao diện: [`DESIGN.md`](DESIGN.md).

## Deploy

Mỗi lần push vào `main` (tức là sau mỗi lần `/release`), GitHub Actions tự build và deploy lên GitHub Pages (`.github/workflows/deploy.yml`). Không có bước deploy thủ công nào khác.

## Đóng góp

- `main` và `staging` đều được GitHub bảo vệ: không push thẳng, bắt buộc qua PR.
- Tạo branch `fix/*`, `feature/*` hoặc `hotfix/*` từ `staging`, mở PR vào `staging`.
- `main` chỉ nhận code từ `staging` qua `/release` (build + lint, tag semver, merge commit).
- Chi tiết và lý do: [`CONTRIBUTING.md`](CONTRIBUTING.md).
- Báo lỗi / đề xuất tính năng: [GitHub Issues](https://github.com/datvt243/resume-vuejs-website/issues). Lộ trình: [wiki Roadmap](https://github.com/datvt243/resume-vuejs-website/wiki/Roadmap).

## Tác giả & License

**Đạt Võ** — [@datvt243](https://github.com/datvt243)

Chưa chọn license — mọi quyền thuộc tác giả.

# Resume Vuejs Website

Ứng dụng quản lý hồ sơ xin việc (Resume/CV) cá nhân, được xây dựng với Vue 3 + Vite. Cho phép nhập liệu và quản lý toàn bộ thông tin CV dưới dạng structured data thông qua API.

**Live Demo:** https://datvt243.github.io/resume-vuejs-website/  
**Backend API:** https://nodejs-resume-api-ts.onrender.com/

> ⚠️ Backend chạy trên Render free tier — có thể chậm ở lần gọi API đầu tiên (cold start ~30s).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API + `<script setup>`) |
| Build Tool | Vite 5 |
| State Management | Pinia |
| Routing | Vue Router 4 |
| Form Validation | VeeValidate 4 + Yup |
| HTTP Client | Axios |
| UI Framework | Bootstrap 5 |
| Rich Text Editor | CKEditor 5 |
| Icons | FontAwesome 6 |
| Dialog | SweetAlert2 |
| Language | TypeScript (partial) + JavaScript |

---

## Features

- **Thông tin cơ bản** — Họ tên, giới tính, ngày sinh, địa chỉ, số điện thoại, mạng xã hội
- **Thông tin chung** — Vị trí mong muốn, mức lương, kỹ năng chuyên môn, kỹ năng cá nhân, ngoại ngữ
- **Học vấn** — Quản lý danh sách trường học, chuyên ngành
- **Kinh nghiệm làm việc** — Công ty, vị trí, thời gian
- **Dự án** — Tên dự án, công nghệ, mô tả, link
- **Giải thưởng** — Danh sách giải thưởng đã đạt
- **Chứng chỉ** — Chứng chỉ chuyên môn
- **Người tham khảo** — Reference contacts

---

## Getting Started

### Yêu cầu

- Node.js >= 18
- npm hoặc yarn

### Cài đặt

```bash
# Clone repo
git clone https://github.com/datvt243/resume-vuejs-website.git
cd resume-vuejs-website

# Cài dependencies
npm install
```

### Cấu hình môi trường

`.env.development` và `.env.production` đã có sẵn trong repo (chỉ chứa
URL API công khai, không có secret) — chạy `npm run dev`/`npm run build`
là dùng được ngay, không cần tạo gì thêm.

Muốn override cục bộ (vd: trỏ tới backend khác), copy [`.env.example`](./.env.example)
thành `.env` hoặc `.env.development.local` — 2 file này đã gitignore sẵn:

```bash
cp .env.example .env
```

### Chạy development

```bash
npm run dev
```

App sẽ chạy tại: http://localhost:5173

### Build production

```bash
npm run build
```

Output tại thư mục `dist/`.

### Preview build

```bash
npm run preview
```

---

## Project Structure

```
src/
├── App.vue                     # Root component — provides spinner, toast, layout
├── main.js                     # App entry point
│
├── components/
│   ├── global/                 # Auto-registered global components
│   │   ├── Box.vue
│   │   ├── Button.vue
│   │   ├── Dropdown.vue
│   │   ├── Heading.vue
│   │   ├── ItemTemplate.vue
│   │   ├── ListTransition.vue
│   │   └── NoData.vue
│   ├── veevalidate/            # Form field components
│   │   ├── VeeForm.vue         # Generic form wrapper
│   │   ├── VeeFormGeneralInformationUpdate.vue
│   │   └── part/               # FrmInput, FrmSelect, FrmDate, FrmCkediter, ...
│   ├── table/                  # Table components (render functions)
│   ├── convert/                # Data display converters (date, boolean, truncate)
│   ├── education/
│   ├── experience/
│   ├── project/
│   ├── Modal.vue
│   ├── Spinner.vue
│   └── Toasts.vue
│
├── composables/
│   ├── useCandidate.ts         # Fetch & cache candidate data by field
│   ├── useDocument.ts          # Generic CRUD operations (create/update/delete)
│   ├── useHelper.js            # Inject spinner & toast
│   └── useInitTable.ts         # Initialize table columns from model
│
├── config/
│   ├── api.config.js           # API base URL
│   └── regex.config.js         # Shared regex patterns
│
├── lib/
│   └── swal.lib.js             # SweetAlert2 helpers
│
├── models/                     # Form field definitions (schema + UI metadata)
│   ├── education.model.ts
│   ├── experience.model.ts
│   ├── generalInformation.modal.ts
│   ├── information.model.ts
│   ├── project.model.ts
│   └── ...
│
├── pages/
│   ├── _layouts/               # LayoutDefault, LayoutAuth, Header, Footer
│   ├── auth/                   # PageLogin, PageRegister
│   ├── dashboard/              # PageDashboard + tất cả dashboard pages
│   ├── home/                   # PageHome
│   └── notFound/               # 404
│
├── plugins/
│   ├── GlobalComponents.js     # Auto-register components trong /global/
│   └── initFontAwesomeIcon.js  # FontAwesome setup
│
├── routers/
│   └── index.js                # Vue Router config + navigation guards
│
├── services/
│   ├── axios.js                # Axios instance
│   ├── base.js                 # Generic API handler (handleBase)
│   └── auth.js                 # Auth-specific API (login, register)
│
├── stores/
│   ├── auth.js                 # Auth store — token, user, isAuthenticated
│   └── candidate.js            # Candidate store — resume data
│
├── styles/                     # Global SCSS (bootstrap, sweetalert2, datepicker)
│
├── types/                      # TypeScript type definitions
│   ├── api.type.ts             # Response, Document
│   ├── model.type.ts           # modelItem + default field factories
│   └── ...
│
└── utilities/
    └── index.ts                # formatDate, formatDateToInput
```

---

## Architecture

### Model-Driven Forms

Form fields được định nghĩa dưới dạng `modelItem[]` trong thư mục `models/`. Mỗi model chứa cả UI metadata lẫn validation schema:

```ts
// models/education.model.ts
const MODEL: modelItem[] = [
    {
        name: 'school',
        label: 'Tên trường',
        type: 'text',
        valid: yup => yup.string().max(100).required('Vui lòng nhập'),
        default: '',
    },
    // ...
]
```

`VeeForm.vue` nhận `fields: modelItem[]` và tự động render đúng component input và validation.

### Composables Pattern

- **`useCandidate`** — Fetch data theo `field` (vd: `'educations'`), cache vào Pinia store, expose `removeRecordById` / `addRecordToList`
- **`useDocument`** — Generic CRUD: `updateDoc` (POST/PUT), `deleteDoc` (DELETE), `updatePatchDoc` (PATCH)
- **`useHelper`** — Inject `spinner` và `toast` được provide từ `App.vue`

### Global State (Pinia)

- **`authStore`** — Quản lý authentication state (token, user info)
- **`candidateStore`** — Cache toàn bộ resume data, tránh gọi API lại

---

## Development Workflow

2 tầng, cả `main` và `staging` đều branch-protected trên GitHub (không ai
push thẳng được, kể cả admin):

```
fix/feature/hotfix  →  PR  →  staging  →  /release  →  main  →  gh-pages
```

- Nhánh mới luôn cắt từ `staging` (không phải `main`), PR về `staging`
  qua `/ship`.
- `main` chỉ nhận code từ `staging` qua `/release` — real build+lint
  gate, semver tag, merge commit (không squash).

Chi tiết đầy đủ + lý do từng quyết định: xem [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Deployment

App tự động deploy lên GitHub Pages mỗi khi có push vào `main` (qua
`.github/workflows/deploy.yml`) — nghĩa là mỗi lần `/release` chạy xong.
Không có bước deploy thủ công/deploy hook riêng nào khác.

Live: https://datvt243.github.io/resume-vuejs-website/

---

## Known Issues

Xem toàn bộ danh sách bugs và technical debt tại [GitHub Issues](https://github.com/datvt243/resume-vuejs-website/issues).
Các bug ưu tiên cao ban đầu (#1–#5, #34...) đã fix và đóng. Issue #8 (JWT lưu ở
`localStorage`) — từng liệt kê ở đây là "blocked" — cũng đã được xử lý (migrate
sang httpOnly cookie, xem Roadmap bên dưới). Hiện **không còn bug/technical
debt nào đang mở**; 2 issue còn mở đều là đề xuất tính năng, xem Roadmap.

---

## Roadmap

> Danh sách dưới đây phản ánh trạng thái thật trên GitHub Issues — xem
> [wiki Roadmap](https://github.com/datvt243/resume-vuejs-website/wiki/Roadmap) để có bản luôn cập nhật.

- [x] Fix critical bugs (#1, #2, #3, #4, #5)
- [x] Migrate API URL sang environment variables (#6)
- [x] Setup CI/CD với GitHub Actions (#16, #20)
- [x] Test coverage với Vitest (#7 — 96%+ coverage cho `stores`/`composables`/`utilities` + `VeeForm.vue`; component còn lại ngoài scope ban đầu)
- [x] Chuyển toàn bộ JS → TypeScript (#13, phần lõi — vẫn còn vài file `.js` xen kẽ có chủ đích)
- [x] Dark mode toggle (#62)
- [x] Export CV ra PDF / trang in (#55)
- [x] Public CV link — xem CV qua link chia sẻ, read-only (#56)
- [x] Sắp xếp thủ công (drag-and-drop) Education/Experience/Project (#57)
- [x] Upload ảnh đại diện (#58)
- [x] Thanh tiến độ hoàn thiện hồ sơ trên Dashboard (#59)
- [x] Nhân bản (duplicate) một mục dữ liệu (#60)
- [x] Quên mật khẩu / Đổi mật khẩu (#61)
- [x] Trang cài đặt tài khoản (#63)
- [x] Slug tùy chỉnh cho link public (#117)
- [x] Chọn theme/template cho PDF export & trang public (#119)
- [x] QR code cho public share-link (#121)
- [x] Migrate Bootstrap sang Tailwind CSS (#123)
- [x] Application tracker — theo dõi nơi đã nộp CV (#118)
- [x] JWT httpOnly cookie migration, thay thế `localStorage` (#8)
- [x] Nhiều phiên bản CV (multi-profile) — subset riêng + share-link/PDF export riêng (#116)
- [ ] Import CV từ file PDF hoặc LinkedIn export (#120) — blocked: backend mới có endpoint parse LinkedIn export ZIP trên `staging` (chưa lên production), phần parse PDF thì chưa có
- [ ] Gợi ý nội dung CV bằng AI, tối ưu ATS (#122) — cần thảo luận thêm trước khi lên kế hoạch

---

## Author

**Đạt Võ** — [@datvt243](https://github.com/datvt243)

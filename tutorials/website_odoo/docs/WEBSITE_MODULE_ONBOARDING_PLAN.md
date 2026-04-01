# Onboarding Plan: Tiếp cận module `website` (Odoo)

Tài liệu này dành cho **dev mới** (đã biết Odoo cơ bản + Python/HTML/CSS/JS) để tiếp cận module **Website Builder** theo hướng **đọc source đúng chỗ + làm bài tập nhỏ có deliverable**.

> Nền tảng: bám best practices Odoo (mở rộng bằng inheritance, tách concerns, security, test) và bám lộ trình bạn đã phác thảo trong `ODOO WEBSITE DEVELOPER.md`.

---

## 0) Outcome (sau 2–4 tuần)

Dev mới có thể:

1. Hiểu “mental model” Website: page/view/menu/assets/snippet/dynamic snippet.
2. Tạo module custom (addon) mở rộng Website **không sửa core**.
3. Tạo **1 landing page** + **3 snippets cơ bản** + **1 dynamic snippet** (có option) + asset SCSS/JS.
4. Debug vấn đề thường gặp: cache QWeb, asset bundling, selector options, route/website context.
5. Viết tối thiểu 1 test (ưu tiên tour/JS tour nếu liên quan UI builder) hoặc Python test nếu có endpoint.

---

## 1) Chuẩn bị môi trường (0.5–1 ngày)

### 1.1. Cài module để học

- Bắt buộc: `website`
- Nên có để học ví dụ: `website_blog` (nhiều snippet + options), `website_sale` (nếu cần ecommerce)

### 1.2. Tooling tối thiểu

- Bật Developer mode trong Odoo
- Biết mở **Website Builder** và thao tác kéo-thả snippet
- Biết “Inspect” (DevTools) + đọc log server

### 1.3. Repo/Source để đọc

- Core website: `odoo/addons/website/`
- Ví dụ bổ trợ: `odoo/addons/website_blog/`

---

## 2) Mental model: Website module gồm những mảnh nào? (0.5–1 ngày)

Mục tiêu: hiểu **đường đi của request** và **đường đi của UI builder**.

### 2.1. Routing & controller

- Website entry point và fallback homepage: `odoo/addons/website/controllers/main.py`
  - Nhìn cách `@http.route('/', website=True)` xử lý homepage.
- Khi nào routing đi qua `ir.http` vs controller.

### 2.2. Model lõi

- `odoo/addons/website/models/website.py`
  - Website context, menu, alternate language, lookup page.

### 2.3. QWeb templates & layout

- Layout và templates chung: `odoo/addons/website/views/website_templates.xml`
- Quản lý page/view: `odoo/addons/website/views/website_pages_views.xml`
- Gợi ý đọc thêm: `odoo/addons/website/README.md`

### 2.4. Assets

- Xem cách bundle assets trong `odoo/addons/website/__manifest__.py` (khối `assets`).
- Xem pattern khai báo `<asset>` trong XML, ví dụ `odoo/addons/website/views/snippets/s_dynamic_snippet.xml`.

### 2.5. Snippet system

- Snippet library sidebar (nhóm/category): `odoo/addons/website/views/snippets/snippets.xml`
- Runtime JS cho snippets (public widget, edit/readonly): `odoo/addons/website/static/src/js/content/snippets.animation.js`
- Snippet options (editor side): dùng `@web_editor/js/editor/snippets.options` (xem ví dụ trong `website/static/src/snippets/.../options.js`).

---

## 3) Lộ trình học & làm (2–4 tuần)

Bạn có thể chạy theo 7 giai đoạn (giống doc bạn gửi) nhưng “neo” vào source của module website.

> Mỗi giai đoạn đều có: **Đọc code → Bài tập → Deliverable → Checklist review**.

### Giai đoạn 1 — QWeb Master (3–5 ngày)

**Đọc code**

- Layout/templates: `odoo/addons/website/views/website_templates.xml`
- Snippet templates cơ bản (chọn 1–2 file): `odoo/addons/website/views/snippets/` (vd. `s_banner.xml`, `s_cover.xml`)

**Bài tập**

1. Clone 1 page có sẵn (vd `/about`) bằng cách tạo view/template mới trong module custom.
2. Custom lại layout nhỏ (thêm 1 block header hoặc footer) bằng template inheritance.

**Deliverable**

- 1 addon custom (vd `website_training`) chứa 1 template kế thừa `website.layout` hoặc page template tương đương.

**Checklist review**

- Không sửa file core.
- Dùng template inheritance + xpath rõ ràng.
- Không hardcode dữ liệu đa ngôn ngữ (chuẩn bị i18n nếu cần).

---

### Giai đoạn 2 — Controller + Dynamic page (4–6 ngày)

**Đọc code**

- Controller chính: `odoo/addons/website/controllers/main.py`
- Pattern render QWeb + request.website context.

**Bài tập**

1. Tạo route `/students` (public) render danh sách từ model tự tạo (vd `website.student`).
2. Hỗ trợ filter querystring đơn giản (category/tag).

**Deliverable**

- 1 controller + 1 template QWeb hiển thị data.

**Checklist review**

- Security: không `sudo()` bừa; chỉ sudo nếu thật cần.
- Query ORM tối ưu: domain/filter đúng; tránh loop query.
- Tách logic: controller lo input + render; model lo query helper (nếu phức tạp).

---

### Giai đoạn 3 — Snippet cơ bản (5–7 ngày)

**Đọc code**

- Snippet catalog: `odoo/addons/website/views/snippets/snippets.xml`
- Chọn 1 snippet đơn giản để học cấu trúc (vd `s_banner.xml`).

**Bài tập**

1. Tạo 3 snippets: Hero / Features / Pricing.
2. Đăng ký xuất hiện trong Website Builder (category “Custom”).

**Deliverable**

- 3 snippet templates + thumbnails (có thể dùng placeholder svg/png tối giản).

**Checklist review**

- HTML sạch, dùng bootstrap grid.
- Snippet có class prefix riêng (vd `s_my_hero`).
- Nội dung có thể edit inline (đừng set `o_not_editable` nếu không cần).

---

### Giai đoạn 4 — Snippet nâng cao (1–2 tuần)

**Đọc code**

- Dynamic snippet template + options: `odoo/addons/website/views/snippets/s_dynamic_snippet.xml`
- Dynamic snippet options JS: `odoo/addons/website/static/src/snippets/s_dynamic_snippet/options.js`

**Bài tập**

1. Tạo 1 snippet hiển thị dữ liệu (vd: students/products/blog posts).
2. Tạo snippet options:
   - đổi title
   - đổi background style/class
   - chọn số lượng item

**Deliverable**

- 1 snippet “dynamic” có options hoạt động trong builder.

**Checklist review**

- Option lưu state qua `data-*` attribute (theo pattern của website).
- JS không leak global; dùng `/** @odoo-module **/`.
- Không gọi RPC thừa; cache đơn giản nếu cần.

---

### Giai đoạn 5 — Assets + UI polish (5–7 ngày)

**Đọc code**

- Asset bundling: `odoo/addons/website/__manifest__.py`
- SCSS chung: `odoo/addons/website/static/src/scss/website.scss`

**Bài tập**

1. Thêm SCSS cho 3 snippets.
2. Thêm 1 hiệu ứng nhẹ (hover/scroll) bằng JS của snippet (public widget) hoặc CSS.

**Deliverable**

- Assets được load đúng bundle, không phá performance.

**Checklist review**

- Tránh hardcode màu “lạ”: ưu tiên biến/theme/bootstrap.
- Class naming rõ, không đụng core selectors.
- Test responsive (mobile/tablet/desktop).

---

### Giai đoạn 6 — OWL (1–2 tuần, optional nếu cần UI phức tạp)

**Mục tiêu**: hiểu khi nào cần OWL (component, state, interaction phức tạp) thay vì jQuery/publicWidget.

**Bài tập**

- Làm 1 component nhỏ trong frontend (vd carousel/testimonial có state) và mount đúng asset.

**Deliverable**

- 1 OWL component chạy trong trang website.

---

### Giai đoạn 7 — Project thực chiến (2–3 tuần)

**Project**: SaaS Landing Page

- Sections: Hero, Features, Pricing, Testimonials, CTA
- Snippet reusable
- Ít nhất 1 section dynamic (data từ DB)

**Definition of Done**

- Tạo được landing page bằng drag-drop + snippets custom.
- Có option để chỉnh nội dung/kiểu hiển thị.
- Responsive + asset load ổn.

---

## 4) Kế hoạch theo tuần (gợi ý nhanh)

### Tuần 1 — Nắm nền tảng & QWeb/Controller

- Ngày 1: setup + đọc mental model
- Ngày 2–3: QWeb + clone page
- Ngày 4–5: controller `/students` + template render

### Tuần 2 — Snippet cơ bản + assets

- Ngày 1–3: 3 snippets cơ bản + đăng ký vào builder
- Ngày 4–5: SCSS/JS polish + responsive

### Tuần 3 — Snippet nâng cao (options + dynamic)

- Implement options UI + lưu data attributes
- 1 snippet dynamic fetch data

### Tuần 4 — Project + test

- Build landing page hoàn chỉnh
- Viết 1 test/tour + fix bug/corner case

---

## 5) Checklist review cuối (dành cho reviewer/lead)

- ✅ Module structure chuẩn (`__manifest__.py`, `models/`, `views/`, `controllers/`, `static/`, `security/`).
- ✅ Mở rộng bằng inheritance, không sửa core.
- ✅ ACL/record rule nếu có model mới.
- ✅ Không hardcode; hỗ trợ translation cho string quan trọng.
- ✅ Asset bundling đúng; không phá `web.assets_frontend`.
- ✅ Snippet options hoạt động ổn trong builder.

---

## 6) Pitfalls thường gặp (nhắc dev mới)

- **Cache/QWeb**: đổi template mà không thấy cập nhật → kiểm tra assets cache / qweb cache.
- **XPath quá “mỏng”**: inherit view dễ fail khi upstream đổi DOM → dùng xpath đủ đặc trưng.
- **Security**: public route phải cẩn thận quyền truy cập model.
- **Performance**: tránh N+1 query, tránh RPC mỗi scroll.

---

## 7) Tài liệu tham khảo trong repo

- Lộ trình tổng quan bạn cung cấp: `tutorials/website_odoo/docs/ODOO WEBSITE DEVELOPER.md`
- Website module overview: `odoo/addons/website/README.md`
- Source module:
  - `odoo/addons/website/`
  - `odoo/addons/website_blog/`

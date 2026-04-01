# Kế hoạch phát triển Landing Page cho MCP Stitch (Odoo Website)

Tài liệu này gom toàn bộ các bước trong:
- `WEBSITE_MODULE_ONBOARDING_PLAN.md`
- `ODOO WEBSITE DEVELOPER.md`
- `GIAI_DOAN_1_QWEB_MASTER.md`

Mục tiêu là đi từ học nhanh -> triển khai thật một landing page cho MCP Stitch bằng Odoo Website, theo đúng best practice Odoo (inheritance, modular, không sửa core).

---

## Trạng thái triển khai hiện tại

1. Giai đoạn 1: Hoan thanh
   - Da co page `/about` theo QWeb.
   - Da co layout inheritance bang xpath (khong sua core).
2. Giai đoạn 2: Dang hoan thien
   - Da co route `/mcp/stitch` render data tu model.
   - Da bo sung querystring filter (`segment`, `q`) trong controller.
   - Da bo sung endpoint `/mcp/stitch/testimonials` + model testimonials.
   - Da bo sung backend views/ACL/seed data cho feature + testimonial.
   - Can restart process Odoo dang chay de nap route Python moi vao runtime.
3. Giai đoạn 3: Da bat dau
   - Da them 3 snippets co ban Hero / Features / Pricing vao Website Builder.
   - Dang tiep tuc phan options + dynamic snippet o giai doan 4.
4. Giai đoạn 5-7: Chua trien khai
   - Ke tiep: animation bo sung, test/tour, hardening.

---

## 1) Mục tiêu dự án

Sau khi hoàn thành, team có thể:
1. Build landing page MCP Stitch bằng Website Builder + module custom.
2. Có 3 snippet cơ bản + 1 dynamic snippet có options.
3. Có asset SCSS/JS, responsive tốt, hiệu ứng nhẹ.
4. Có quy trình debug cache/view chain/assets.
5. Có ít nhất 1 test (tour hoặc Python) để bảo vệ chức năng chính.

---

## 2) Phạm vi chức năng landing page

### 2.1. Sections bắt buộc
1. Hero
2. Features
3. Pricing
4. Testimonials
5. CTA

### 2.2. Thành phần tái sử dụng
1. 3 snippet cơ bản: `Hero`, `Features`, `Pricing`
2. 1 dynamic snippet: `Testimonials` hoặc `Use Cases` lấy dữ liệu từ model custom
3. Snippet options: đổi title, style/background, số lượng item

### 2.3. Kênh triển khai
1. Odoo Website Builder để biên tập nội dung
2. Module custom để giữ code sạch, dễ upgrade
3. MCP Stitch để lên ý tưởng UI/variant nhanh trước khi hiện thực hóa vào snippet Odoo

---

## 3) Kiến trúc module đề xuất

```text
website_odoo/
├── __init__.py
├── __manifest__.py
├── controllers/
│   ├── __init__.py
│   └── main.py
├── models/
│   ├── __init__.py
│   ├── website_landing_item.py
│   └── website_landing_testimonial.py
├── security/
│   ├── ir.model.access.csv
│   └── security_rules.xml
├── data/
│   ├── website_page_data.xml
│   └── website_seed_data.xml
├── views/
│   ├── menu.xml
│   ├── page_landing.xml
│   ├── snippets.xml
│   ├── snippet_options.xml
│   └── template/
│       └── header.xml
├── static/
│   └── src/
│       ├── scss/
│       │   └── landing.scss
│       ├── js/
│       │   ├── landing_snippets.js
│       │   └── snippet_options.js
│       └── img/
│           └── snippets/
└── tests/
    ├── __init__.py
    ├── test_landing_routes.py
    └── test_landing_tour.js
```

---

## 4) Kế hoạch theo 7 giai đoạn (bao gồm toàn bộ bước trong docs)

## Giai đoạn 1 - QWeb Master (3-5 ngày)

### Đọc source
1. `odoo/addons/website/views/website_templates.xml`
2. `odoo/addons/website/data/website_data.xml`
3. `odoo/addons/website/views/website_pages_views.xml`

### Bài tập
1. Clone trang `/about` (hoặc `/about-training`) trong module custom.
2. Dùng template inheritance để custom một block của `website.layout`.
3. Xác nhận hiểu COW (Builder edit tạo inherited view trong DB).

### Deliverable
1. Page QWeb chạy được với `t-call="website.layout"`.
2. Có `.oe_structure` để kéo thả snippet.
3. Có 1 override layout bằng xpath.

### Checklist review
1. Không sửa file core.
2. XPath đủ đặc trưng.
3. Trang mở được với `?debug=assets`.

---

## Giai đoạn 2 - Controller + Dynamic Page (4-6 ngày)

### Đọc source
1. `odoo/addons/website/controllers/main.py`
2. Các ví dụ route website trong core module website/blog/shop.

### Bài tập
1. Tạo route public `/mcp/stitch` và `/mcp/stitch/testimonials`.
2. Truyền dữ liệu từ model ra template QWeb.
3. Hỗ trợ querystring filter đơn giản (tag/category/segment).

### Deliverable
1. 1 controller + 1 template render data thật.
2. Có fallback dữ liệu khi DB trống.

### Checklist review
1. Không `sudo()` bừa bãi.
2. Domain/query không N+1.
3. Tách logic query sang model helper nếu phức tạp.

---

## Giai đoạn 3 - Snippet cơ bản (5-7 ngày)

### Đọc source
1. `odoo/addons/website/views/snippets/snippets.xml`
2. 1-2 snippet mẫu (`s_banner.xml`, `s_cover.xml` hoặc tương đương).

### Bài tập
1. Tạo snippet Hero.
2. Tạo snippet Features.
3. Tạo snippet Pricing.
4. Đăng ký vào Website Builder category `Custom`.

### Deliverable
1. 3 snippet templates + thumbnail.
2. Có class prefix riêng (`s_mcp_hero`, `s_mcp_features`, `s_mcp_pricing`).

### Checklist review
1. HTML sạch, dùng grid bootstrap.
2. Nội dung inline-editable.
3. Không xung đột class core.

---

## Giai đoạn 4 - Snippet nâng cao (1-2 tuần)

### Đọc source
1. `odoo/addons/website/views/snippets/s_dynamic_snippet.xml`
2. `odoo/addons/website/static/src/snippets/s_dynamic_snippet/options.js`

### Bài tập
1. Tạo model dữ liệu cho testimonial/use-case.
2. Tạo dynamic snippet lấy dữ liệu từ DB.
3. Tạo snippet options:
   - đổi title
   - đổi style/background
   - chọn số lượng item

### Deliverable
1. 1 dynamic snippet hoạt động trong builder.
2. Options lưu qua `data-*` attributes.

### Checklist review
1. JS dạng module (`/** @odoo-module **/`).
2. Không RPC thừa.
3. Có empty-state UI.

---

## Giai đoạn 5 - Assets + Animation (5-7 ngày)

### Đọc source
1. `odoo/addons/website/__manifest__.py` (khối assets)
2. SCSS pattern trong website core.

### Bài tập
1. Tạo SCSS cho toàn landing.
2. Thêm animation nhẹ: hover, reveal on scroll, button transition.
3. Tối ưu ảnh/banner.

### Deliverable
1. Assets load đúng bundle.
2. UI đồng bộ, responsive tốt.

### Checklist review
1. Không hardcode màu khó maintain.
2. Ưu tiên token/theme variables.
3. Kiểm tra mobile/tablet/desktop.

---

## Giai đoạn 6 - OWL (optional, 1-2 tuần)

### Mục tiêu
Dùng khi section cần state/interaction phức tạp hơn public widget thường.

### Bài tập
1. Làm component OWL nhỏ (carousel testimonials hoặc pricing toggle monthly/yearly).
2. Mount qua assets frontend đúng cách.

### Deliverable
1. 1 OWL component chạy ổn trên landing page.

### Checklist review
1. State rõ ràng.
2. Event handling sạch.
3. Không gây lỗi ở chế độ Edit của builder.

---

## Giai đoạn 7 - Project thực chiến (2-3 tuần)

### Scope
1. Build full landing page MCP Stitch với đủ 5 sections.
2. Dùng snippets để team marketing có thể tự chỉnh.
3. Có ít nhất 1 section dynamic từ DB.

### Definition of Done
1. Drag-drop được và không vỡ layout.
2. Có options để chỉnh hiển thị.
3. Responsive đạt yêu cầu.
4. Qua checklist performance/security.
5. Có test tối thiểu.

---

## 5) Luồng dùng MCP Stitch trong dự án này

## Mục tiêu của Stitch
Tăng tốc thiết kế và khám phá phương án giao diện trước khi hiện thực hóa vào Odoo snippets.

## Quy trình đề xuất
1. Dùng Stitch để tạo nhanh 2-3 biến thể landing page (Hero + Features + CTA).
2. Chọn phương án tốt nhất theo tiêu chí conversion và khả năng map sang snippet.
3. Chốt design tokens: typography, spacing, color, radius.
4. Dùng output làm blueprint để code lại bằng QWeb + SCSS trong module Odoo.

## Cách làm theo vòng lặp
1. Round 1: khám phá bố cục tổng thể.
2. Round 2: refine section-level (hero/pricing/testimonial).
3. Round 3: finalize style và responsive behavior.
4. Sau mỗi round: ghi lại quyết định vào docs để tránh trôi scope.

## Lưu ý quan trọng
1. Stitch là công cụ thiết kế/ideation, Odoo module mới là nguồn sự thật chạy production.
2. Không nhúng khóa API vào tài liệu public/repo.
3. Luôn quy đổi output Stitch thành template/snippet có thể kế thừa và bảo trì.

---

## 6) Kế hoạch theo tuần (4 tuần)

## Tuần 1
1. Setup, mental model, QWeb master.
2. Tạo page nền + layout override.
3. Chốt wireframe bằng Stitch round 1.

## Tuần 2
1. Làm controller + dữ liệu thật.
2. Hoàn thành 3 snippets cơ bản.
3. SCSS nền và responsive cơ bản.

## Tuần 3
1. Dynamic snippet + snippet options.
2. Stitch round 2 để refine section chính.
3. Tối ưu assets và animation.

## Tuần 4
1. Hoàn thiện project landing full flow.
2. Test/tour + hardening.
3. Handover tài liệu và checklist vận hành.

---

## 7) Test plan tối thiểu

1. Route test:
   - `/mcp/stitch` trả về 200.
   - querystring filter hoạt động.
2. UI test (tour):
   - kéo thả snippet được.
   - options thay đổi hiển thị đúng.
3. Data test:
   - dynamic snippet có dữ liệu.
   - empty-state hiển thị đúng.
4. Regression test:
   - upgrade module không lỗi xpath/view.

---

## 8) Checklist review cuối dự án

1. Module structure đúng chuẩn Odoo.
2. ACL/record rules đầy đủ cho model mới.
3. Không sửa core, chỉ inheritance.
4. Strings chính có thể translate.
5. Asset bundling chuẩn, không phá `web.assets_frontend`.
6. Snippet options ổn định trong chế độ Edit.
7. Có runbook debug cache/view chain.

---

## 9) Rủi ro và phương án giảm rủi ro

1. Cache/QWeb gây hiểu nhầm chưa update.
   - Luôn test với `?debug=assets`.
2. XPath dễ gãy khi upstream đổi.
   - Viết xpath đủ đặc trưng, tránh replace khối lớn.
3. Public route lộ dữ liệu.
   - Domain chặt, hạn chế sudo.
4. Dynamic snippet chậm.
   - Giảm RPC, tối ưu query, cache hợp lý.

---

## 10) Tài liệu đầu ra cần có

1. Technical design (kiến trúc + sơ đồ section/snippet).
2. Mapping UI từ Stitch -> QWeb snippets.
3. Hướng dẫn vận hành/upgrade module.
4. Checklist QA trước khi publish.

---

## 11) Kết luận

Kế hoạch này bám đủ toàn bộ các bước trong tài liệu học Odoo Website hiện có, đồng thời thêm luồng ứng dụng MCP Stitch để tăng tốc thiết kế và giảm vòng lặp thử-sai. Kết quả cuối là một landing page có thể vận hành thật trong Odoo, dễ bảo trì và dễ mở rộng.

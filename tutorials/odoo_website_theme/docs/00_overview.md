# Hướng Dẫn Phát Triển Odoo Website Theme — Tổng Quan

> **Module mẫu:** `website_airproof` (tại `tutorials/website_airproof/`)
> **Tài liệu gốc:** [Odoo 18.0 — Website Themes](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes.html)

---

## Giới Thiệu

Bộ tài liệu này hướng dẫn bạn tạo một **Odoo Website Theme** hoàn chỉnh từ đầu, sử dụng module `website_airproof` (chủ đề cho công ty bán drone) làm ví dụ xuyên suốt.

Khi hoàn thành, bạn sẽ có thể:
- Tạo module theme theo đúng cấu trúc chuẩn Odoo
- Tùy chỉnh màu sắc, font, biến Bootstrap
- Xây dựng header/footer custom
- Tạo menu điều hướng và mega menu
- Thêm trang tĩnh và cấu hình SEO
- Thêm ảnh, font chữ tùy chỉnh
- Tạo building blocks (snippets) tái sử dụng
- Thêm shapes, gradients, animations
- Cấu hình forms
- Xuất bản đa ngôn ngữ
- Deploy lên production

---

## Cấu Trúc Module Airproof Hoàn Chỉnh

```
website_airproof/
├── __manifest__.py              ← Khai báo module, dependencies, assets
├── __init__.py
│
├── data/                        ← Dữ liệu XML khởi tạo
│   ├── presets.xml              ← Theme presets (color palette)
│   ├── website.xml              ← Website config
│   ├── menu.xml                 ← Cấu trúc menu điều hướng
│   ├── gradients.xml            ← Custom gradients
│   ├── shapes.xml               ← Custom shapes
│   ├── images.xml               ← Đăng ký ảnh vào ir.attachment
│   └── pages/
│       ├── home.xml             ← Nội dung trang Home
│       └── contact.xml          ← Nội dung trang Contact
│
├── views/                       ← QWeb templates
│   ├── website_templates.xml    ← Header, Footer, Copyright
│   ├── website_sale_templates.xml ← Shop, Product page
│   ├── website_sale_wishlist_templates.xml
│   ├── new_page_template_templates.xml ← Page templates
│   └── snippets/
│       ├── options.xml          ← Snippet options
│       └── s_airproof_carousel.xml ← Custom carousel
│
├── static/
│   ├── description/             ← Screenshots cho App Store
│   ├── fonts/                   ← Custom font files
│   ├── shapes/                  ← Custom SVG shapes
│   └── src/
│       ├── img/                 ← Static images
│       │   └── wbuilder/        ← Website Builder thumbnails
│       ├── js/
│       │   └── mouse_follower.js ← Custom JS
│       ├── scss/
│       │   ├── primary_variables.scss     ← Biến màu sắc chính
│       │   ├── bootstrap_overridden.scss  ← Override Bootstrap
│       │   ├── font.scss                  ← Font imports
│       │   ├── layout/
│       │   │   └── header.scss
│       │   ├── components/
│       │   │   └── mouse_follower.scss
│       │   ├── pages/
│       │   │   ├── product_page.scss
│       │   │   └── shop.scss
│       │   └── snippets/
│       │       ├── caroussel.scss
│       │       └── newsletter.scss
│       └── snippets/
│           └── s_airproof_carousel/
│               └── 000.scss
│
└── i18n/                        ← Bản dịch
    └── vi.po
```

---

## Danh Sách Tài Liệu

| # | File | Nội dung | Link gốc |
|---|------|----------|----------|
| 0 | `00_overview.md` | Tổng quan (file này) | — |
| 1 | `01_setup.md` | Cài đặt môi trường, cấu trúc DB | [Setup](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/setup.html) |
| 2 | `02_theming.md` | Màu sắc, font, Bootstrap variables | [Theming](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/theming.html) |
| 3 | `03_layout.md` | Header, Footer, Copyright | [Layout](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/layout.html) |
| 4 | `04_navigation.md` | Menu, Mega Menu | [Navigation](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/navigation.html) |
| 5 | `05_pages.md` | Trang tĩnh, page templates | [Pages](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/pages.html) |
| 6 | `06_media.md` | Ảnh, fonts, favicon | [Media](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/media.html) |
| 7 | `07_building_blocks.md` | Custom snippets/blocks | [Building blocks](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/building_blocks.html) |
| 8 | `08_shapes.md` | Custom SVG shapes | [Shapes](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/shapes.html) |
| 9 | `09_gradients.md` | Custom gradients | [Gradients](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/gradients.html) |
| 10 | `10_animations.md` | Scroll animations | [Animations](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/animations.html) |
| 11 | `11_forms.md` | Custom forms | [Forms](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/forms.html) |
| 12 | `12_translations.md` | Đa ngôn ngữ i18n | [Translations](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/translations.html) |
| 13 | `13_going_live.md` | Deploy production | [Going live](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/going_live.html) |

---

## Lộ Trình Học

```
Bước 1: Setup (01) → Bước 2: Theming (02) → Bước 3: Layout (03)
    ↓
Bước 4: Navigation (04) → Bước 5: Pages (05) → Bước 6: Media (06)
    ↓
Bước 7: Building Blocks (07) → Bước 8-10: Visual (08, 09, 10)
    ↓
Bước 11: Forms (11) → Bước 12: i18n (12) → Bước 13: Go Live (13)
```

> **Quan trọng:** Thực hành từng bước theo thứ tự. Mỗi bước xây dựng trên nền của bước trước.

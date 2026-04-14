# Phần 2: Theming — Màu Sắc, Font, Bootstrap Variables

> **Tài liệu gốc:** [Theming](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/theming.html)
> **Mục tiêu:** Định nghĩa palette màu, font chữ, tùy chỉnh Bootstrap variables cho theme.

---

## Tổng Quan — Hệ Thống SCSS Của Odoo

Odoo dùng **Bootstrap 5** làm CSS framework, với **SCSS variables** được override theo 3 cấp độ:

```
web._assets_primary_variables
    → primary_variables.scss        ← Biến màu của THEME (mình viết)
        ↓
web._assets_frontend_helpers
    → bootstrap_overridden.scss     ← Override Bootstrap components
        ↓
Bootstrap defaults
    → Tất cả style mặc định Bootstrap
```

**Quan trọng:** Thứ tự load asset rất quan trọng. Biến trong `primary_variables.scss` phải được load TRƯỚC Bootstrap để có hiệu lực.

---

## 1. Cập Nhật `__manifest__.py`

Khai báo các file SCSS trong đúng asset bundle:

```python
{
    'name': 'Airproof Theme',
    'category': 'Website/Theme',
    'depends': ['website'],
    'data': [
        'data/presets.xml',  # Color presets
    ],
    'assets': {
        # Bundle 1: Primary variables (load TRƯỚC Bootstrap)
        'web._assets_primary_variables': [
            'website_airproof/static/src/scss/primary_variables.scss',
        ],
        # Bundle 2: Bootstrap overrides (load TRƯỚC Bootstrap, SAU primary_variables)
        'web._assets_frontend_helpers': [
            ('prepend', 'website_airproof/static/src/scss/bootstrap_overridden.scss'),
        ],
        # Bundle 3: Frontend assets (style thông thường)
        'web.assets_frontend': [
            'website_airproof/static/src/scss/font.scss',
            # Thêm SCSS khác...
        ],
    },
}
```

> **Tại sao `prepend`?** Dùng `prepend` cho `bootstrap_overridden.scss` để đưa file lên đầu danh sách trong bundle, đảm bảo được load trước các file khác cùng bundle.

---

## 2. File `primary_variables.scss` — Định Nghĩa Màu Theme

Tạo file `static/src/scss/primary_variables.scss`:

```scss
//------------------------------------------------------------------------------
// Odoo Color System
// Odoo dùng "color palette" với 5 màu chính (o-color-1 đến o-color-5)
// Những biến này được dùng xuyên suốt website builder
//------------------------------------------------------------------------------

// Palette màu chính (5 màu cơ bản của theme)
$o-color-1: #101728;  // Màu chủ đạo - Dark navy (Airproof)
$o-color-2: #E8E8E8;  // Màu phụ - Light gray
$o-color-3: #FFFFFF;  // Trắng
$o-color-4: #E9ECEF;  // Light background
$o-color-5: #101728;  // Accent (giống màu 1)

// Map màu để Odoo Website Builder nhận biết
$o-colors: (
    'o-color-1': $o-color-1,
    'o-color-2': $o-color-2,
    'o-color-3': $o-color-3,
    'o-color-4': $o-color-4,
    'o-color-5': $o-color-5,
);

//------------------------------------------------------------------------------
// Bootstrap Color Mapping
// Ánh xạ Bootstrap variables với Odoo palette
//------------------------------------------------------------------------------

// Primary color (nút, links chính)
$primary: $o-color-1;

// Body (nền trang)
$body-bg: $o-color-3;
$body-color: $o-color-1;

// Headings
$headings-color: $o-color-1;

// Link
$link-color: $o-color-1;
$link-hover-color: darken($o-color-1, 10%);

//------------------------------------------------------------------------------
// Typography
//------------------------------------------------------------------------------

// Font families (định nghĩa tên, file font trong font.scss)
$o-theme-font: "Poppins";           // Font chính
$o-theme-font-2: "Roboto Mono";     // Font phụ (code, labels)

// Font sizes
$font-size-base: 1rem;              // 16px
$h1-font-size: 3rem;
$h2-font-size: 2rem;
$h3-font-size: 1.5rem;

// Font weights
$font-weight-light: 300;
$font-weight-normal: 400;
$font-weight-bold: 700;
$headings-font-weight: 700;

//------------------------------------------------------------------------------
// Spacing & Layout
//------------------------------------------------------------------------------

// Border radius
$border-radius: 0.5rem;
$border-radius-lg: 1rem;
$border-radius-sm: 0.25rem;

// Shadows
$box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
$box-shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);

//------------------------------------------------------------------------------
// Buttons
//------------------------------------------------------------------------------

$btn-border-radius: $border-radius;
$btn-padding-x: 1.5rem;
$btn-padding-y: 0.75rem;
$btn-font-weight: 600;

//------------------------------------------------------------------------------
// Grid & Container
//------------------------------------------------------------------------------

// Container max widths
$container-max-widths: (
    sm: 540px,
    md: 720px,
    lg: 960px,
    xl: 1140px,
    xxl: 1320px
);
```

> **Tip:** Xem tất cả Bootstrap variables tại: `addons/web/static/src/scss/bootstrap_overridden.scss` trong Odoo source để biết có thể override những gì.

---

## 3. File `bootstrap_overridden.scss` — Override Bootstrap Components

```scss
// Override Bootstrap components cụ thể
// File này load TRƯỚC Bootstrap, nên override bằng biến (không phải CSS)

// Navbar
$navbar-padding-y: 0;
$navbar-nav-link-padding-x: 1rem;
$navbar-light-color: #101728;
$navbar-light-hover-color: darken(#101728, 20%);
$navbar-light-active-color: #101728;

// Cards
$card-border-radius: 0.75rem;
$card-border-color: rgba(0, 0, 0, 0.08);

// Input fields
$input-border-radius: 0.5rem;
$input-border-color: #dee2e6;
$input-focus-border-color: #101728;
$input-focus-box-shadow: none;

// Dropdowns
$dropdown-border-radius: 0.5rem;
$dropdown-box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.15);

// Breakpoints (nếu cần thay đổi)
// $grid-breakpoints: (
//     xs: 0,
//     sm: 576px,
//     md: 768px,
//     lg: 992px,
//     xl: 1200px,
//     xxl: 1400px
// );
```

---

## 4. File `font.scss` — Import Custom Fonts

```scss
// Cách 1: Import từ Google Fonts (internet cần thiết)
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap');

// Cách 2: Import font local (khuyến khích cho production)
// Font files đặt trong static/fonts/
@font-face {
    font-family: 'Poppins';
    src: url('/website_airproof/static/fonts/Poppins-Regular.woff2') format('woff2'),
         url('/website_airproof/static/fonts/Poppins-Regular.woff') format('woff');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'Poppins';
    src: url('/website_airproof/static/fonts/Poppins-Bold.woff2') format('woff2'),
         url('/website_airproof/static/fonts/Poppins-Bold.woff') format('woff');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
}
```

> **Airproof dùng:** Font từ Google Fonts (Poppins + Roboto Mono)

---

## 5. Color Presets — `data/presets.xml`

Color presets cho phép người dùng chọn style màu sắc từ Website Builder. Đây là tính năng nâng cao của Odoo Website Builder.

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Preset 1: Light mode (default) -->
    <record id="colorize_body_1" model="website">
        <field name="name">Light</field>
        <field name="customize_show">True</field>
        <field name="key">website_airproof.colorize_body_1</field>
        <field name="type">qweb</field>
        <field name="arch" type="xml">
            <xpath expr="//body" position="attributes">
                <attribute name="class" add="o_colorize_1" separator=" "/>
            </xpath>
        </field>
    </record>
</odoo>
```

**Airproof presets thực tế** (từ `data/presets.xml`):

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="website_airproof_preset_1" model="ir.ui.view">
        <field name="name">Airproof - Preset 1</field>
        <field name="type">qweb</field>
        <field name="key">website_airproof.preset_1</field>
        <field name="website_published">True</field>
        <field name="arch" type="xml">
            <!-- Override CSS variables cho preset này -->
            <data>
                <xpath expr="//body" position="attributes">
                    <attribute name="style">
                        --o-cc1-bg: #101728;
                        --o-cc1-text: #FFFFFF;
                        --o-cc2-bg: #E8E8E8;
                        --o-cc2-text: #101728;
                    </attribute>
                </xpath>
            </data>
        </field>
    </record>
</odoo>
```

---

## 6. Color Combination Classes (CC)

Odoo dùng hệ thống "Color Combinations" (CC1-CC5) để apply màu vào các sections. Trong `primary_variables.scss`, định nghĩa:

```scss
//------------------------------------------------------------------------------
// Color Combinations
// CSS custom properties cho 5 color combinations
// Tự động áp dụng khi user chọn màu section trong Website Builder
//------------------------------------------------------------------------------

// CC1 - Primary (dark)
$o-cc1-bg: $o-color-1;
$o-cc1-text: #FFFFFF;
$o-cc1-headings: #FFFFFF;
$o-cc1-btn-primary-bg: #FFFFFF;
$o-cc1-btn-primary-color: $o-color-1;

// CC2 - Secondary (light)
$o-cc2-bg: $o-color-2;
$o-cc2-text: $o-color-1;
$o-cc2-headings: $o-color-1;

// CC3 - Accent
$o-cc3-bg: $o-color-5;
$o-cc3-text: #FFFFFF;
$o-cc3-headings: #FFFFFF;

// CC4 - Light
$o-cc4-bg: $o-color-4;
$o-cc4-text: $o-color-1;

// CC5 - Neutral
$o-cc5-bg: #F8F9FA;
$o-cc5-text: $o-color-1;
```

---

## 7. Airproof `primary_variables.scss` Thực Tế

Xem file gốc của module Airproof:

```scss
// primary_variables.scss của website_airproof

// Color Palette
$o-color-1: #101728;
$o-color-2: #E8E8E8;
$o-color-3: #FFFFFF;
$o-color-4: #E9ECEF;
$o-color-5: #101728;

// Typography
$o-theme-font: "DM Sans";
$o-theme-font-url: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300;1,9..40,400;1,9..40,500;1,9..40,600;1,9..40,700&display=swap";

// Headings
$headings-font-weight: 700;

// Buttons
$btn-border-radius: 2px;
$btn-border-radius-sm: 2px;
$btn-border-radius-lg: 2px;
```

---

## 8. Kiểm Tra Theme

Sau khi tạo xong các file SCSS:

1. **Restart server** (vì thêm file mới vào assets):
   ```bash
   ./odoo-bin -d airproof_dev -u website_airproof --dev=xml
   ```

2. **Mở website** và inspect CSS:
   - `F12` → Elements → xem CSS variables trên `body`
   - Kiểm tra font đã load chưa trong Network tab

3. **Kiểm tra trong Website Builder:**
   - Vào Website → klick nút "Customize" (pencil icon)
   - Theme section → kiểm tra colors hiển thị đúng


---

## Checklist Bước 2

- [ ] Tạo `static/src/scss/primary_variables.scss` với ít nhất 5 màu
- [ ] Tạo `static/src/scss/bootstrap_overridden.scss`
- [ ] Tạo `static/src/scss/font.scss` với font import
- [ ] Khai báo đúng các file trong `__manifest__.py`
- [ ] Restart server và kiểm tra CSS load đúng
- [ ] Colors hiển thị trong Website Builder
- [ ] Font chữ áp dụng trên trang web

**Bước tiếp theo:** [Phần 3 — Layout](./03_layout.md)

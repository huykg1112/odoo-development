# Phần 6: Media — Ảnh, Fonts & Favicon

> **Tài liệu gốc:** [Media](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/media.html)
> **Mục tiêu:** Thêm ảnh, fonts tùy chỉnh và favicon vào theme.

---

## 1. Quản Lý Ảnh Trong Odoo Theme

Odoo lưu ảnh trong model `ir.attachment`. Khi theme import ảnh qua XML, Odoo tạo một attachment record và map với `external_id` để reference sau này.

**Tại sao không dùng đường dẫn static trực tiếp?**
- Reference qua external ID cho phép thay thế ảnh mà không cần đổi code
- Người dùng có thể upload ảnh mới qua Website Builder
- Odoo quản lý filestore tập trung

---

## 2. Đăng Ký Ảnh vào `data/images.xml`

### 2.1 Cấu trúc file images.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Đăng ký từng ảnh như một ir.attachment record -->
    <record id="img_hero" model="ir.attachment">
        <field name="name">Airproof Hero Image</field>
        <field name="datas" type="base64" file="website_airproof/static/src/img/hero.jpg"/>
        <field name="res_model">ir.ui.view</field>
        <field name="public">True</field>
        <field name="mimetype">image/jpeg</field>
    </record>

    <record id="img_mini" model="ir.attachment">
        <field name="name">Drone Airproof Mini</field>
        <field name="datas" type="base64" file="website_airproof/static/src/img/drone_mini.jpg"/>
        <field name="res_model">ir.ui.view</field>
        <field name="public">True</field>
        <field name="mimetype">image/jpeg</field>
    </record>

    <record id="img_pro" model="ir.attachment">
        <field name="name">Drone Airproof Pro</field>
        <field name="datas" type="base64" file="website_airproof/static/src/img/drone_pro.jpg"/>
        <field name="res_model">ir.ui.view</field>
        <field name="public">True</field>
        <field name="mimetype">image/jpeg</field>
    </record>

    <!-- Icon images -->
    <record id="img_phone" model="ir.attachment">
        <field name="name">Phone icon</field>
        <field name="datas" type="base64" file="website_airproof/static/src/img/icon_phone.svg"/>
        <field name="res_model">ir.ui.view</field>
        <field name="public">True</field>
        <field name="mimetype">image/svg+xml</field>
    </record>

    <record id="img_envelop" model="ir.attachment">
        <field name="name">Email icon</field>
        <field name="datas" type="base64" file="website_airproof/static/src/img/icon_email.svg"/>
        <field name="res_model">ir.ui.view</field>
        <field name="public">True</field>
        <field name="mimetype">image/svg+xml</field>
    </record>
</odoo>
```

### 2.2 Sử Dụng Ảnh Trong Templates

```xml
<!-- Cách 1: Reference qua ir.attachment external ID -->
<img src="/web/image/website_airproof.img_mini"
     alt="Drone Airproof Mini"
     class="img-fluid"/>

<!-- Cách 2: Reference qua attachment ID (dynamic, không khuyến khích trong theme code) -->
<img t-att-src="'/web/image/%s' % image_id" alt=""/>

<!-- Cách 3: Static URL (chỉ dùng trong code SCSS/JS) -->
<!-- /website_airproof/static/src/img/hero.jpg -->
```

**Format URL:**
- `attachment.id` → `/web/image/<id>`
- `attachment.external_id` → `/web/image/<module_name>.<xml_id>`

### 2.3 Cấu Trúc Thư Mục Ảnh

```
static/src/img/
├── hero.jpg                   ← Hero banner
├── drone_mini.jpg             ← Product images
├── drone_pro.jpg
├── drone_robin.jpg
├── drone_falcon.jpg
├── drone_eagle.jpg
├── icon_phone.svg             ← UI icons
├── icon_email.svg
└── wbuilder/                  ← Website Builder thumbnails
    ├── template-header-opt.svg    ← Header option thumbnail
    └── template-footer-opt.svg   ← Footer option thumbnail
```

---

## 3. Favicon

### 3.1 Upload Favicon qua Website Settings

Cách đơn giản nhất: Website → Configuration → Settings → Upload favicon.

### 3.2 Đặt Favicon Trong Theme Code

Thêm favicon record vào `data/website.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="website_airproof_config" model="website">
        <!-- Favicon phải là attachment được đăng ký trước -->
        <field name="favicon" type="base64"
               file="website_airproof/static/src/img/favicon.ico"/>
    </record>
</odoo>
```

Hoặc đăng ký như attachment:
```xml
<record id="website_favicon" model="ir.attachment">
    <field name="name">Airproof Favicon</field>
    <field name="datas" type="base64" file="website_airproof/static/src/img/favicon.png"/>
    <field name="res_model">ir.ui.view</field>
    <field name="public">True</field>
    <field name="mimetype">image/png</field>
</record>
```

---

## 4. Custom Fonts

### 4.1 Font Files Local

Tạo thư mục `static/fonts/`:

```
static/fonts/
├── FamilyName-Regular.woff2
├── FamilyName-Regular.woff
├── FamilyName-Bold.woff2
├── FamilyName-Bold.woff
├── FamilyName-Light.woff2
└── FamilyName-Light.woff
```

Download fonts tại: [Google Fonts Download](https://fonts.google.com/) → Download family.

### 4.2 Khai Báo Font Trong SCSS

`static/src/scss/font.scss`:
```scss
// =========================================
// Custom Font: DM Sans (Airproof)
// =========================================

// Light - 300
@font-face {
    font-family: 'DM Sans';
    src: url('/website_airproof/static/fonts/DMSans-Light.woff2') format('woff2'),
         url('/website_airproof/static/fonts/DMSans-Light.woff') format('woff');
    font-weight: 300;
    font-style: normal;
    font-display: swap;  // ← Quan trọng! Tránh FOIT (Flash of Invisible Text)
}

// Regular - 400
@font-face {
    font-family: 'DM Sans';
    src: url('/website_airproof/static/fonts/DMSans-Regular.woff2') format('woff2'),
         url('/website_airproof/static/fonts/DMSans-Regular.woff') format('woff');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}

// Medium - 500
@font-face {
    font-family: 'DM Sans';
    src: url('/website_airproof/static/fonts/DMSans-Medium.woff2') format('woff2'),
         url('/website_airproof/static/fonts/DMSans-Medium.woff') format('woff');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
}

// Bold - 700
@font-face {
    font-family: 'DM Sans';
    src: url('/website_airproof/static/fonts/DMSans-Bold.woff2') format('woff2'),
         url('/website_airproof/static/fonts/DMSans-Bold.woff') format('woff');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
}
```

### 4.3 Áp Dụng Font Trong `primary_variables.scss`

```scss
// Định nghĩa font variable
$o-theme-font: "DM Sans";

// Body font
$font-family-sans-serif: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
$font-family-base: $font-family-sans-serif;

// Nếu dùng Google Fonts (online):
$o-theme-font-url: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap";
```

### 4.4 Sử Dụng Google Fonts (cách nhanh)

Trong `font.scss`:
```scss
// Google Fonts via URL (cần internet)
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,300&display=swap');
```

> **Airproof dùng:** `$o-theme-font-url` trong `primary_variables.scss` để Odoo tự inject font URL.

---

## 5. Tối Ưu Ảnh

### 5.1 Format Khuyến Nghị

| Loại | Format | Dùng khi |
|------|--------|----------|
| Photo | WebP (fallback JPEG) | Ảnh sản phẩm, banner |
| Logo/Icon | SVG | Vector graphics |
| Screenshot | PNG | UI elements |
| Animation | GIF / WebP animated | Hiệu ứng đơn giản |

### 5.2 Kích Thước Chuẩn

```
Hero banner:      1920 × 1080px
Product image:    800 × 800px (square)
Blog thumbnail:   1200 × 628px (social share ratio)
Favicon:          32 × 32px (ICO) + 192 × 192px (PNG)
OG Image:         1200 × 630px
```

### 5.3 Lazy Loading

Odoo tự động thêm `loading="lazy"` cho ảnh. Tuy nhiên, **hero images không nên lazy load**:

```xml
<!-- Hero image: không lazy load -->
<img src="/web/image/website_airproof.img_hero"
     alt="Airproof Hero"
     class="img-fluid"
     loading="eager"/>   <!-- ← Overrides Odoo default -->
```

---

## 6. Website Builder Image Library

Khai báo ảnh trong `images.xml` tự động thêm chúng vào **thư viện ảnh của Website Builder**. Người dùng có thể tìm và sử dụng những ảnh này khi chỉnh sửa trang.

---

## Checklist Bước 6

- [ ] Tạo thư mục `static/src/img/` với các ảnh cần thiết
- [ ] Tạo `data/images.xml` và đăng ký tất cả ảnh
- [ ] Tạo thư mục `static/fonts/` và download fonts
- [ ] Tạo `static/src/scss/font.scss` với @font-face declarations
- [ ] Cập nhật `primary_variables.scss` với font family
- [ ] Upload/set favicon
- [ ] Kiểm tra ảnh load đúng trên website
- [ ] Kiểm tra font hiển thị đúng (F12 → Network tab → filter Font)

**Bước tiếp theo:** [Phần 7 — Building Blocks](./07_building_blocks.md)

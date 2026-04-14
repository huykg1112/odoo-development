# Phần 8: Shapes — Custom SVG Shapes

> **Tài liệu gốc:** [Shapes](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/shapes.html)
> **Mục tiêu:** Tạo custom shapes (dividers, decorations) cho sections.

---

## 1. Shapes Là Gì?

Shapes là các **SVG decorators** được đặt ở viền trên hoặc dưới của sections. Chúng tạo hiệu ứng chia cắt đẹp mắt giữa các sections thay vì đường thẳng ngang thông thường.

Ví dụ: sóng nước, góc nghiêng, zigzag...

---

## 2. Tạo Shape SVG

### 2.1 Tạo file SVG

Tạo `static/shapes/airproof_wave.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
    <path d="M0,0 C480,100 960,100 1440,0 L1440,100 L0,100 Z"
          fill="currentColor"/>
</svg>
```

> **Lưu ý:** Dùng `fill="currentColor"` để Odoo có thể tự động đổi màu shape theo Color Combination.

Một số ví dụ SVG shape phổ biến:

```xml
<!-- Wave đơn giản -->
<svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,40 Q360,80 720,40 Q1080,0 1440,40 L1440,80 L0,80 Z"
          fill="currentColor"/>
</svg>

<!-- Góc nghiêng (diagonal) -->
<svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg">
    <polygon points="0,60 1440,0 1440,60" fill="currentColor"/>
</svg>

<!-- Zigzag -->
<svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg">
    <polyline points="0,40 80,0 160,40 240,0 320,40 400,0 480,40 560,0 640,40 720,0 800,40 880,0 960,40 1040,0 1120,40 1200,0 1280,40 1360,0 1440,40 1440,40 0,40"
              fill="currentColor"/>
</svg>

<!-- Arrow-out tại giữa -->
<svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,0 L720,50 L1440,0 L1440,50 L0,50 Z" fill="currentColor"/>
</svg>
```

### 2.2 Đặt File Đúng Vị Trí

```
static/shapes/
├── airproof_wave.svg      ← Custom shape
└── airproof_diagonal.svg  ← Custom shape
```

---

## 3. Đăng Ký Shape vào `data/shapes.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Đăng ký shape vào Odoo shape library -->
    <record id="shape_airproof_wave" model="ir.attachment">
        <field name="name">Airproof Wave Shape</field>
        <field name="datas" type="base64"
               file="website_airproof/static/shapes/airproof_wave.svg"/>
        <field name="res_model">ir.ui.view</field>
        <field name="public">True</field>
        <field name="mimetype">image/svg+xml</field>
    </record>

    <record id="shape_airproof_diagonal" model="ir.attachment">
        <field name="name">Airproof Diagonal Shape</field>
        <field name="datas" type="base64"
               file="website_airproof/static/shapes/airproof_diagonal.svg"/>
        <field name="res_model">ir.ui.view</field>
        <field name="public">True</field>
        <field name="mimetype">image/svg+xml</field>
    </record>
</odoo>
```

Khai báo trong `__manifest__.py`:
```python
'data': [
    'data/shapes.xml',
],
```

---

## 4. Thêm Shape vào Section

### 4.1 Qua Website Builder

1. Click section muốn thêm shape
2. Panel bên phải → **Shape** tab
3. Chọn shape từ library (shapes custom của bạn cũng sẽ xuất hiện ở đây)
4. Chọn vị trí: Top hoặc Bottom
5. Chọn màu

### 4.2 Trực Tiếp Trong HTML

```xml
<section class="o_colored_level o_cc o_cc1 pt80 pb80"
         data-snippet="s_text_block">
    <!-- Shape trên (top) -->
    <div class="o_we_shape o_airproof_wave"
         style="--shape-direction: 0deg;
                --shape-color-shading-intensity: 1;"/>

    <!-- Nội dung section -->
    <div class="container">
        <h2>Section with wave shape</h2>
    </div>

    <!-- Shape dưới (bottom, flipped) -->
    <div class="o_we_shape o_airproof_wave"
         style="--shape-direction: 180deg;
                --shape-color-shading-intensity: 1;"/>
</section>
```

---

## 5. CSS cho Shapes

Shapes được render tự động qua CSS. Bạn có thể override trong SCSS:

```scss
// Trong primary_variables.scss hoặc file SCSS riêng

// Cách Odoo apply shapes
section > .o_we_shape {
    position: absolute;
    pointer-events: none;
    overflow: hidden;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    &::before, &::after {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
    }
}
```

---

## 6. Shape của Airproof

File `data/shapes.xml` thực tế của Airproof:

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="shape_airproof_waves" model="ir.attachment">
        <field name="name">Airproof Waves</field>
        <field name="datas" type="base64"
               file="website_airproof/static/shapes/airproof-waves.svg"/>
        <field name="res_model">ir.ui.view</field>
        <field name="public">True</field>
        <field name="mimetype">image/svg+xml</field>
    </record>
</odoo>
```

File SVG `static/shapes/airproof-waves.svg` chứa SVG phức tạp với sóng nước.

---

## Checklist Bước 8

- [ ] Thiết kế 1-2 SVG shapes
- [ ] Đặt SVG files trong `static/shapes/`
- [ ] Tạo `data/shapes.xml` và đăng ký shapes
- [ ] Khai báo trong `__manifest__.py`
- [ ] Kiểm tra shapes xuất hiện trong Website Builder
- [ ] Test apply shape vào một section
- [ ] Kiểm tra màu sắc shape thay đổi theo Color Combination

**Bước tiếp theo:** [Phần 9 — Gradients](./09_gradients.md)

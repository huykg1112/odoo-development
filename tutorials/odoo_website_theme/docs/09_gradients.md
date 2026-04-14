# Phần 9: Gradients — Custom Gradients

> **Tài liệu gốc:** [Gradients](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/gradients.html)
> **Mục tiêu:** Tạo custom gradients để dùng trong Website Builder.

---

## 1. Gradients Trong Odoo Website Builder

Odoo Website Builder có sẵn một số màu nền solid và gradient. Bạn có thể thêm custom gradients của theme vào danh sách này, người dùng sẽ thấy và chọn chúng từ Color Picker.

---

## 2. Tạo `data/gradients.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!--
    Mỗi gradient là một ir.ui.view record với type="qweb"
    key phải theo format: website_[theme_name].[gradient_name]
    -->

    <!-- Gradient 1: Dark to Light (Airproof brand) -->
    <record id="gradient_airproof_dark" model="ir.ui.view">
        <field name="name">Airproof - Dark Gradient</field>
        <field name="type">qweb</field>
        <field name="key">website_airproof.gradient_dark</field>
        <field name="arch" type="xml">
            <section style="background: linear-gradient(135deg, #101728 0%, #1a2e4a 100%);">
                <!-- This is a gradient preset -->
            </section>
        </field>
    </record>

    <!-- Gradient 2: Brand gradient -->
    <record id="gradient_airproof_brand" model="ir.ui.view">
        <field name="name">Airproof - Brand Gradient</field>
        <field name="type">qweb</field>
        <field name="key">website_airproof.gradient_brand</field>
        <field name="arch" type="xml">
            <section style="background: linear-gradient(135deg, #101728 0%, #2c3e6b 50%, #1e3a5f 100%);">
            </section>
        </field>
    </record>

    <!-- Gradient 3: Subtle light gradient -->
    <record id="gradient_airproof_light" model="ir.ui.view">
        <field name="name">Airproof - Light Gradient</field>
        <field name="type">qweb</field>
        <field name="key">website_airproof.gradient_light</field>
        <field name="arch" type="xml">
            <section style="background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);">
            </section>
        </field>
    </record>
</odoo>
```

Khai báo trong `__manifest__.py`:
```python
'data': [
    'data/gradients.xml',
],
```

---

## 3. Sử Dụng Gradient Trong HTML Template

Áp dụng trực tiếp qua style attribute:

```xml
<!-- Parallel background với gradient -->
<section class="o_colored_level o_cc pt80 pb80"
         style="background: linear-gradient(135deg, #101728 0%, #1a3a5f 100%);">
    <div class="container text-white">
        <h2>Section with gradient</h2>
    </div>
</section>

<!-- Gradient kết hợp với ảnh nền (overlay effect) -->
<section class="s_parallax o_colored_level o_cc o_cc1 pt96 pb96"
         data-snippet="s_parallax">
    <span class="s_parallax_bg"
          style="background-image: url('/path/to/image.jpg');"/>
    <!-- Gradient overlay -->
    <div style="position: absolute; inset: 0;
                background: linear-gradient(135deg,
                    rgba(16,23,40,0.9) 0%,
                    rgba(16,23,40,0.3) 100%);"/>
    <div class="container position-relative">
        <h1 class="text-white">Content over gradient</h1>
    </div>
</section>
```

---

## 4. Gradient Trong SCSS

```scss
// Định nghĩa gradient variables để tái sử dụng
$o-airproof-gradient-dark: linear-gradient(135deg, #101728 0%, #1a2e4a 100%);
$o-airproof-gradient-brand: linear-gradient(135deg, #101728 0%, #2c3e6b 50%, #1e3a5f 100%);
$o-airproof-gradient-light: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);

// CSS custom properties
:root {
    --airproof-gradient-dark: #{$o-airproof-gradient-dark};
    --airproof-gradient-brand: #{$o-airproof-gradient-brand};
    --airproof-gradient-light: #{$o-airproof-gradient-light};
}

// Utility classes
.bg-airproof-dark {
    background: $o-airproof-gradient-dark !important;
}

.bg-airproof-brand {
    background: $o-airproof-gradient-brand !important;
}
```

---

## 5. Airproof Gradients (`data/gradients.xml`)

File thực tế của Airproof module:

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="colorize_body_1" model="ir.ui.view">
        <field name="name">Airproof - Gradient 1</field>
        <field name="type">qweb</field>
        <field name="key">website_airproof.colorize_body_1</field>
        <field name="arch" type="xml">
            <section style="background: linear-gradient(135deg, #101728 0%, #1e3a5f 100%);">
            </section>
        </field>
    </record>
</odoo>
```

---

## Checklist Bước 9

- [ ] Thiết kế 2-3 gradients phù hợp với brand
- [ ] Tạo `data/gradients.xml`
- [ ] Khai báo trong `__manifest__.py`
- [ ] Kiểm tra gradients xuất hiện trong Website Builder Color Picker
- [ ] Test áp dụng gradient vào section

**Bước tiếp theo:** [Phần 10 — Animations](./10_animations.md)

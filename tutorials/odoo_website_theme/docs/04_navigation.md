# Phần 4: Navigation — Menu & Mega Menu

> **Tài liệu gốc:** [Navigation](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/navigation.html)
> **Mục tiêu:** Tạo cấu trúc menu website và mega menu tùy chỉnh.

---

## 1. Cấu Trúc Menu Trong Odoo

Odoo lưu menu website trong model `website.menu`. Menu có cấu trúc cây cha-con.

### Tạo menu bằng `data/menu.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Menu root của website -->
    <record id="menu_root" model="website.menu">
        <field name="name">Top Menu</field>
        <field name="website_id" ref="website.default_website"/>
        <field name="parent_id" ref="website.main_menu"/>
        <field name="sequence">10</field>
    </record>

    <!-- Menu items cấp 1 -->
    <record id="menu_shop" model="website.menu">
        <field name="name">Shop</field>
        <field name="url">/shop</field>
        <field name="parent_id" ref="website.main_menu"/>
        <field name="sequence">10</field>
    </record>

    <record id="menu_drones" model="website.menu">
        <field name="name">Drones</field>
        <field name="url">/shop?category=drones</field>
        <field name="parent_id" ref="website.main_menu"/>
        <field name="sequence">20</field>
    </record>

    <record id="menu_blog" model="website.menu">
        <field name="name">Blog</field>
        <field name="url">/blog</field>
        <field name="parent_id" ref="website.main_menu"/>
        <field name="sequence">30</field>
    </record>

    <record id="menu_contact" model="website.menu">
        <field name="name">Contact</field>
        <field name="url">/contact</field>
        <field name="parent_id" ref="website.main_menu"/>
        <field name="sequence">40</field>
    </record>
</odoo>
```

Khai báo trong `__manifest__.py`:
```python
'data': [
    'data/menu.xml',
],
```

---

## 2. Menu Có Submenu (Dropdown)

```xml
<!-- Parent menu item (không có URL) -->
<record id="menu_products" model="website.menu">
    <field name="name">Products</field>
    <field name="url">#</field>
    <field name="parent_id" ref="website.main_menu"/>
    <field name="sequence">20</field>
</record>

<!-- Submenu items -->
<record id="menu_drones" model="website.menu">
    <field name="name">Drones</field>
    <field name="url">/shop?category=drones</field>
    <field name="parent_id" ref="menu_products"/>  <!-- ← parent là menu_products -->
    <field name="sequence">10</field>
</record>

<record id="menu_accessories" model="website.menu">
    <field name="name">Accessories</field>
    <field name="url">/shop?category=accessories</field>
    <field name="parent_id" ref="menu_products"/>
    <field name="sequence">20</field>
</record>
```

---

## 3. Mega Menu

Mega Menu là dropdown hiển thị dạng full-width với hình ảnh sản phẩm, nhiều cột. Airproof dùng mega menu cho Products.

### 3.1 Thêm Mega Menu Template vào Website Builder

Trong `views/website_templates.xml`:

```xml
<!-- Thêm option cho mega menu trong header -->
<template id="template_header_opt" inherit_id="website.snippet_options" name="Airproof Header - Options">
    <!-- ... header option code ... -->
    <!-- Thêm mega menu template option -->
    <xpath expr="//*[@data-name='mega_menu_template_opt']/*" position="before">
        <t t-set="_label">Airproof</t>
        <we-button
            t-att-data-select-label="_label"
            data-select-template="website_airproof.s_mega_menu_airproof"
            data-img="/website_airproof/static/src/img/wbuilder/template-header-opt.svg"
            t-out="_label"/>
    </xpath>
</template>
```

### 3.2 Tạo Mega Menu Template

```xml
<!-- Mega menu template — hiển thị ảnh sản phẩm theo grid -->
<template id="s_mega_menu_airproof" name="Airproof" groups="base.group_user">
    <section class="s_mega_menu_airproof pt24 pb24" style="background-color: #F4F4F4 !important;">
        <div class="container">
            <div class="row">
                <!-- Product 1: Mini -->
                <div class="col-6 col-sm text-center pt8 pb8 o_colored_level">
                    <a href="/shop/airproof-mini-1" class="nav-link p-0" data-name="Menu Item">
                        <img src="/web/image/website_airproof.img_mini"
                             alt="Drone Airproof Mini"
                             class="img-fluid img"/>
                        <div class="p-2">
                            <font class="fw-bold">Airproof Mini</font>
                        </div>
                    </a>
                </div>
                <!-- Product 2: Pro -->
                <div class="col-6 col-sm text-center pt8 pb8 o_colored_level">
                    <a href="/shop/airproof-pro-2" class="nav-link p-0" data-name="Menu Item">
                        <img src="/web/image/website_airproof.img_pro"
                             alt="Drone Airproof Pro"
                             class="img-fluid img"/>
                        <div class="p-2">
                            <font class="fw-bold">Airproof Pro</font>
                        </div>
                    </a>
                </div>
                <!-- Product 3: Robin -->
                <div class="col-6 col-sm text-center pt8 pb8 o_colored_level">
                    <a href="/shop/airproof-robin-3" class="nav-link p-0" data-name="Menu Item">
                        <img src="/web/image/website_airproof.img_robin"
                             alt="Drone Airproof Robin"
                             class="img-fluid img"/>
                        <div class="d-block p-2">
                            <font class="fw-bold">Airproof Robin</font>
                        </div>
                    </a>
                </div>
                <!-- Product 4: Falcon -->
                <div class="col-6 col-sm text-center pt8 pb8 o_colored_level">
                    <a href="/shop/airproof-falcon-4" class="nav-link p-0" data-name="Menu Item">
                        <img src="/web/image/website_airproof.img_falcon"
                             alt="Drone Airproof Falcon"
                             class="img-fluid img"/>
                        <div class="d-block p-2">
                            <font class="fw-bold">Airproof Falcon</font>
                        </div>
                    </a>
                </div>
                <!-- Product 5: Eagle -->
                <div class="col-6 col-sm text-center pt8 pb8 o_colored_level">
                    <a href="/shop/airproof-eagle-5" class="nav-link p-0" data-name="Menu Item">
                        <img src="/web/image/website_airproof.img_eagle"
                             alt="Drone Airproof Eagle"
                             class="img-fluid img"/>
                        <div class="d-block p-2">
                            <font class="fw-bold">Airproof Eagle</font>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </section>
</template>
```

---

## 4. Kích Hoạt Mega Menu cho Menu Item

Sau khi tạo template, để một menu item dùng mega menu:

1. Vào Website → Click Edit (Website Builder)
2. Hover vào menu item muốn đặt mega menu
3. Click icon gear ⚙️ → **Mega Menu**
4. Chọn template "Airproof"

Hoặc khai báo trong menu XML:

```xml
<record id="menu_drones" model="website.menu">
    <field name="name">Drones</field>
    <field name="url">#</field>
    <field name="parent_id" ref="website.main_menu"/>
    <field name="is_mega_menu">True</field>
    <field name="mega_menu_content">
        <![CDATA[<t t-call="website_airproof.s_mega_menu_airproof"/>]]>
    </field>
    <field name="sequence">30</field>
</record>
```

---

## 5. Mobile Navigation

Odoo tự động tạo mobile navbar qua `website.template_header_mobile`. Customize trong CSS:

```scss
// static/src/scss/layout/header.scss

// Mobile hamburger button
@include media-breakpoint-down(lg) {
    #wrapwrap > header {
        .navbar-toggler {
            color: var(--o-cc1-text, #101728);
            border: none;

            &:focus {
                box-shadow: none;
            }
        }

        // Mobile menu overlay
        .navbar-collapse {
            background: #fff;
            padding: 1rem;

            .nav-link {
                padding: 0.75rem 0;
                border-bottom: 1px solid rgba(0,0,0,0.08);
                font-size: 1rem;
            }
        }
    }
}
```

---

## 6. Breadcrumbs

Odoo tự động thêm breadcrumbs trên dynamic pages. Customize qua CSS:

```scss
// Breadcrumb styling
.breadcrumb {
    font-size: 0.85rem;

    .breadcrumb-item {
        + .breadcrumb-item::before {
            content: "›";
        }

        a {
            color: var(--o-cc1-text-muted, #6c757d);
            text-decoration: none;

            &:hover {
                color: var(--o-cc1-text, #101728);
            }
        }

        &.active {
            color: var(--o-cc1-text, #101728);
            font-weight: 500;
        }
    }
}
```

---

## 7. Airproof `menu.xml` Thực Tế

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Top level items -->
    <record id="menu_airproof_shop" model="website.menu">
        <field name="name">Shop</field>
        <field name="url">/shop</field>
        <field name="parent_id" ref="website.main_menu"/>
        <field name="sequence">10</field>
    </record>

    <record id="menu_airproof_drones" model="website.menu">
        <field name="name">Drones</field>
        <field name="url">#</field>
        <field name="parent_id" ref="website.main_menu"/>
        <field name="sequence">20</field>
        <!-- Drones menu sẽ dùng mega menu trong Website Builder -->
    </record>

    <record id="menu_airproof_blog" model="website.menu">
        <field name="name">Blog</field>
        <field name="url">/blog</field>
        <field name="parent_id" ref="website.main_menu"/>
        <field name="sequence">30</field>
    </record>

    <record id="menu_airproof_contact" model="website.menu">
        <field name="name">Contact</field>
        <field name="url">/contactus</field>
        <field name="parent_id" ref="website.main_menu"/>
        <field name="sequence">40</field>
    </record>
</odoo>
```

---

## Checklist Bước 4

- [ ] Tạo `data/menu.xml` với các menu items cơ bản
- [ ] Test menu hiển thị đúng trên website
- [ ] Tạo mega menu template `s_mega_menu_airproof`
- [ ] Thêm mega menu option vào Website Builder
- [ ] Test mega menu hoạt động
- [ ] Kiểm tra mobile navigation

**Bước tiếp theo:** [Phần 5 — Pages](./05_pages.md)

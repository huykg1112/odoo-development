# Phần 3: Layout — Header, Footer, Copyright

> **Tài liệu gốc:** [Layout](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/layout.html)
> **Mục tiêu:** Tạo custom header, footer, copyright riêng cho theme.

---

## Tổng Quan — Cấu Trúc Layout Odoo Website

Mọi trang Odoo Website kế thừa từ **`website.layout`** — template cơ sở chứa:

```
website.layout
├── <head>                    ← Meta tags, CSS, JS
├── <header>                  ← Navbar (có thể override)
│   └── website.navbar        ← Template navbar chuẩn
├── <main>                    ← Nội dung trang
│   └── [page content]
└── <footer>                  ← Footer (có thể override)
    ├── [footer content]
    └── .o_footer_copyright   ← Copyright bar
```

Để tạo custom header/footer, chúng ta **override bằng `extension` view** — không sửa trực tiếp view gốc.

---

## 1. Tạo File `views/website_templates.xml`

```
views/
└── website_templates.xml    ← Chứa header + footer + copyright
```

Khai báo trong `__manifest__.py`:
```python
'data': [
    'views/website_templates.xml',
],
```

---

## 2. Custom Header

### 2.1 Thêm option header vào Website Builder

Trước tiên, thêm theme header của bạn vào danh sách template header trong Website Builder:

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Thêm option template header -->
    <template id="template_header_opt"
              inherit_id="website.snippet_options"
              name="Airproof Header Template - Option">
        <xpath expr="//we-select[@data-variable='header-template']" position="inside">
            <we-button
                title="Airproof"
                data-customize-website-views="website_airproof.header"
                data-customize-website-variable="'airproof'"
                data-img="/website_airproof/static/src/img/wbuilder/template-header-opt.svg"/>
        </xpath>
    </template>
```

**Giải thích attributes:**
- `data-customize-website-views`: External ID của view header tùy chỉnh
- `data-customize-website-variable`: Giá trị biến CSS để activate header này
- `data-img`: Thumbnail hiển thị trong Website Builder

### 2.2 Tạo Custom Header Template

```xml
    <!-- Custom header là một extension view của website.layout -->
    <record id="header" model="ir.ui.view">
        <field name="name">Airproof header</field>
        <field name="type">qweb</field>
        <field name="key">website_airproof.header</field>
        <field name="inherit_id" ref="website.layout"/>
        <!-- mode="extension": view này inactive cho đến khi được kích hoạt -->
        <field name="mode">extension</field>
        <field name="arch" type="xml">
            <!-- Replace toàn bộ <nav> trong header -->
            <xpath expr="//header//nav" position="replace">
                <t t-call="website.navbar">
                    <!-- Tùy chỉnh CSS classes cho navbar -->
                    <t t-set="_navbar_classes" t-valuef="d-none d-lg-block p-0"/>

                    <div id="o_main_nav" class="o_main_nav flex-wrap">

                        <!-- TOP BAR: thông tin phụ (text, social, search) -->
                        <div aria-label="Top" class="o_header_hide_on_scroll">
                            <div class="container d-flex justify-content-between flex-wrap w-100 pt-2">
                                <!-- Cột trái: Text element -->
                                <ul class="o_header_search_left_col navbar-nav flex-wrap">
                                    <t t-call="website.placeholder_header_text_element">
                                        <t t-set="_txt_elt_content" t-valuef="sentence"/>
                                        <t t-set="_div_class" t-valuef="d-flex align-items-center h-100 px-2 text-muted"/>
                                    </t>
                                </ul>
                                <!-- Cột phải: Search, Social Links -->
                                <ul class="navbar-nav flex-wrap">
                                    <t t-call="website.placeholder_header_search_box" t-nocache="The searchbox should not cache previous searches.">
                                        <t t-set="_input_classes" t-valuef="ps-3 pb-0 o_small bg-white border-bottom rounded-0"/>
                                        <t t-set="_submit_classes" t-valuef="pe-3 me-3"/>
                                    </t>
                                    <t t-call="website.placeholder_header_social_links">
                                        <t t-set="_div_class" t-valuef="d-flex align-items-center h-100 px-1"/>
                                    </t>
                                </ul>
                            </div>
                        </div>

                        <!-- MAIN NAVBAR: Logo + Menu + Actions -->
                        <div class="container d-grid align-items-center w-100 py-2 o_grid_header_3_cols">
                            <!-- Menu navigation -->
                            <t t-call="website.navbar_nav">
                                <t t-set="_nav_class" t-valuef="me-4"/>
                                <t t-foreach="website.menu_id.child_id" t-as="submenu">
                                    <t t-call="website.submenu">
                                        <t t-set="item_class" t-valuef="nav-item"/>
                                        <t t-set="link_class" t-valuef="nav-link"/>
                                    </t>
                                </t>
                            </t>

                            <!-- Logo / Brand -->
                            <t t-call="website.placeholder_header_brand">
                                <t t-set="_link_class" t-valuef="mw-100 mx-auto"/>
                            </t>

                            <!-- Cột phải: ngôn ngữ, cart, wishlist, sign in -->
                            <ul class="o_header_search_right_col navbar-nav align-items-center gap-2 ms-auto ps-3">
                                <t t-call="website.placeholder_header_language_selector">
                                    <t t-set="_div_classes" t-valuef="h-100"/>
                                    <t t-set="_btn_class" t-valuef="btn-sm d-flex align-items-center h-100 rounded-sm p-2"/>
                                </t>
                                <t t-call="website_sale.header_cart_link">
                                    <t t-set="_icon" t-value="True"/>
                                    <t t-set="_item_class" t-valuef="nav-item"/>
                                    <t t-set="_link_class" t-valuef="nav-link py-3"/>
                                </t>
                                <t t-call="website_sale_wishlist.header_wishlist_link">
                                    <t t-set="_icon" t-value="True"/>
                                    <t t-set="_item_class" t-valuef="nav-item me-lg-3"/>
                                    <t t-set="_link_class" t-valuef="nav-link py-3"/>
                                </t>
                                <t t-call="portal.placeholder_user_sign_in">
                                    <t t-set="_link_class" t-valuef="btn btn-primary d-flex align-items-center h-100 rounded-sm px-3"/>
                                </t>
                                <t t-call="portal.user_dropdown">
                                    <t t-set="_user_name" t-value="true"/>
                                    <t t-set="_icon" t-value="true"/>
                                    <t t-set="_item_class" t-valuef="dropdown"/>
                                    <t t-set="_link_class" t-valuef="btn btn-primary d-flex align-items-center h-100 rounded-sm"/>
                                    <t t-set="_dropdown_menu_class" t-valuef="dropdown-menu-start"/>
                                </t>
                                <t t-call="website.placeholder_header_call_to_action"/>
                            </ul>
                        </div>
                    </div>
                </t>
                <!-- Mobile header -->
                <t t-call="website.template_header_mobile"/>
            </xpath>
        </field>
    </record>
```

### 2.3 Các Placeholder Header Có Sẵn

Odoo cung cấp sẵn các "placeholder" templates cho header:

| Template | Mô tả |
|----------|--------|
| `website.placeholder_header_brand` | Logo/brand của website |
| `website.placeholder_header_text_element` | Text tùy chỉnh |
| `website.placeholder_header_search_box` | Search bar |
| `website.placeholder_header_social_links` | Icons mạng xã hội |
| `website.placeholder_header_language_selector` | Chọn ngôn ngữ |
| `website.placeholder_header_call_to_action` | CTA button |
| `website_sale.header_cart_link` | Icon giỏ hàng |
| `website_sale_wishlist.header_wishlist_link` | Icon wishlist |
| `portal.placeholder_user_sign_in` | Nút đăng nhập |
| `portal.user_dropdown` | Dropdown user đã đăng nhập |

### 2.4 Header SCSS (`static/src/scss/layout/header.scss`)

```scss
// Header styles
#wrapwrap > header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--o-cc1-bg, #fff);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.3s ease;

    // Grid layout cho 3 cột (menu | logo | actions)
    .o_grid_header_3_cols {
        grid-template-columns: 1fr auto 1fr;
        gap: 1rem;
    }

    // Navigation links
    .nav-link {
        font-size: 0.9rem;
        font-weight: 500;
        letter-spacing: 0.02em;
        transition: color 0.2s ease;

        &:hover {
            color: var(--o-cc1-text-muted);
        }
    }

    // Header ẩn khi scroll xuống
    .o_header_hide_on_scroll {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
}

// Header scroll state (thêm class js khi scroll)
#wrapwrap > header.o_header_scrolled {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
```

---

## 3. Custom Footer

### 3.1 Thêm option footer vào Website Builder

```xml
    <!-- Thêm custom footer vào danh sách template footer -->
    <template id="template_footer_opt"
              inherit_id="website.snippet_options"
              name="Airproof Footer Template - Option">
        <xpath expr="//we-select[@data-variable='footer-template']" position="inside">
            <we-button
                title="Airproof"
                data-customize-website-views="website_airproof.footer"
                data-customize-website-variable="'airproof'"
                data-img="/website_airproof/static/src/img/wbuilder/template-footer-opt.svg"/>
        </xpath>
    </template>
```

### 3.2 Tạo Custom Footer Template

```xml
    <!-- Custom footer -->
    <record id="footer" model="ir.ui.view">
        <field name="name">Airproof Footer</field>
        <field name="type">qweb</field>
        <field name="key">website_airproof.footer</field>
        <field name="inherit_id" ref="website.layout"/>
        <field name="mode">extension</field>
        <field name="arch" type="xml">
            <!-- Replace toàn bộ #footer div -->
            <xpath expr="//div[@id='footer']" position="replace">
                <div id="footer" class="oe_structure" t-ignore="true" t-if="not no_footer">

                    <!-- Newsletter Section -->
                    <section class="s_newsletter_block s_newsletter_list o_colored_level o_cc o_cc4 pt48 pb48"
                             data-snippet="s_newsletter_block"
                             data-name="Newsletter Block">
                        <div class="container">
                            <div class="row">
                                <div class="pt8 pb8 o_colored_level col-lg-6">
                                    <h2>Sign up for our newsletter</h2>
                                    <p>Don't miss news and special offers!</p>
                                </div>
                                <div class="pt40 pb8 o_colored_level col-lg-6">
                                    <!-- Newsletter form snippet -->
                                    <div class="s_newsletter_subscribe_form s_newsletter_list js_subscribe"
                                         data-vxml="001"
                                         data-list-id="0"
                                         data-snippet="s_newsletter_subscribe_form">
                                        <div class="js_subscribed_wrap d-none">
                                            <p class="text-end text-success">
                                                <i class="fa fa-check-circle-o" role="img"/> Thanks for registering!
                                            </p>
                                        </div>
                                        <div class="js_subscribe_wrap">
                                            <div class="input-group">
                                                <input type="email" name="email"
                                                       class="js_subscribe_value form-control border-0 me-3"
                                                       placeholder="Your email..."/>
                                                <a role="button" href="#"
                                                   class="btn btn-primary o_cc o_cc3 js_subscribe_btn o_submit">
                                                    Subscribe
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Main Footer Links -->
                    <section class="s_text_block pt80 pb24" data-snippet="s_text_block" data-name="Text">
                        <div class="container">
                            <div class="row">
                                <!-- Column 1: Description -->
                                <div class="col col-lg-6 pb40 pe-md-5">
                                    <p class="small">
                                        Creativity is at the heart of every dream. At Airproof,
                                        we give creators the tools they need to bring their ideas to life.
                                    </p>
                                </div>
                                <!-- Column 2: Products links -->
                                <div class="col-6 col-md-4 col-lg-2 pb24">
                                    <p class="mb-4 text-muted small">Our drones</p>
                                    <ul class="list-unstyled small">
                                        <li class="mb-2"><a href="/shop/airproof-mini">Airproof Mini</a></li>
                                        <li class="mb-2"><a href="/shop/airproof-pro">Airproof Pro</a></li>
                                        <li class="mb-2"><a href="/shop/airproof-robin">Airproof Robin</a></li>
                                    </ul>
                                </div>
                                <!-- Column 3: Accessories links -->
                                <div class="col-6 col-md-4 col-lg-2 pb24">
                                    <p class="mb-4 text-muted small">Our accessories</p>
                                    <ul class="list-unstyled small">
                                        <li class="mb-2"><a href="/">Drone cases</a></li>
                                        <li class="mb-2"><a href="/">Controllers</a></li>
                                        <li class="mb-2"><a href="/">Cameras</a></li>
                                    </ul>
                                </div>
                                <!-- Column 4: Contact info -->
                                <div class="col col-md-4 col-lg-2 pb24">
                                    <p class="mb-4 text-muted small">Contact us</p>
                                    <p class="mb-4 small">
                                        Airproof<br/>10 Rue Van Hove<br/>1000 Brussels
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </xpath>
        </field>
    </record>
```

---

## 4. Custom Copyright Bar

```xml
    <!-- Override copyright section -->
    <template id="copyright" inherit_id="website.layout">
        <xpath expr="//div[hasclass('o_footer_copyright')]/div[hasclass('container')]"
               position="replace">
            <div class="container pt24 pb24">
                <div class="row d-flex flex-row align-items-center justify-content-between">
                    <!-- Social Media Icons -->
                    <div class="col-12 col-md-6 s_social_media text-start o_not_editable no_icon_color"
                         data-snippet="s_social_media"
                         data-name="Social Media">
                        <h4 class="s_social_media_title d-none">Social Media</h4>
                        <a target="_blank" href="/website/social/facebook" class="s_social_media_facebook">
                            <i class="fa rounded-circle shadow-sm fa-facebook text-o-color-5"/>
                        </a>
                        <a target="_blank" href="/website/social/youtube" class="s_social_media_youtube">
                            <i class="fa rounded-circle shadow-sm fa-youtube text-o-color-5"/>
                        </a>
                        <a target="_blank" href="/website/social/instagram" class="s_social_media_instagram">
                            <i class="fa rounded-circle shadow-sm fa-instagram text-o-color-5"/>
                        </a>
                    </div>
                    <!-- Copyright text -->
                    <div class="col-12 col-md-6 text-md-end">
                        <span class="o_footer_copyright_name me-2 small">
                            © Airproof. All rights reserved.
                        </span>
                    </div>
                </div>
            </div>
        </xpath>
    </template>

</odoo>
```

---

## 5. Kích Hoạt Header/Footer Tùy Chỉnh

Header và footer custom (`mode="extension"`) mặc định bị **tắt**. Cần kích hoạt qua `data/website.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="website_airproof_default" model="website">
        <!-- Kích hoạt custom header -->
        <field name="header_visible">True</field>
    </record>

    <!-- Kích hoạt các extension views -->
    <function model="ir.ui.view" name="toggle_active_filter">
        <value eval="[
            ref('website_airproof.header'),
            ref('website_airproof.footer'),
        ]"/>
        <value eval="True"/>
    </function>
</odoo>
```

Khai báo trong `__manifest__.py`:
```python
'data': [
    'data/website.xml',   # Phải load TRƯỚC views
    'views/website_templates.xml',
],
```

---

## 6. Lưu Ý Quan Trọng

### Về `mode="extension"`:
- View với `mode="extension"` là **inactive** mặc định
- Phải **toggle** thủ công qua `data/website.xml` hoặc qua Website Builder
- Khi user chọn header template trong Website Builder, Odoo tự toggle view

### Về `t-ignore`:
```xml
<div id="footer" class="oe_structure" t-ignore="true" t-if="not no_footer">
```
- `class="oe_structure"`: Cho phép user kéo thả snippets vào đây
- `t-ignore="true"`: Odoo không track changes trong vùng này (performance)
- `t-if="not no_footer"`: Không render footer nếu page set `no_footer=True`

### Về `t-call` trong header:
```xml
<t t-call="website.navbar">
    <t t-set="_navbar_classes" t-valuef="d-none d-lg-block p-0"/>
    <!-- nội dung navbar -->
</t>
```
Variables `_navbar_classes`, `_nav_class`... được truyền vào template con như context.

---

## Checklist Bước 3

- [ ] Tạo file `views/website_templates.xml`
- [ ] Thêm option header vào Website Builder (template_header_opt)
- [ ] Tạo custom header record với `mode="extension"`
- [ ] Thêm option footer vào Website Builder (template_footer_opt)
- [ ] Tạo custom footer record với `mode="extension"`
- [ ] Override copyright section
- [ ] Tạo `data/website.xml` để kích hoạt header/footer
- [ ] Tạo `static/src/scss/layout/header.scss`
- [ ] Khai báo đúng thứ tự trong `__manifest__.py`
- [ ] Kiểm tra header và footer hiển thị đúng trên website

**Bước tiếp theo:** [Phần 4 — Navigation](./04_navigation.md)

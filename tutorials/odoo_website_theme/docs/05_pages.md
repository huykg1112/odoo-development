# Phần 5: Pages — Tạo Trang Tĩnh

> **Tài liệu gốc:** [Pages](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/pages.html)
> **Mục tiêu:** Tạo các trang tĩnh (Homepage, Contact...) và page templates.

---

## 1. Trang Tĩnh vs Trang Động

| Loại | Ví dụ | URL | Quản lý |
|------|-------|-----|---------|
| **Static page** | Homepage, About, Contact | `/`, `/about`, `/contact` | `website.page` + `ir.ui.view` |
| **Dynamic page** | Product, Blog post, Event | `/shop/product-slug`, `/blog/post/title` | Tự động từ model data |

Theme chủ yếu liên quan đến **static pages** và customize **dynamic page templates**.

---

## 2. Tạo Static Page bằng XML

### 2.1 Cấu trúc file data/pages/

```
data/
└── pages/
    ├── home.xml      ← Trang chủ
    └── contact.xml   ← Trang liên hệ
```

Khai báo trong `__manifest__.py`:
```python
'data': [
    # Pages phải load SAU views
    'data/pages/home.xml',
    'data/pages/contact.xml',
],
```

### 2.2 Tạo Homepage (`data/pages/home.xml`)

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Bước 1: Tạo view chứa HTML content của trang -->
    <record id="homepage_view" model="ir.ui.view">
        <field name="name">Airproof - Homepage</field>
        <field name="type">qweb</field>
        <field name="key">website_airproof.homepage_view</field>
        <field name="arch" type="xml">
            <t t-name="website_airproof.homepage_view">
                <div id="wrap" class="oe_structure oe_empty">

                    <!-- Hero Section -->
                    <section class="s_parallax s_parallax_is_fixed o_colored_level o_cc o_cc1 pt96 pb96"
                             data-snippet="s_parallax"
                             data-name="Parallax"
                             style="background-color: #101728;">
                        <span class="s_parallax_bg oe_img_bg o_bg_img_center"
                              style="background-image: url('/website_airproof/static/src/img/hero.jpg');
                                     background-position: center center;"/>
                        <div class="o_we_bg_filter bg-black-50"/>
                        <div class="container">
                            <div class="row">
                                <div class="col-lg-6">
                                    <h1 class="text-white">
                                        <span>Explore the Sky</span>
                                        <br/>with Airproof Drones
                                    </h1>
                                    <p class="text-white-50 lead mt-3">
                                        Professional drones for creators, photographers and explorers.
                                    </p>
                                    <a href="/shop" class="btn btn-primary btn-lg mt-4">
                                        Shop Now
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Features Section -->
                    <section class="s_three_columns o_colored_level o_cc o_cc5 pt80 pb80"
                             data-snippet="s_three_columns">
                        <div class="container">
                            <div class="row g-4">
                                <div class="col-md-4 text-center">
                                    <i class="fa fa-camera fa-3x text-primary mb-3"/>
                                    <h4>4K Camera</h4>
                                    <p class="text-muted">Crystal clear footage in 4K resolution.</p>
                                </div>
                                <div class="col-md-4 text-center">
                                    <i class="fa fa-battery-full fa-3x text-primary mb-3"/>
                                    <h4>45 Min Flight</h4>
                                    <p class="text-muted">Extended battery life for longer sessions.</p>
                                </div>
                                <div class="col-md-4 text-center">
                                    <i class="fa fa-shield fa-3x text-primary mb-3"/>
                                    <h4>Obstacle Avoidance</h4>
                                    <p class="text-muted">Advanced sensors for safe flying.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Products Section -->
                    <section class="s_text_block pt80 pb80 o_colored_level"
                             data-snippet="s_text_block">
                        <div class="container">
                            <h2 class="text-center mb-5">Our Drones</h2>
                            <!-- Product grid được kéo từ shop -->
                        </div>
                    </section>

                </div>
            </t>
        </field>
    </record>

    <!-- Bước 2: Tạo page object -->
    <record id="homepage" model="website.page">
        <field name="name">Home</field>
        <field name="url">/</field>
        <field name="view_id" ref="homepage_view"/>
        <field name="website_published">True</field>
        <field name="is_homepage">True</field>
        <!-- SEO settings -->
        <field name="website_meta_title">Airproof Drones - Professional Aerial Photography</field>
        <field name="website_meta_description">Discover Airproof's range of professional drones for photography, videography and exploration.</field>
    </record>
</odoo>
```

### 2.3 Tạo Contact Page (`data/pages/contact.xml`)

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="contact_view" model="ir.ui.view">
        <field name="name">Airproof - Contact</field>
        <field name="type">qweb</field>
        <field name="key">website_airproof.contact_view</field>
        <field name="arch" type="xml">
            <t t-name="website_airproof.contact_view">
                <div id="wrap" class="oe_structure oe_empty">

                    <!-- Page Header -->
                    <section class="o_colored_level o_cc o_cc1 pt80 pb80">
                        <div class="container text-center">
                            <h1 class="text-white">Contact Us</h1>
                            <p class="text-white-50">We'd love to hear from you.</p>
                        </div>
                    </section>

                    <!-- Contact Content -->
                    <section class="pt80 pb80">
                        <div class="container">
                            <div class="row g-5">
                                <!-- Contact info column -->
                                <div class="col-lg-4">
                                    <h3>Get In Touch</h3>
                                    <ul class="list-unstyled mt-4">
                                        <li class="mb-3">
                                            <i class="fa fa-map-marker me-2 text-primary"/>
                                            10 Rue Van Hove, 1000 Brussels
                                        </li>
                                        <li class="mb-3">
                                            <i class="fa fa-phone me-2 text-primary"/>
                                            <a href="tel:+3222903490">+32 2 290 34 90</a>
                                        </li>
                                        <li class="mb-3">
                                            <i class="fa fa-envelope me-2 text-primary"/>
                                            <a href="mailto:contact@airproof.com">contact@airproof.com</a>
                                        </li>
                                    </ul>
                                </div>
                                <!-- Contact form column -->
                                <div class="col-lg-8">
                                    <!-- Dùng native Odoo contact form snippet -->
                                    <div class="s_website_form" data-snippet="s_website_form">
                                        <!-- Form content tự động generated -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </t>
        </field>
    </record>

    <record id="contact_page" model="website.page">
        <field name="name">Contact</field>
        <field name="url">/contact</field>
        <field name="view_id" ref="contact_view"/>
        <field name="website_published">True</field>
        <field name="website_meta_title">Contact Airproof — Get in touch</field>
        <field name="website_meta_description">Contact the Airproof team. We're here to help with your drone questions.</field>
    </record>
</odoo>
```

---

## 3. Page Templates (New Page Templates)

Page templates xuất hiện khi user click "New Page" trong Website Builder. Cho phép user chọn layout có sẵn.

### 3.1 Khai báo trong `__manifest__.py`

```python
# Khai báo page templates
'new_page_templates': {
    'airproof': {
        'services': ['s_parallax', 's_airproof_key_benefits_h2', 's_call_to_action', 's_airproof_carousel']
    }
},
```

### 3.2 Tạo `views/new_page_template_templates.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Template group: "airproof" -->
    <template id="new_page_template_airproof_services"
              name="Airproof - Services Page">
        <div id="wrap" class="oe_structure oe_empty">
            <!-- Parallax hero -->
            <section class="s_parallax s_parallax_is_fixed o_colored_level o_cc o_cc1 pt120 pb120"
                     data-snippet="s_parallax"
                     data-name="Parallax">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-8">
                            <h1>Service Page Title</h1>
                            <p class="lead">Your service description goes here.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Key benefits -->
            <section class="s_airproof_key_benefits_h2 pt80 pb80">
                <div class="container">
                    <h2 class="text-center mb-5">Key Benefits</h2>
                    <div class="row g-4">
                        <div class="col-md-4">
                            <div class="card border-0 text-center p-4">
                                <i class="fa fa-star fa-2x text-primary mb-3"/>
                                <h5>Benefit 1</h5>
                                <p class="text-muted">Description of benefit 1</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card border-0 text-center p-4">
                                <i class="fa fa-rocket fa-2x text-primary mb-3"/>
                                <h5>Benefit 2</h5>
                                <p class="text-muted">Description of benefit 2</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card border-0 text-center p-4">
                                <i class="fa fa-shield fa-2x text-primary mb-3"/>
                                <h5>Benefit 3</h5>
                                <p class="text-muted">Description of benefit 3</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CTA section -->
            <section class="s_call_to_action o_colored_level o_cc o_cc3 pt80 pb80"
                     data-snippet="s_call_to_action">
                <div class="container text-center">
                    <h2>Ready to get started?</h2>
                    <p class="lead mb-4">Contact us today.</p>
                    <a href="/contact" class="btn btn-primary btn-lg">Contact Us</a>
                </div>
            </section>
        </div>
    </template>
</odoo>
```

---

## 4. Override Dynamic Page Templates

Customize giao diện của các trang dynamic (shop, product, blog...) bằng `xpath` override.

### 4.1 Ví dụ: Override Shop Page

Tạo `views/website_sale_templates.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Override shop products layout -->
    <template id="shop_custom"
              inherit_id="website_sale.products"
              name="Airproof - Shop Customization">

        <!-- Thêm banner phía trên grid sản phẩm -->
        <xpath expr="//div[@id='products_grid_before']" position="before">
            <div class="s_airproof_shop_banner mb-5">
                <div class="container text-center py-5"
                     style="background: linear-gradient(135deg, #101728 0%, #1a2540 100%); border-radius: 12px;">
                    <h2 class="text-white mb-2">Explore Our Collection</h2>
                    <p class="text-white-50">Professional drones for every need</p>
                </div>
            </div>
        </xpath>

        <!-- Thêm sorting options -->
        <xpath expr="//div[@id='o_wsale_products_topbar']" position="inside">
            <div class="ms-auto d-flex align-items-center gap-2">
                <!-- Custom sort options -->
            </div>
        </xpath>
    </template>

    <!-- Override product card image ratio -->
    <template id="product_item_custom"
              inherit_id="website_sale.products_item"
              name="Airproof - Product Card">
        <xpath expr="//div[hasclass('o_wsale_product_grid_wrapper')]" position="attributes">
            <attribute name="class" add="o_airproof_product_card" separator=" "/>
        </xpath>
    </template>
</odoo>
```

### 4.2 Shop Page SCSS

```scss
// static/src/scss/pages/shop.scss

// Custom product card
.o_airproof_product_card {
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    // Product image aspect ratio
    .o_product_image_wrapper {
        aspect-ratio: 4/3;
        overflow: hidden;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.4s ease;
        }

        &:hover img {
            transform: scale(1.05);
        }
    }
}
```

---

## 5. SEO Attributes cho Pages

```xml
<record id="homepage" model="website.page">
    <field name="name">Home</field>
    <field name="url">/</field>
    <field name="view_id" ref="homepage_view"/>
    <field name="website_published">True</field>
    <field name="is_homepage">True</field>

    <!-- SEO -->
    <field name="website_meta_title">Airproof Drones - Professional Aerial Photography</field>
    <field name="website_meta_description">Discover our range of professional drones.</field>
    <field name="website_meta_keywords">drones, aerial photography, professional drone</field>
    <field name="website_meta_og_img">/website_airproof/static/src/img/og-image.jpg</field>

    <!-- Visibility -->
    <field name="index_id">True</field>      <!-- Google index? -->
    <field name="follow_links">True</field>  <!-- Follow links? -->
</record>
```

---

## Checklist Bước 5

- [ ] Tạo `data/pages/home.xml` với hero section
- [ ] Tạo `data/pages/contact.xml`
- [ ] Khai báo cả 2 pages trong `__manifest__.py`
- [ ] Update module và kiểm tra trang Home
- [ ] Kiểm tra trang Contact
- [ ] Test SEO meta tags (F12 → Elements → `<head>`)
- [ ] Tạo `views/new_page_template_templates.xml`
- [ ] Kiểm tra templates xuất hiện khi tạo trang mới

**Bước tiếp theo:** [Phần 6 — Media](./06_media.md)

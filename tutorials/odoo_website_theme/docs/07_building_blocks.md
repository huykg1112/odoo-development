# Phần 7: Building Blocks — Custom Snippets

> **Tài liệu gốc:** [Building blocks](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/building_blocks.html)
> **Mục tiêu:** Tạo custom snippets (building blocks) cho Website Builder.

---

## 1. Snippets Là Gì?

**Snippets** (còn gọi là Building Blocks) là các khối HTML tái sử dụng mà người dùng kéo thả vào trang qua Website Builder. Odoo cung cấp hàng chục snippets built-in (parallax, carousel, features grid...).

Bạn có thể tạo snippets riêng và chúng sẽ xuất hiện trong panel "Blocks" của Website Builder.

---

## 2. Cấu Trúc Snippet

Mỗi snippet cần:
1. **HTML template** — nội dung snippet
2. **SCSS** — styles
3. **Đăng ký vào snippet list** — để hiện trong Website Builder
4. **(Optional) JS** — behavior
5. **(Optional) Options XML** — customize options trong panel

---

## 3. Tạo Custom Snippet: Airproof Carousel

### 3.1 HTML Template

Tạo `views/snippets/s_airproof_carousel.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <template id="s_airproof_carousel" name="Airproof Carousel">
        <section class="s_airproof_carousel o_colored_level"
                 data-snippet="s_airproof_carousel"
                 data-name="Airproof Carousel">
            <div class="container">
                <!-- Carousel wrapper -->
                <div id="airproof_carousel_{{ uid }}"
                     class="carousel slide"
                     data-bs-ride="carousel">

                    <!-- Indicators -->
                    <div class="carousel-indicators">
                        <button type="button"
                                data-bs-target="#airproof_carousel_{{ uid }}"
                                data-bs-slide-to="0"
                                class="active"
                                aria-current="true"/>
                        <button type="button"
                                data-bs-target="#airproof_carousel_{{ uid }}"
                                data-bs-slide-to="1"/>
                        <button type="button"
                                data-bs-target="#airproof_carousel_{{ uid }}"
                                data-bs-slide-to="2"/>
                    </div>

                    <!-- Slides -->
                    <div class="carousel-inner">
                        <!-- Slide 1 -->
                        <div class="carousel-item active">
                            <img src="/website_airproof/static/src/img/drone_mini.jpg"
                                 class="d-block w-100"
                                 alt="Airproof Mini"
                                 loading="lazy"/>
                            <div class="carousel-caption d-none d-md-block">
                                <h5>Airproof Mini</h5>
                                <p>Perfect for beginners</p>
                            </div>
                        </div>
                        <!-- Slide 2 -->
                        <div class="carousel-item">
                            <img src="/website_airproof/static/src/img/drone_pro.jpg"
                                 class="d-block w-100"
                                 alt="Airproof Pro"
                                 loading="lazy"/>
                            <div class="carousel-caption d-none d-md-block">
                                <h5>Airproof Pro</h5>
                                <p>For professionals</p>
                            </div>
                        </div>
                        <!-- Slide 3 -->
                        <div class="carousel-item">
                            <img src="/website_airproof/static/src/img/drone_eagle.jpg"
                                 class="d-block w-100"
                                 alt="Airproof Eagle"
                                 loading="lazy"/>
                            <div class="carousel-caption d-none d-md-block">
                                <h5>Airproof Eagle</h5>
                                <p>Maximum power</p>
                            </div>
                        </div>
                    </div>

                    <!-- Navigation buttons -->
                    <button class="carousel-control-prev"
                            type="button"
                            data-bs-target="#airproof_carousel_{{ uid }}"
                            data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"/>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next"
                            type="button"
                            data-bs-target="#airproof_carousel_{{ uid }}"
                            data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"/>
                        <span class="visually-hidden">Next</span>
                    </button>
                </div>
            </div>
        </section>
    </template>
</odoo>
```

### 3.2 SCSS

Tạo `static/src/snippets/s_airproof_carousel/000.scss`:

```scss
// Airproof Carousel snippet styles

.s_airproof_carousel {
    padding: 0;
    overflow: hidden;

    .carousel-item {
        // Chiều cao carousel
        max-height: 600px;

        img {
            width: 100%;
            height: 600px;
            object-fit: cover;
        }
    }

    .carousel-caption {
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
        padding: 2rem;
        bottom: 0;
        left: 0;
        right: 0;
        text-align: left;

        h5 {
            font-size: 1.5rem;
            font-weight: 700;
        }
    }

    // Custom indicators
    .carousel-indicators {
        justify-content: flex-end;
        padding-right: 2rem;
        margin-bottom: 1rem;

        [data-bs-slide-to] {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.5);
            border: none;

            &.active {
                background-color: #fff;
                transform: scale(1.3);
            }
        }
    }

    // Custom navigation arrows
    .carousel-control-prev,
    .carousel-control-next {
        width: 48px;
        height: 48px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 50%;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    &:hover {
        .carousel-control-prev,
        .carousel-control-next {
            opacity: 1;
        }
    }

    .carousel-control-prev {
        left: 1rem;
    }

    .carousel-control-next {
        right: 1rem;
    }
}
```

### 3.3 Đăng Ký Snippet vào Website Builder

Tạo `views/snippets/options.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Đăng ký snippets vào đúng category trong Website Builder panel -->
    <template id="snippets_airproof"
              inherit_id="website.snippets"
              name="Airproof Snippets">

        <!-- Thêm vào category "Content" -->
        <xpath expr="//div[@id='snippet_content']" position="before">
            <div class="o_panel_header">Airproof</div>
            <div id="snippet_airproof" class="o_snippet_list">
                <!-- Carousel snippet -->
                <div class="o_snippet" data-oe-type="snippet"
                     data-oe-thumbnail="/website_airproof/static/src/img/wbuilder/s_airproof_carousel.png">
                    <div>
                        <t t-call="website_airproof.s_airproof_carousel"/>
                    </div>
                    <div class="o_snippet_thumbnail">
                        <img src="/website_airproof/static/src/img/wbuilder/s_airproof_carousel.png"
                             alt="Airproof Carousel"/>
                    </div>
                    <span>Airproof Carousel</span>
                </div>
            </div>
        </xpath>
    </template>
</odoo>
```

### 3.4 Khai Báo trong `__manifest__.py`

```python
'data': [
    # Snippets phải load TRƯỚC các file khác dùng snippet
    'views/snippets/options.xml',
    'views/snippets/s_airproof_carousel.xml',
    # ...
],
'assets': {
    'web.assets_frontend': [
        'website_airproof/static/src/snippets/s_airproof_carousel/000.scss',
    ],
},
```

---

## 4. Snippet Options (Customize Panel)

Options cho phép user tùy chỉnh snippet từ panel bên phải trong Website Builder.

### 4.1 Loại Options Cơ Bản

```xml
<!-- Trong views/snippets/options.xml -->
<template id="s_airproof_carousel_options"
          inherit_id="website.snippet_options"
          name="Airproof Carousel - Options">
    <xpath expr="." position="inside">
        <!-- Options cho snippet của chúng ta -->
        <div data-js="AirproofCarousel"
             data-selector=".s_airproof_carousel">

            <!-- Toggle: Hiện/Ẩn caption -->
            <we-checkbox data-no-preview="true"
                         data-toggle-class="o_carousel_show_caption">
                Show Caption
            </we-checkbox>

            <!-- Select: Số lượng slides -->
            <we-select data-attribute-name="data-slides-count">
                <we-button data-select-data-attribute="3">3 Slides</we-button>
                <we-button data-select-data-attribute="4">4 Slides</we-button>
                <we-button data-select-data-attribute="5">5 Slides</we-button>
            </we-select>

            <!-- Range: Tốc độ transition -->
            <we-input data-attribute-name="data-bs-interval"
                      data-unit="ms"
                      data-min="1000"
                      data-max="10000"
                      data-step="500">
                Slide Interval (ms)
            </we-input>
        </div>
    </xpath>
</template>
```

---

## 5. Custom JavaScript cho Snippet

Tạo `static/src/js/snippets/s_airproof_carousel.js`:

```javascript
/** @odoo-module **/

import { Component } from "@odoo/owl";
import publicWidget from "@web/legacy/js/public/public_widget";

// Extend Odoo public widget cho snippet
publicWidget.registry.AirproofCarousel = publicWidget.Widget.extend({
    selector: ".s_airproof_carousel",
    disabledInEditableMode: false,

    start() {
        this._super(...arguments);
        this._initCarousel();
    },

    _initCarousel() {
        // Thêm behavior tùy chỉnh
        const carousel = this.el.querySelector(".carousel");
        if (!carousel) return;

        // Ví dụ: pause on hover
        carousel.addEventListener("mouseenter", () => {
            const bsCarousel = bootstrap.Carousel.getInstance(carousel);
            if (bsCarousel) bsCarousel.pause();
        });

        carousel.addEventListener("mouseleave", () => {
            const bsCarousel = bootstrap.Carousel.getInstance(carousel);
            if (bsCarousel) bsCarousel.cycle();
        });
    },
});
```

Thêm vào `__manifest__.py`:
```python
'assets': {
    'web.assets_frontend': [
        'website_airproof/static/src/js/snippets/s_airproof_carousel.js',
    ],
},
```

---

## 6. Snippet Thumbnail

Thumbnail hiển thị trong Website Builder panel. Kích thước: **216 × 135px**.

```
static/src/img/wbuilder/
├── s_airproof_carousel.png    ← Thumbnail cho carousel snippet
└── template-header-opt.svg    ← Thumbnail cho header option
```

---

## 7. Các Snippet Attributes Quan Trọng

```xml
<section
    class="s_airproof_carousel o_colored_level"
    data-snippet="s_airproof_carousel"    ← ID của snippet (phải unique)
    data-name="Airproof Carousel"         ← Tên hiển thị khi chọn snippet
    data-vcss="001"                       ← Version CSS (tự increment khi thay đổi CSS)
    data-vxml="001"                       ← Version XML (tự increment khi thay đổi HTML)
>
```

| Attribute | Mô tả |
|-----------|--------|
| `data-snippet` | ID định danh snippet type, dùng để load options |
| `data-name` | Tên hiển thị khi hover/select snippet |
| `data-vcss` | Version CSS — tăng khi thay đổi SCSS để force reload |
| `data-vxml` | Version HTML — tăng khi thay đổi template |
| `o_colored_level` | Cho phép apply Color Combinations |
| `oe_structure` | Cho phép kéo thả snippets khác vào trong |

---

## 8. Airproof Carousel thực tế

Từ file `views/snippets/s_airproof_carousel.xml` của module Airproof, snippet có các đặc điểm:
- Fullwidth carousel với ảnh sản phẩm
- Custom navigation arrows
- Lazy loading cho ảnh
- Responsive cho mobile

---

## Checklist Bước 7

- [ ] Tạo `views/snippets/` directory
- [ ] Tạo `views/snippets/s_airproof_carousel.xml`
- [ ] Tạo `views/snippets/options.xml`
- [ ] Tạo `static/src/snippets/s_airproof_carousel/000.scss`
- [ ] Tạo thumbnail 216×135px tại `static/src/img/wbuilder/`
- [ ] Khai báo đúng trong `__manifest__.py`
- [ ] Kiểm tra snippet xuất hiện trong Website Builder panel
- [ ] Test kéo thả snippet vào trang
- [ ] Test options panel hoạt động

**Bước tiếp theo:** [Phần 8 — Shapes](./08_shapes.md)

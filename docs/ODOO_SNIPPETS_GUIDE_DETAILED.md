# HƯỚNG DẪN CHI TIẾT VỀ HỆ THỐNG SNIPPETS TRONG ODOO WEBSITE

## 📚 Mục Lục
1. [Giới Thiệu](#giới-thiệu)
2. [Cấu Trúc Thư Mục Snippets](#cấu-trúc-thư-mục)
3. [Cách Tạo Snippet](#cách-tạo-snippet)
4. [Cách Hoạt Động Của Snippet](#cách-hoạt-động)
5. [Cấu Hình Cho Kéo Thả Trong Editor](#cấu-hình-kéo-thả)
6. [Các Ví Dụ Chi Tiết](#các-ví-dụ)
7. [Tối Ưu Hóa Và Best Practices](#best-practices)

---

## 📖 <a name="giới-thiệu"></a>1. Giới Thiệu Về Snippets

### Snippets Là Gì?
**Snippets** (đoạn mã) trong Odoo Website là những **khối nội dung được xây dựng sẵn** có thể được **kéo thả vào trang web** một cách dễ dàng mà không cần viết code. Chúng là một phần quan trọng của website builder drag-and-drop.

### Ví Dụ Thực Tế
- **Banner**: Khối tiêu đề lớn với hình ảnh và nút CTA
- **Carousel**: Vòng lặp hình ảnh/nội dung có thể chuyển động
- **Card Grid**: Lưới thẻ để hiển thị sản phẩm hoặc dịch vụ
- **Text Block**: Khối văn bản đơn giản
- **Alert**: Thông báo/cảnh báo có thể định dạng

### Tại Sao Cần Snippets?
✅ **Giao diện thân thiện**: Không cần code để tạo trang
✅ **Nhất quán**: Đảm bảo thiết kế thống nhất toàn trang
✅ **Tái sử dụng**: Một snippet có thể được sao chép nhiều lần
✅ **Tùy biến**: Mỗi snippet có các tùy chọn tùy biến
✅ **Hiệu suất**: Tối ưu CSS/JS từ trước

---

## 🗂️ <a name="cấu-trúc-thư-mục"></a>2. Cấu Trúc Thư Mục Snippets

### Vị Trí Thư Mục
```
f:\BMS\Odoo\odoo\addons\website\
├── views/
│   ├── snippets/             ← Tất cả snippets nằm ở đây
│   │   ├── snippets.xml      ← File đăng ký chính
│   │   ├── s_button.xml      ← Snippet Button
│   │   ├── s_carousel.xml    ← Snippet Carousel
│   │   ├── s_alert.xml       ← Snippet Alert
│   │   ├── s_banner.xml      ← Snippet Banner
│   │   ├── s_text_block.xml  ← Snippet Text Block
│   │   ├── s_dynamic_snippet.xml
│   │   └── ... (100+ các snippet khác)
│   └── ... (các file view khác)
└── static/src/snippets/      ← CSS/JS cho snippets
    ├── s_carousel/
    │   ├── 000.scss
    │   ├── 001.scss
    │   └── 000.js
    ├── s_alert/
    │   └── 000.scss
    └── ... (các thư mục snippet khác)
```

### File Đăng Ký Chính: `snippets.xml`
Đây là file **chính** nơi tất cả snippets được đăng ký và tổ chức thành các nhóm

---

## 🏗️ <a name="cách-tạo-snippet"></a>3. Cách Tạo Snippet Mới (Step-by-Step)

### Bước 1: Hiểu Cấu Trúc Snippet Cơ Bản

**File XML Cơ Bản** (`s_button.xml` - Ví dụ đơn giản nhất):
```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

<template id="s_button" name="Button">
    <a class="btn btn-primary o_snippet_drop_in_only" href="#">Button</a>
</template>

</odoo>
```

**Giải thích:**
- `template id="s_button"`: Mã định danh duy nhất cho snippet (luôn bắt đầu bằng `s_`)
- `name="Button"`: Tên hiển thị trong snippet picker
- `o_snippet_drop_in_only`: Class đặc biệt để cho phép kéo thả

### Bước 2: Tạo File XML Chi Tiết

**Ví dụ: Tạo snippet "s_button_custom.xml"**

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

<!-- ====== Template Chính của Snippet ====== -->
<template id="s_button_custom" name="Custom Button">
    <!-- Cấu trúc HTML của snippet -->
    <a class="btn btn-primary o_snippet_drop_in_only" href="#">
        <i class="fa fa-star me-2"/>Click Me
    </a>
</template>

<!-- ====== Asset CSS (Tùy chọn) ====== -->
<asset id="website.s_button_custom_000_scss" name="Custom Button SCSS">
    <bundle>web.assets_frontend</bundle>
    <path>website/static/src/snippets/s_button_custom/000.scss</path>
</asset>

<!-- ====== Asset JavaScript (Tùy chọn) ====== -->
<asset id="website.s_button_custom_000_js" name="Custom Button JS">
    <bundle>web.assets_frontend</bundle>
    <path>website/static/src/snippets/s_button_custom/000.js</path>
</asset>

</odoo>
```

### Bước 3: Tạo Thư Mục Static (Nếu Có CSS/JS)

```
static/src/snippets/s_button_custom/
├── 000.scss          ← Styled CSS cho snippet
├── 000.js            ← JavaScript cho snippet
└── thumbnail.svg     ← Ảnh thumb (64x64px)
```

**File `000.scss` - Ví dụ:**
```scss
// File: website/static/src/snippets/s_button_custom/000.scss

.btn.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 50px;
    padding: 12px 24px;
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
}
```

**File `000.js` - Ví dụ:**
```javascript
// File: website/static/src/snippets/s_button_custom/000.js

odoo.define('website.s_button_custom', function (require) {
    'use strict';
    var publicWidget = require('web.public.widget');

    publicWidget.registry.buttonCustom = publicWidget.Widget.extend({
        selector: '.o_snippet_drop_in_only',
        start: function() {
            console.log('Custom button snippet loaded');
            
            this.$el.on('click', function() {
                console.log('Button clicked!');
            });
        }
    });
    
    return publicWidget.registry.buttonCustom;
});
```

### Bước 4: Đăng Ký Snippet Trong `__manifest__.py`

**File: `__manifest__.py`**

Thêm dòng sau vào danh sách `'data'`:
```python
'data': [
    # ... các file khác
    'views/snippets/s_button_custom.xml',  # ← Thêm dòng này
]
```

Hoặc nếu tạo module mới:

```python
{
    'name': 'Custom Snippets',
    'version': '1.0',
    'depends': ['website'],
    'data': [
        'views/snippets/s_button_custom.xml',
    ],
    'installable': True,
}
```

### Bước 5: Đăng Ký Snippet Trong `snippets.xml`

**Mở file: `views/snippets/snippets.xml`**

Tìm section `<snippet_structure>` và thêm:

```xml
<snippet_structure>
    <!-- ... các snippet khác -->
    
    <!-- Your Custom Snippet -->
    <t t-snippet="website.s_button_custom" string="Custom Button" group="content">
        <keywords>button, action, cta, call-to-action, click, interactive</keywords>
    </t>
    
    <!-- ... -->
</snippet_structure>
```

**Giải thích các thuộc tính:**
- `t-snippet="website.s_button_custom"`: Tham chiếu đến template id
- `string="Custom Button"`: Tên hiển thị trong snippet picker
- `group="content"`: Nhóm snippets (intro, columns, content, images, people, text, etc.)
- `<keywords>`: Từ khóa cho tìm kiếm

---

## ⚙️ <a name="cách-hoạt-động"></a>4. Cách Hoạt Động Của Snippet System

### 4.1 Quy Trình Load Snippet

```
1. Website Module Load
   ↓
2. Đọc `snippets.xml` → Đơc list tất cả snippets
   ↓
3. Tổ chức snippets thành các nhóm (group)
   ↓
4. Load CSS/JS assets của snippet
   ↓
5. Hiển thị Snippet Picker trên giao diện editor
   ↓
6. Người dùng kéo thả snippet vào trang
   ↓
7. Tạo instance mới của snippet
   ↓
8. Khởi tạo JavaScript widget nếu có
   ↓
9. Hiển thị Options picker (tùy chọn tùy biến)
```

### 4.2 Cấu Trúc HTML Của Snippet Trong Trang

**Khi snippet được kéo thả vào trang:**

```html
<!-- Trong HTML của trang -->
<section class="s_banner pt96 pb96" data-snippet="s_banner">
    <!-- Nội dung của snippet -->
    <div class="container">
        <h1>Tiêu đề</h1>
        <p>Mô tả</p>
    </div>
</section>
```

### 4.3 Kiểm Soát Qua Các Class

| Class | Ý Nghĩa |
|-------|---------|
| `o_snippet_drop_in_only` | Snippet chỉ có thể được kéo thả, không edit trực tiếp |
| `oe_unremovable` | Không thể xóa element này |
| `oe_unmovable` | Không thể di chuyển element này |
| `o_not_editable` | Không thể edit nội dung element này |
| `css_non_editable_mode_hidden` | Ẩn khi không ở edit mode |

---

## 🎯 <a name="cấu-hình-kéo-thả"></a>5. Cấu Hình Chi Tiết Cho Kéo Thả (Drag-and-Drop) Trong Editor

### 5.1 Khái Niệm Snippet Options

**Snippet Options** cho phép tùy biến snippet từ panel options trong editor mà không cần edit HTML.

### 5.2 Tạo Snippet Options

**Ví dụ: s_alert_options.xml**

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

<!-- Template snippet chính -->
<template id="s_alert" name="Alert">
    <div class="s_alert s_alert_md alert alert-info w-100 clearfix">
        <i class="fa fa-2x fa-info-circle s_alert_icon"/>
        <div class="s_alert_content">
            <p>Customize this alert message here.</p>
        </div>
    </div>
</template>

<!-- Template Snippet Options (Tùy Chọn) -->
<template id="s_alert_options" inherit_id="website.snippet_options">
    <xpath expr="//div[@id='so_width']" position="before">
        <!-- Chọn kiểu alert -->
        <div data-selector=".s_alert" data-js="Alert">
            <we-select string="Type" data-apply-to=".fa.s_alert_icon" data-trigger="alert_colorpicker_opt">
                <we-button data-select-class="fa-user-circle" data-trigger-value="primary">Primary</we-button>
                <we-button data-select-class="fa-info-circle" data-trigger-value="info">Info</we-button>
                <we-button data-select-class="fa-check-circle" data-trigger-value="success">Success</we-button>
                <we-button data-select-class="fa-exclamation-triangle" data-trigger-value="warning">Warning</we-button>
                <we-button data-select-class="fa-exclamation-circle" data-trigger-value="danger">Danger</we-button>
            </we-select>
        </div>
    </xpath>
    
    <!-- Chọn kích thước -->
    <xpath expr="//div[@id='so_width']" position="after">
        <div data-selector=".s_alert">
            <we-select string="Size">
                <we-button data-select-class="s_alert_sm">Small</we-button>
                <we-button data-select-class="s_alert_md">Medium</we-button>
                <we-button data-select-class="s_alert_lg">Large</we-button>
            </we-select>
            
            <!-- Chọn màu -->
            <we-colorpicker string="Color" 
                data-name="alert_colorpicker_opt"
                data-select-style="true"
                data-css-property="background-color"
                data-color-prefix="alert-"/>
        </div>
    </xpath>
</template>

</odoo>
```

### 5.3 Web Editor Components - Các Component Có Sẵn

#### A. **we-select** - Chọn lựa
```xml
<we-select string="Label" data-name="optional_name">
    <we-button data-select-class="class-name">Tùy chọn 1</we-button>
    <we-button data-select-class="class-name-2">Tùy chọn 2</we-button>
</we-select>
```

#### B. **we-button-group** - Nhóm nút
```xml
<we-button-group string="Alignment">
    <we-button data-select-class="text-start" title="Left">Left</we-button>
    <we-button data-select-class="text-center" title="Center">Center</we-button>
    <we-button data-select-class="text-end" title="Right">Right</we-button>
</we-button-group>
```

#### C. **we-colorpicker** - Chọn màu
```xml
<we-colorpicker string="Background Color" 
    data-select-style="true"
    data-css-property="background-color"
    data-color-prefix="btn-"/>
```

#### D. **we-input** - Nhập text
```xml
<we-input string="Title" 
    data-select-style="true"
    data-css-property="content" 
    data-attribute-name="data-title"/>
```

#### E. **we-checkbox** - Checkbox
```xml
<we-checkbox string="Show Header"
    data-select-class="show-header"
    data-attribute-name="data-show-header"/>
```

### 5.4 Thuộc Tính Quan Trọng

| Thuộc Tính | Mô Tả | Ví Dụ |
|-----------|-------|-------|
| `data-selector` | CSS selector để chọn element | `.s_alert` |
| `data-apply-to` | CSS selector để áp dụng class | `.fa.s_alert_icon` |
| `data-select-class` | Class CSS sẽ được thêm/xóa | `alert-info` |
| `data-select-style` | Áp dụng inline style | `true` |
| `data-css-property` | CSS property để thiết lập | `background-color` |
| `data-attribute-name` | HTML attribute để thiết lập | `data-value` |
| `data-trigger` | Trigger action khác | `alert_colorpicker_opt` |
| `data-js` | JavaScript class handler | `Alert` |

### 5.5 Ví Dụ: Tạo Options Cho Custom Button

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

<template id="s_button_custom" name="Custom Button">
    <a class="btn btn-primary o_snippet_drop_in_only" 
       href="#" 
       data-snippet="s_button_custom">
        <i class="fa fa-star me-2"/>Click Me
    </a>
</template>

<!-- Options cho snippet -->
<template id="s_button_custom_options" inherit_id="website.snippet_options">
    <xpath expr="." position="inside">
        <!-- Chọn kiểu button -->
        <div data-selector=".btn" data-js="ButtonCustom">
            <we-select string="Style">
                <we-button data-select-class="btn-primary">Primary</we-button>
                <we-button data-select-class="btn-secondary">Secondary</we-button>
                <we-button data-select-class="btn-success">Success</we-button>
                <we-button data-select-class="btn-danger">Danger</we-button>
                <we-button data-select-class="btn-warning">Warning</we-button>
            </we-select>
            
            <!-- Chọn kích thước -->
            <we-select string="Size">
                <we-button data-select-class="btn-sm">Small</we-button>
                <we-button data-select-class="">Normal</we-button>
                <we-button data-select-class="btn-lg">Large</we-button>
            </we-select>
            
            <!-- Hiệu ứng hover -->
            <we-button-group string="Hover Effect">
                <we-button data-select-class="" title="None">None</we-button>
                <we-button data-select-class="btn-hover-lift" title="Lift">Lift</we-button>
                <we-button data-select-class="btn-hover-glow" title="Glow">Glow</we-button>
            </we-button-group>
        </div>
    </xpath>
</template>

</odoo>
```

### 5.6 JavaScript Handler Cho Custom Behavior

Nếu cần xử lý logic phức tạp khi tùy chọn thay đổi:

```javascript
// File: website/static/src/js/snippets/s_button_custom.js

odoo.define('website.snippet.option.ButtonCustom', function(require) {
    'use strict';
    
    var options = require('web_editor.snippets.options');
    
    options.registry.ButtonCustom = options.Class.extend({
        // Hàm init
        init: function() {
            this._super.apply(this, arguments);
        },
        
        // Khi snippet được chọn
        onFocus: function() {
            console.log('Button snippet is focused');
        },
        
        // Check xem nút có thể được chỉnh sửa không
        isTopOrBottomElement: function() {
            // Trả về true nếu muốn giới hạn vị trí
            return false;
        }
    });
    
    return options;
});
```

---

## 📚 <a name="các-ví-dụ"></a>6. Các Ví Dụ Chi Tiết

### Ví Dụ 1: Carousel (Phức Tạp)

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

<template id="s_carousel" name="Carousel">
    <section class="s_carousel_wrapper p-0" data-vxml="001" data-vcss="001">
        <!-- Khởi tạo ID duy nhất cho carousel -->
        <t t-set="uniq" t-value="datetime.datetime.now().microsecond"/>
        
        <div t-attf-id="myCarousel{{uniq}}" 
             class="s_carousel carousel slide" 
             data-bs-ride="true" 
             data-bs-interval="10000">
             
            <!-- Nội dung slides -->
            <div class="carousel-inner">
                <!-- Slide 1 -->
                <div class="carousel-item active" data-name="Slide">
                    <img src="/web/image/website.carousel_image_1" alt=""/>
                    <div class="carousel-caption">
                        <h2>Slide Title</h2>
                        <p>Description</p>
                    </div>
                </div>
                
                <!-- Slide 2 -->
                <div class="carousel-item" data-name="Slide">
                    <img src="/web/image/website.carousel_image_2" alt=""/>
                </div>
            </div>
            
            <!-- Điều khiển -->
            <button class="carousel-control-prev" 
                    t-attf-data-bs-target="#myCarousel{{uniq}}" 
                    data-bs-slide="prev">
                <span class="carousel-control-prev-icon"/>
            </button>
            <button class="carousel-control-next" 
                    t-attf-data-bs-target="#myCarousel{{uniq}}" 
                    data-bs-slide="next">
                <span class="carousel-control-next-icon"/>
            </button>
        </div>
    </section>
</template>

<!-- Cấu hình assets -->
<asset id="website.s_carousel_001_scss" name="Carousel SCSS">
    <bundle>web.assets_frontend</bundle>
    <path>website/static/src/snippets/s_carousel/001.scss</path>
</asset>

</odoo>
```

**Các điểm quan trọng:**
- `t-set="uniq"`: Tạo ID duy nhất để tránh xung đột
- `t-attf-id`: Interpolate ID vào template
- `data-bs-ride="true"`: Tự động khởi tạo carousel Bootstrap
- Asset được đăng ký để load CSS

### Ví Dụ 2: Dynamic Snippet (Lấy Dữ Liệu Động)

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

<!-- Template chính -->
<template id="s_dynamic_snippet" name="Dynamic Content">
    <t t-call="website.s_dynamic_snippet_template">
        <t t-set="snippet_name" t-value="'s_dynamic_snippet'"/>
    </t>
</template>

<!-- Template cơ sở -->
<template id="website.s_dynamic_snippet_template">
    <section t-attf-class="#{snippet_name}" 
             t-att-data-snippet="snippet_name">
        <div class="container">
            <!-- Title -->
            <div class="s_dynamic_snippet_title oe_unremovable">
                <h4>Latest Posts</h4>
            </div>
            
            <!-- Content từ database -->
            <div class="s_dynamic_snippet_content oe_unremovable">
                <!-- Sẽ được lấp đầy bằng dữ liệu từ backend -->
                <t t-out="0"/>
            </div>
        </div>
    </section>
</template>

<!-- Options -->
<template id="s_dynamic_snippet_options" inherit_id="website.snippet_options">
    <xpath expr="." position="inside">
        <div data-js="DynamicSnippet" data-selector=".s_dynamic_snippet">
            <!-- Chọn filter dữ liệu -->
            <we-select string="Filter" 
                       data-name="filter_opt" 
                       data-attribute-name="filterId">
            </we-select>
            
            <!-- Chọn template hiển thị -->
            <we-select string="Template" 
                       data-name="template_opt" 
                       data-attribute-name="templateKey">
            </we-select>
            
            <!-- Chọn số lượng bản ghi -->
            <we-select string="Number of Records" 
                       data-attribute-name="numberOfRecords">
                <we-button t-foreach="range(1, 17)" 
                          t-as="value" 
                          t-att-data-select-data-attribute="value">
                    <t t-esc="value"/>
                </we-button>
            </we-select>
        </div>
    </xpath>
</template>

</odoo>
```

### Ví Dụ 3: Text Block Đơn Giản

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

<template id="s_text_block" name="Text">
    <section class="s_text_block pt40 pb40">
        <div class="container s_allow_columns">
            <p>
                Great stories have a <b>personality</b>. Consider telling 
                a great story that provides personality.
            </p>
            <p>
                Great stories are <b>for everyone</b> even when only 
                written <b>for just one person</b>.
            </p>
        </div>
    </section>
</template>

</odoo>
```

---

## 🎓 <a name="best-practices"></a>7. Tối Ưu Hóa Và Best Practices

### 7.1 Đặt Tên Snippet
```
✅ CÓ: s_button, s_carousel, s_text_block
❌ KHÔNG: snippet_button, my_button, button_custom
→ Luôn bắt đầu bằng "s_" viết tắt của "snippet"
```

### 7.2 Cấu Trúc CSS Classes
```xml
<!-- ✅ CÓ -->
<section class="s_feature pt40 pb40">
    <div class="s_feature_title"/>
    <div class="s_feature_content"/>
</section>

<!-- ❌ KHÔNG -->
<section class="feature section">
    <div id="title"/>
    <div id="content"/>
</section>
```

### 7.3 Sử Dụng Dữ Liệu (Data Attributes)
```xml
<!-- ✅ CÓ -->
<div data-snippet="s_carousel" 
     data-vxml="001" 
     data-vcss="001"
     data-name="Carousel">
</div>

<!-- ❌ KHÔNG -->
<div class="carousel" id="slider-1">
</div>
```

### 7.4 CSS Specificity
```scss
/* ✅ CÓ - Specificity cân bằng */
.s_carousel {
    display: block;
    padding: 2rem 0;
    
    .carousel-item {
        height: 400px;
    }
    
    .carousel-caption {
        bottom: 1rem;
    }
}

/* ❌ KHÔNG - Quá cụ thể */
body main section.s_carousel div.carousel-inner div.carousel-item {
    height: 400px;
}
```

### 7.5 JavaScript Module Pattern
```javascript
/* ✅ CÓ */
odoo.define('website.snippet.option.MySnippet', function(require) {
    'use strict';
    var options = require('web_editor.snippets.options');
    
    options.registry.MySnippet = options.Class.extend({
        // ...
    });
    
    return options;
});

/* ❌ KHÔNG - Global Variable */
function mySnippetInit() {
    // ...
}
```

### 7.6 Asset Organization
```xml
<!-- ✅ CÓ -->
<asset id="website.s_carousel_000_scss" 
        name="Carousel 000 SCSS">
    <bundle>web.assets_frontend</bundle>
    <path>website/static/src/snippets/s_carousel/000.scss</path>
</asset>

<asset id="website.s_carousel_000_js" 
        name="Carousel 000 JS">
    <bundle>web.assets_frontend</bundle>
    <path>website/static/src/snippets/s_carousel/000.js</path>
</asset>

<!-- ❌ KHÔNG - Không rõ ràng phiên bản -->
<asset id="website.carousel" name="Carousel">
    <bundle>web.assets_frontend</bundle>
    <path>website/static/src/snippets/carousel.bundle.js</path>
</asset>
```

### 7.7 Responsive Design
```xml
<!-- ✅ CÓ - Responsive từ một đầu -->
<div class="container">
    <div class="row">
        <div class="col-lg-6 col-md-12 col-sm-12">
            <!-- Content -->
        </div>
    </div>
</div>

<!-- ❌ KHÔNG - Chỉ desktop -->
<div style="width: 1200px; margin: 0 auto;">
    <div style="width: 600px; float: left;">
    </div>
</div>
```

### 7.8 Thumbnail Images
```
✅ Tất cả snippet nên có thumbnail
📐 Kích thước: 256x192px (hoặc tỉ lệ 4:3)
📁 Vị trí: static/src/img/snippets_thumbs/s_<name>.svg
📝 Format: SVG tốt nhất (vector, không bị mờ)
```

### 7.9 Tối Ưu Hiệu Suất
```scss
/* ✅ CÓ - Sử dụng CSS transitions */
.btn {
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-2px);
    }
}

/* ❌ KHÔNG - Sử dụng JavaScript */
$('.btn').on('hover', function() {
    $(this).animate({top: '-2px'}, 300);
});
```

---

## 🔧 Troubleshooting

### Snippet Không Hiện Trong Picker
**Nguyên nhân**: Snippet chưa được đăng ký trong `snippets.xml`

**Giải pháp**:
```xml
<!-- Thêm vào views/snippets/snippets.xml -->
<snippet_structure>
    <t t-snippet="website.s_my_snippet" 
       string="My Snippet" 
       group="content">
        <keywords>my, snippet</keywords>
    </t>
</snippet_structure>
```

### CSS/JS Không Load
**Nguyên nhân**: Asset chưa được đăng ký

**Giải pháp**:
```xml
<asset id="website.s_my_snippet_000_scss" name="My Snippet SCSS">
    <bundle>web.assets_frontend</bundle>
    <path>website/static/src/snippets/s_my_snippet/000.scss</path>
</asset>
```

### Options Không Hoạt Động
**Nguyên nhân**: `data-selector` không khớp với HTML structure

**Giải pháp**:
```xml
<!-- Kiểm tra class của element -->
<!-- HTML: <div class="s_alert"> -->
<!-- Options: data-selector=".s_alert" -->  ✅ ĐÚNG
<!-- Options: data-selector=".alert" -->    ❌ SAI
```

---

## 📋 Checklist Tạo Snippet Mới

- [ ] Tạo file XML (`views/snippets/s_<name>.xml`)
- [ ] Viết template chính (`<template id="s_<name>">`)
- [ ] Thêm từ khóa (`<keywords>`)
- [ ] Tạo folder static (`static/src/snippets/s_<name>/`)
- [ ] Tạo file SCSS (`000.scss`)
- [ ] Tạo file JavaScript nếu cần (`000.js`)
- [ ] Tạo thumbnail (`256x192px`)
- [ ] Viết template options nếu cần
- [ ] Đăng ký asset CSS/JS trong XML
- [ ] Thêm vào `__manifest__.py`
- [ ] Thêm vào `snippets.xml` (snippet_structure)
- [ ] Test trong giao diện website editor
- [ ] Kiểm tra responsive (mobile/tablet/desktop)
- [ ] Kiểm tra tùy chọn (options)

---

## 📖 Tài Liệu Liên Quan

- **Web Editor**: Hệ thống chỉnh sửa trang web cơ bản
- **Bootstrap 5**: Framework CSS sử dụng trong Odoo Website
- **Owl**: Template engine của Odoo
- **Assets**: Hệ thống quản lý CSS/JS trong Odoo

---

**Tài liệu được cập nhật lần cuối**: Tháng 4, 2026
**Phiên bản Odoo**: 16.0+

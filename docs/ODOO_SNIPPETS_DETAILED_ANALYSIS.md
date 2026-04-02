# PHÂN TÍCH SNIPPET THỰC TẾ - HƯỚNG DẪN CHI TIẾT

## Mục Lục
1. [Phân Tích Cấu Trúc File](#phân-tích-cấu-trúc)
2. [Ví Dụ: Banner Snippet](#ví-dụ-banner)
3. [Ví Dụ: Carousel Snippet](#ví-dụ-carousel)
4. [Ví Dụ: Alert Snippet với Options](#ví-dụ-alert)
5. [Ví Dụ: Dynamic Snippet](#ví-dụ-dynamic)
6. [Hệ Thống File Structure](#hệ-thống-file)
7. [Quá Trình Render Snippet](#quá-trình-render)

---

## 📄 <a name="phân-tích-cấu-trúc"></a>1. Phân Tích Cấu Trúc File XML Snippet

### Cấu Trúc Cơ Bản (5 Element Chính)

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- ▶ PHẦN 1: Template Snippet -->
    <template id="s_button" name="Button">
        <a class="btn btn-primary o_snippet_drop_in_only" href="#">Button</a>
    </template>
    
    <!-- ▶ PHẦN 2: Template Options (Tuỳ Chọn) -->
    <template id="s_button_options" inherit_id="website.snippet_options">
        <xpath expr="." position="inside">
            <!-- Các tùy chọn tùy biến -->
        </xpath>
    </template>
    
    <!-- ▶ PHẦN 3: Asset CSS -->
    <asset id="website.s_button_000_scss" name="Button SCSS">
        <bundle>web.assets_frontend</bundle>
        <path>website/static/src/snippets/s_button/000.scss</path>
    </asset>
    
    <!-- ▶ PHẦN 4: Asset JavaScript -->
    <asset id="website.s_button_000_js" name="Button JS">
        <bundle>web.assets_frontend</bundle>
        <path>website/static/src/snippets/s_button/000.js</path>
    </asset>
    
    <!-- ▶ PHẦN 5: Asset Template (Nếu Cần) -->
    <asset id="website.s_button_000_xml" name="Button Template">
        <bundle>web.assets_frontend</bundle>
        <path>website/static/src/snippets/s_button/000.xml</path>
    </asset>
</odoo>
```

### Chi Tiết Từng Phần

#### PHẦN 1: Template Snippet
```xml
<template id="s_button" name="Button">
    <!-- id: Mã định danh duy nhất (bắt đầu bằng s_) -->
    <!-- name: Tên hiển thị trong picker -->
    
    <!-- HTML Content của snippet -->
    <a class="btn btn-primary o_snippet_drop_in_only" href="#">
        Button
    </a>
</template>
```

**Ý Nghĩa Các Class:**
- `btn btn-primary`: Bootstrap button classes
- `o_snippet_drop_in_only`: Đánh dấu đây là snippet

#### PHẦN 2: Template Options
```xml
<template id="s_button_options" inherit_id="website.snippet_options">
    <!-- inherit_id: Kế thừa từ website.snippet_options -->
    <!-- xpath: Chỉ vị trí chèn các tùy chọn -->
    
    <xpath expr="." position="inside">
        <!-- Các we-select, we-button, we-colorpicker, etc. -->
    </xpath>
</template>
```

#### PHẦN 3-5: Assets
```xml
<!-- CSS Asset -->
<asset id="website.s_button_000_scss" name="Button SCSS">
    <bundle>web.assets_frontend</bundle>
    <path>website/static/src/snippets/s_button/000.scss</path>
</asset>

<!-- JS Asset -->
<asset id="website.s_button_000_js" name="Button JS">
    <bundle>web.assets_frontend</bundle>
    <path>website/static/src/snippets/s_button/000.js</path>
</asset>
```

Các phần:
- `id`: Mã định danh asset (formato: website.s_<name>_<version>_<type>)
- `name`: Tên mô tả
- `bundle`: web.assets_frontend (assets cho frontend)
- `path`: Đường dẫn tương đối từ thư mục module

---

## 🎨 <a name="ví-dụ-banner"></a>2. Ví Dụ Chi Tiết: Banner Snippet

### File XML: `s_banner.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

<!-- ========================================
     TEMPLATE CHÍNH - CẤU TRÚC HTML BANNER
     ======================================== -->
<template id="s_banner" name="Banner">
    <!-- 
    Khối banner với:
    - Grid layout
    - Hình ảnh
    - Text/CTA
    - Blockquote
    -->
    <section class="s_banner pt96 pb96">
        <div class="container">
            <div class="row o_grid_mode" data-row-count="10">
                
                <!-- Hộp chứa tiêu đề -->
                <div class="o_grid_item g-col-lg-4 g-height-10 col-lg-4" 
                     data-name="Box" 
                     style="z-index: 1; grid-area: 1 / 1 / 11 / 5;">
                    
                    <h1 class="display-3">
                        Unleash your <strong>potential.</strong>
                    </h1>
                    
                    <p class="lead">
                        This is a simple hero unit, a simple jumbotron-style 
                        component for calling extra attention to featured 
                        content or information.
                    </p>
                    
                    <p>
                        <a t-att-href="cta_btn_href" class="btn btn-lg btn-primary">
                            Start Now <span class="fa fa-angle-right ms-2"/>
                        </a>
                    </p>
                </div>
                
                <!-- Hộp chứa hình ảnh 1 -->
                <div class="o_grid_item o_grid_item_image g-col-lg-4 g-height-10 
                            col-lg-4 d-lg-block d-none o_snippet_mobile_invisible" 
                     style="z-index: 2; grid-area: 1 / 8 / 11 / 12;">
                    
                    <img class="img img-fluid mx-auto rounded" 
                         src="/web/image/website.s_banner_default_image_2" 
                         alt=""/>
                </div>
                
                <!-- Hộp chứa hình ảnh 2 nhỏ hơn -->
                <div class="o_grid_item o_grid_item_image g-col-lg-2 g-height-5 
                            col-lg-2 d-lg-block d-none o_snippet_mobile_invisible" 
                     style="z-index: 3; grid-area: 2 / 11 / 7 / 13;">
                    
                    <img class="img img-fluid mx-auto rounded" 
                         src="/web/image/website.s_banner_default_image_3" 
                         alt=""/>
                </div>
                
                <!-- Hộp chứa blockquote (quote) -->
                <div class="o_grid_item g-col-lg-5 g-height-4 col-lg-5" 
                     style="z-index: 4; grid-area: 6 / 6 / 10 / 11;">
                    
                    <blockquote class="s_blockquote" data-snippet="s_blockquote">
                        <p>"Write a quote here from one of your customers."</p>
                        <div class="s_blockquote_infos">
                            <img src="/web/image/website.s_blockquote_default_image" 
                                 class="s_blockquote_avatar img rounded-circle" 
                                 alt=""/>
                            <div class="s_blockquote_author">
                                <strong>Paul Dawson</strong><br/>
                                <span>CEO of MyCompany</span>
                            </div>
                        </div>
                    </blockquote>
                </div>
                
            </div>
        </div>
    </section>
</template>

</odoo>
```

### Giải Thích Chi Tiết

#### Cấu Trúc CSS Classes
```
s_banner          = Tên snippet, dùng để định dạng/định danh
pt96 pb96         = Padding top 96px, padding bottom 96px
container         = Bootstrap container (full-width responsive)
row               = Bootstrap row
o_grid_mode       = Enable grid layout mode trong editor
o_grid_item       = Item trong grid (có thể resize)
d-lg-block        = Display block on large screens
d-none            = Display none (ẩn)
o_snippet_mobile_invisible = Ẩn trên mobile
display-3         = Tiêu đề rất lớn (Bootstrap)
lead              = Đoạn text nổi bật (Bootstrap)
btn btn-lg btn-primary = Nút primary kích thước lớn
```

#### Grid Layout
```
data-row-count="10"  = 10 hàng trong grid
grid-area: 1 / 1 / 11 / 5  = Từ (row 1, col 1) đến (row 11, col 5)
                             = Chiếm 4 cột trong 12 cột tổng
```

---

## 🎠 <a name="ví-dụ-carousel"></a>3. Ví Dụ Chi Tiết: Carousel Snippet

### File XML: `s_carousel.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

<template id="s_carousel" name="Carousel">
    <!-- 
    Carousel với:
    - Tự động chuyển slides
    - Nội dung có thể tùy chỉnh
    - Bootstrap Carousel component
    -->
    
    <section class="s_carousel_wrapper p-0" data-vxml="001" data-vcss="001">
        
        <!-- Tạo ID duy nhất để tránh xung đột khi có nhiều carousel -->
        <t t-set="uniq" t-value="datetime.datetime.now().microsecond"/>
        
        <!-- Bootstrap Carousel -->
        <div t-attf-id="myCarousel{{uniq}}" 
             class="s_carousel s_carousel_default carousel slide" 
             data-bs-ride="true" 
             data-bs-interval="10000">
            
            <!-- ▶ NỘI DUNG CÁC SLIDE -->
            <div class="carousel-inner">
                
                <!-- SLIDE 1 -->
                <div class="carousel-item active oe_img_bg o_bg_img_center 
                            o_cc o_cc5 pt152 pb152" 
                     style="background-image: url('/web/image/website.s_carousel_default_image_1');" 
                     data-name="Slide">
                    
                    <!-- Lớp phủ bóng -->
                    <div class="o_we_bg_filter bg-black-25"/>
                    
                    <!-- Nội dung slide -->
                    <div class="container oe_unremovable">
                        <div class="row">
                            <div class="carousel-content col-lg-6">
                                <h2 class="display-3-fs">Slide Title</h2>
                                <p class="lead">
                                    Use this snippet to presents your content 
                                    in a slideshow-like format.
                                </p>
                                <p>
                                    <a href="/contactus" class="btn btn-lg btn-primary">
                                        Contact us
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- SLIDE 2 -->
                <div class="carousel-item oe_img_bg o_bg_img_center 
                            pt96 pb96" 
                     style="background-image: url('/web/image/website.s_carousel_default_image_2');" 
                     data-name="Slide">
                    
                    <div class="container oe_unremovable">
                        <div class="row">
                            <div class="carousel-content col-lg-8 offset-lg-2 
                                        text-center pt48 pb40">
                                <h2 class="display-3-fs">Clever Slogan</h2>
                                <div class="s_hr pt8 pb24" 
                                     data-snippet="s_hr" 
                                     data-name="Separator">
                                    <hr class="w-25 mx-auto"/>
                                </div>
                                <p class="lead">
                                    Storytelling is powerful.<br/> 
                                    It draws readers in and engages them.
                                </p>
                                <p>
                                    <a href="/" class="btn btn-primary">
                                        Start your journey
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- SLIDE 3 -->
                <div class="carousel-item oe_img_bg o_bg_img_center 
                            pt128 pb128 o_cc o_cc5" 
                     style="background-image: url('/web/image/website.s_carousel_default_image_3');" 
                     data-name="Slide">
                    
                    <div class="container oe_unremovable">
                        <div class="row">
                            <div class="carousel-content col-lg-6 offset-lg-6 pb24 pt24">
                                <h3>Edit this title</h3>
                                <h6>Good writing is simple, but not simplistic.</h6>
                                <p class="lead">
                                    Good copy starts with understanding how your product 
                                    or service helps your customers.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ▶ NÚT ĐIỀU KHIỂN SLIDES -->
            <button class="carousel-control-prev o_not_editable" 
                    contenteditable="false" 
                    t-attf-data-bs-target="#myCarousel{{uniq}}" 
                    data-bs-slide="prev" 
                    aria-label="Previous" 
                    title="Previous">
                <span class="carousel-control-prev-icon" aria-hidden="true"/>
                <span class="visually-hidden">Previous</span>
            </button>
            
            <button class="carousel-control-next o_not_editable" 
                    contenteditable="false" 
                    t-attf-data-bs-target="#myCarousel{{uniq}}" 
                    data-bs-slide="next" 
                    aria-label="Next" 
                    title="Next">
                <span class="carousel-control-next-icon" aria-hidden="true"/>
                <span class="visually-hidden">Next</span>
            </button>
            
            <!-- ▶ INDICATORS (DẤU CHỈ SLIDES) -->
            <div class="carousel-indicators o_not_editable">
                <button type="button" 
                        t-attf-data-bs-target="#myCarousel{{uniq}}" 
                        data-bs-slide-to="0" 
                        class="active" 
                        aria-label="Carousel indicator"/>
                <button type="button" 
                        t-attf-data-bs-target="#myCarousel{{uniq}}" 
                        data-bs-slide-to="1" 
                        aria-label="Carousel indicator"/>
                <button type="button" 
                        t-attf-data-bs-target="#myCarousel{{uniq}}" 
                        data-bs-slide-to="2" 
                        aria-label="Carousel indicator"/>
            </div>
        </div>
    </section>
</template>

<!-- ========================================
     CSS & JS ASSETS
     ======================================== -->

<asset id="website.s_carousel_001_scss" name="Carousel 001 SCSS">
    <bundle>web.assets_frontend</bundle>
    <path>website/static/src/snippets/s_carousel/001.scss</path>
</asset>

</odoo>
```

### Các Điểm Quan Trọng

#### Tạo ID Duy Nhất
```xml
<t t-set="uniq" t-value="datetime.datetime.now().microsecond"/>
<!-- Tạo số microsecond hiện tại, ví dụ: 123456 -->

<!-- Sử dụng: -->
<div t-attf-id="myCarousel{{uniq}}">
<!-- Kết quả: <div id="myCarousel123456"> -->
```

#### Bootstrap Carousel Attributes
```xml
data-bs-ride="true"        = Tự động start carousel
data-bs-interval="10000"   = Chuyển slide mỗi 10 giây (10000ms)
data-bs-slide="prev|next"  = Hướng chuyển slide
```

#### Classes Đặc Biệt
```
o_not_editable         = Button không thể edit
contenteditable="false" = Ngăn Firefox coi là editable
oe_unremovable         = Container không thể xóa
oe_img_bg              = Dùng ảnh làm background
o_bg_img_center        = Center background image
```

---

## ⚠️ <a name="ví-dụ-alert"></a>4. Ví Dụ Chi Tiết: Alert Snippet Với Options

### File XML: `s_alert.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

<!-- ========================================
     TEMPLATE CHÍNH
     ======================================== -->
<template id="s_alert" name="Alert">
    <!-- 
    Thông báo/cảnh báo có thể tuỳ chỉnh về:
    - Loại (primary, info, success, warning, danger)
    - Kích thước (sm, md, lg)
    - Màu sắc
    -->
    
    <div class="s_alert s_alert_md alert alert-info w-100 clearfix">
        <!-- Icon (tuỳ chỉnh được) -->
        <i class="fa fa-2x fa-info-circle s_alert_icon"/>
        
        <!-- Nội dung -->
        <div class="s_alert_content">
            <p>
                Explain the benefits you offer. 
                Don't write about products or services here, write about solutions.
            </p>
        </div>
    </div>
</template>

<!-- ========================================
     TEMPLATE OPTIONS - TUỲ CHỈNH TRONG EDITOR
     ======================================== -->
<template id="s_alert_options" inherit_id="website.snippet_options">
    
    <!-- Phần 1: Chọn loại alert -->
    <xpath expr="//div[@id='so_width']" position="before">
        
        <!-- data-selector: Chọn element nào -->
        <!-- data-js="Alert": CÓ JavaScript class handler (tuỳ chọn) -->
        <div data-selector=".s_alert" data-js="Alert">
            
            <!-- We-select: Dropdown lựa chọn -->
            <we-select string="Type" 
                      data-apply-to=".fa.s_alert_icon" 
                      data-trigger="alert_colorpicker_opt">
                
                <!-- Nút lựa chọn 1 -->
                <we-button data-select-class="fa-user-circle" 
                          data-trigger-value="primary">
                    Primary
                </we-button>
                
                <!-- Nút lựa chọn 2 -->
                <we-button data-select-class="fa-user-circle-o" 
                          data-trigger-value="secondary">
                    Secondary
                </we-button>
                
                <!-- Nút lựa chọn 3 -->
                <we-button data-select-class="fa-info-circle" 
                          data-trigger-value="info">
                    Info
                </we-button>
                
                <!-- Nút lựa chọn 4 -->
                <we-button data-select-class="fa-check-circle" 
                          data-trigger-value="success">
                    Success
                </we-button>
                
                <!-- Nút lựa chọn 5 -->
                <we-button data-select-class="fa-exclamation-triangle" 
                          data-trigger-value="warning">
                    Warning
                </we-button>
                
                <!-- Nút lựa chọn 6 -->
                <we-button data-select-class="fa-exclamation-circle" 
                          data-trigger-value="danger">
                    Danger
                </we-button>
            </we-select>
        </div>
    </xpath>
    
    <!-- Phần 2: Chọn kích thước & màu -->
    <!-- position="after" = Thêm sau div[@id='so_width'] -->
    <xpath expr="//div[@id='so_width']" position="after">
        
        <div data-selector=".s_alert">
            
            <!-- We-select: Kích thước -->
            <we-select string="Size">
                <we-button data-select-class="s_alert_sm">Small</we-button>
                <we-button data-select-class="s_alert_md">Medium</we-button>
                <we-button data-select-class="s_alert_lg">Large</we-button>
            </we-select>
            
            <!-- We-colorpicker: Chọn màu -->
            <we-colorpicker string="Color" 
                           data-name="alert_colorpicker_opt"
                           data-select-style="true"
                           data-css-property="background-color"
                           data-color-prefix="alert-"/>
        </div>
    </xpath>
</template>

<!-- ========================================
     CSS ASSETS
     ======================================== -->
<asset id="website.s_alert_000_scss" name="Alert 000 SCSS">
    <bundle>web.assets_frontend</bundle>
    <path>website/static/src/snippets/s_alert/000.scss</path>
</asset>

</odoo>
```

### File CSS: `website/static/src/snippets/s_alert/000.scss`

```scss
// Alert Snippet Styling

.s_alert {
    display: flex;
    gap: 1.5rem;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    
    // Icon styling
    .s_alert_icon {
        flex-shrink: 0;
        min-width: 2.5rem;
        text-align: center;
    }
    
    // Content styling
    .s_alert_content {
        flex: 1;
        text-align: left;
        margin: 0;
        
        p {
            margin: 0;
            
            &:not(:last-child) {
                margin-bottom: 0.5rem;
            }
        }
    }
}

// Size variants
.s_alert_sm {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    
    .s_alert_icon {
        font-size: 1.25rem;
        width: 1.5rem;
    }
}

.s_alert_md {
    padding: 1rem 1.5rem;
    font-size: 1rem;
}

.s_alert_lg {
    padding: 1.5rem 2rem;
    font-size: 1.125rem;
    
    .s_alert_icon {
        font-size: 2.5rem;
        width: 3rem;
    }
}

// Alert type variants (Bootstrap alert colors)
.alert-primary {
    background-color: #e7f3ff;
    color: #004085;
    border: 1px solid #b3d9ff;
}

.alert-info {
    background-color: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
}

.alert-success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.alert-warning {
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
}

.alert-danger {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}
```

### Giải Thích Options

#### we-select Attributes
```xml
<we-select string="Type" 
          data-apply-to=".fa.s_alert_icon"
          data-trigger="alert_colorpicker_opt">
```

- `string`: Nhãn hiển thị trong editor
- `data-apply-to`: Chỉ selector nào sẽ nhận class (khác với data-selector)
- `data-trigger`: Trigger tên trigger khác (ở đây là colorpicker)

#### we-button Attributes
```xml
<we-button data-select-class="fa-info-circle" 
          data-trigger-value="info">
    Info
</we-button>
```

- `data-select-class`: Class CSS sẽ được thêm/xóa
- `data-trigger-value`: Giá trị trigger gửi tới handler khác

#### we-colorpicker Attributes
```xml
<we-colorpicker string="Color" 
               data-select-style="true"
               data-css-property="background-color"
               data-color-prefix="alert-"/>
```

- `data-select-style="true"`: Sử dụng inline style
- `data-css-property`: Thuộc tính CSS (background-color, color, etc.)
- `data-color-prefix`: Prefix của class color (alert-primary, alert-info, etc.)

---

## 🔄 <a name="ví-dụ-dynamic"></a>5. Ví Dụ Chi Tiết: Dynamic Snippet (Lấy Dữ Liệu Từ Database)

### File XML: `s_dynamic_snippet.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

<!-- ========================================
     TEMPLATE WRAPPER - Container
     ======================================== -->
<template id="website.s_dynamic_snippet_template">
    <section t-attf-class="#{snippet_name} pt32 pb32" 
             t-att-data-snippet="snippet_name"
             t-att-data-custom-template-data="custom_template_data or '{}'">
        <div class="container">
            <div class="row s_nb_column_fixed">
                
                <!-- Tiêu đề (không thể xóa/di chuyển) -->
                <section class="s_dynamic_snippet_title oe_unremovable oe_unmovable 
                               d-flex flex-column flex-md-row justify-content-between 
                               mb-lg-0 pb-3 pb-md-0">
                    <div>
                        <h4>Our latest content</h4>
                        <p class="lead">Check out what's new in our company !</p>
                    </div>
                    <div>
                        <a title="See All" class="s_dynamic_snippet_main_page_url d-none" 
                           href="#">
                            See all <i class="fa fa-long-arrow-right ms-2"/>
                        </a>
                    </div>
                </section>
                
                <!-- Nội dung động (không thể edit) -->
                <section class="s_dynamic_snippet_content oe_unremovable oe_unmovable 
                               o_not_editable col">
                    
                    <!-- Warning nếu chưa cấu hình -->
                    <div class="css_non_editable_mode_hidden">
                        <div class="missing_option_warning alert alert-info 
                                    fade show d-none d-print-none rounded-0">
                            Your Dynamic Snippet will be displayed here... 
                            This message is displayed because you did not 
                            provide both a filter and a template to use.
                        </div>
                    </div>
                    
                    <!-- Template động sẽ được insert ở đây -->
                    <div class="dynamic_snippet_template">
                        <t t-out="0"/>
                    </div>
                </section>
            </div>
        </div>
    </section>
</template>

<!-- ========================================
     TEMPLATE CHÍNH - S_DYNAMIC_SNIPPET
     ======================================== -->
<template id="s_dynamic_snippet" name="Dynamic Snippet">
    <!-- Gọi template wrapper với các biến -->
    <t t-call="website.s_dynamic_snippet_template">
        <t t-set="snippet_name" t-value="'s_dynamic_snippet'"/>
    </t>
</template>

<!-- ========================================
     TEMPLATE OPTIONS - CẤUHINH OPTIONS
     ======================================== -->
<template id="website.s_dynamic_snippet_options_template">
    <!-- 
    Options cho dynamic snippet:
    - Lựa chọn filter (lấy dữ liệu từ model nào)
    - Lựa chọn template (hiển thị dữ liệu như thế nào)
    - Số lượng bản ghi
    -->
    
    <!-- Data selector và JS handler -->
    <div t-attf-data-js="#{snippet_name}" 
         t-attf-data-selector="#{snippet_selector}" 
         data-no-preview="true">
        
        <!-- Chọn filter (model/record) -->
        <we-select string="Filter" 
                  data-name="filter_opt" 
                  data-attribute-name="filterId" 
                  data-no-preview="true">
            <!-- Options được add bằng Python/JS -->
        </we-select>
        
        <!-- Chọn template hiển thị -->
        <we-select string="Template" 
                  data-name="template_opt" 
                  data-attribute-name="templateKey" 
                  data-no-preview="true">
            <!-- Options được add bằng Python/JS -->
        </we-select>
        
        <!-- Chọn số lượng bản ghi -->
        <we-select string="Fetched Elements" 
                  data-name="number_of_records_opt" 
                  data-attribute-name="numberOfRecords" 
                  data-no-preview="true">
            <!-- Tạo buttons từ 1 đến 16 -->
            <we-button t-foreach="range(1, 17)" 
                      t-as="value" 
                      t-att-data-select-data-attribute="value" 
                      t-esc="value"/>
        </we-select>
    </div>
    
    <!-- Options cho section title -->
    <div data-no-preview="true" t-attf-data-selector="#{snippet_selector}" 
         data-target=".s_dynamic_snippet_title">
        
        <!-- Chọn vị trí title -->
        <we-button-group string="Section Title">
            <we-button data-select-class="justify-content-between" 
                      title="Top">
                Top
            </we-button>
            <we-button data-select-class="s_dynamic_snippet_title_aside col-lg-3 
                                         justify-content-between flex-lg-column 
                                         justify-content-lg-start" 
                      title="Left">
                Left
            </we-button>
            <we-button data-select-class="d-none" title="No title">
                None
            </we-button>
        </we-button-group>
    </div>
</template>

<!-- ========================================
     OPTIONS REGISTER
     ======================================== -->
<template id="s_dynamic_snippet_options" inherit_id="website.snippet_options">
    <xpath expr="." position="inside">
        <t t-call="website.s_dynamic_snippet_options_template">
            <t t-set="snippet_name" t-value="'dynamic_snippet'"/>
            <t t-set="snippet_selector" t-value="'.s_dynamic_snippet'"/>
        </t>
    </xpath>
</template>

<!-- ========================================
     ASSETS
     ======================================== -->

<!-- CSS Asset -->
<asset id="website.s_dynamic_snippet_000_scss" 
       name="Dynamic snippet 000 SCSS">
    <bundle>web.assets_frontend</bundle>
    <path>website/static/src/snippets/s_dynamic_snippet/000.scss</path>
</asset>

<!-- JavaScript Asset -->
<asset id="website.s_dynamic_snippet_000_js" 
       name="Dynamic snippet 000 JS">
    <bundle>web.assets_frontend</bundle>
    <path>website/static/src/snippets/s_dynamic_snippet/000.js</path>
</asset>

<!-- XML Template Asset (cho dynamic content) -->
<asset id="website.s_dynamic_snippet_000_xml" 
       name="Dynamic snippet 000 XML">
    <bundle>web.assets_frontend</bundle>
    <path>website/static/src/snippets/s_dynamic_snippet/000.xml</path>
</asset>

</odoo>
```

### File JavaScript: `website/static/src/snippets/s_dynamic_snippet/000.js`

```javascript
odoo.define('website.snippet.option.DynamicSnippet', function(require) {
    'use strict';
    
    var options = require('web_editor.snippets.options');
    var publicWidget = require('web.public.widget');
    var rpc = require('web.rpc');
    
    // ▶ OPTIONS HANDLER (cho editor)
    options.registry.DynamicSnippet = options.Class.extend({
        selector: '.s_dynamic_snippet',
        
        // Khi snippet được click trong editor
        start: function() {
            var self = this;
            this._loadFilter();
            this._loadTemplate();
            return this._super.apply(this, arguments);
        },
        
        // Load available filters
        _loadFilter: function() {
            // Gửi RPC tới backend để lấy danh sách filters
            rpc.query({
                model: 'website.snippet.filter',
                method: 'get_filters',
                args: [],
            }).then(function(filters) {
                // Update dropdown options
                // filters là danh sách filter
            });
        },
        
        // Load available templates
        _loadTemplate: function() {
            var filterId = this.$el.attr('data-filterId');
            rpc.query({
                model: 'website.snippet.filter',
                method: 'get_templates',
                args: [filterId],
            }).then(function(templates) {
                // Update dropdown options
            });
        },
    });
    
    // ▶ WIDGET PUBLIC (cho frontend)
    publicWidget.registry.DynamicSnippet = publicWidget.Widget.extend({
        selector: '.s_dynamic_snippet',
        disableInEditMode: false,
        
        start: function() {
            this._fetchData();
        },
        
        // Lấy dữ liệu thực
        _fetchData: function() {
            var self = this;
            var filterId = this.$el.attr('data-filterId');
            var templateKey = this.$el.attr('data-templateKey');
            var numberOfRecords = this.$el.attr('data-numberOfRecords') || 3;
            
            rpc.query({
                model: 'website.snippet.filter',
                method: 'fetch_data',
                args: [{
                    filterId: filterId,
                    templateKey: templateKey,
                    numberOfRecords: numberOfRecords,
                }],
            }).then(function(html) {
                // Insert HTML vào content area
                self.$el.find('.dynamic_snippet_template').html(html);
            });
        },
    });
});
```

---

## 🗂️ <a name="hệ-thống-file"></a>6. Hệ Thống File Structure Chi Tiết

### Cơ Cấu Thư Mục Đầy Đủ

```
website/
├── __manifest__.py                          ← Khai báo module
│
├── views/
│   ├── snippets/
│   │   ├── snippets.xml                    ← File đăng ký chính
│   │   ├── s_button.xml                    ← XML template
│   │   ├── s_carousel.xml
│   │   ├── s_alert.xml
│   │   ├── s_banner.xml
│   │   ├── s_text_block.xml
│   │   ├── s_dynamic_snippet.xml
│   │   └── ... (100+ file khác)
│   │
│   └── website_views.xml                   ← Frontend views
│
├── static/
│   ├── src/
│   │   ├── snippets/
│   │   │   ├── s_button/
│   │   │   │   └── 000.scss
│   │   │   │
│   │   │   ├── s_carousel/
│   │   │   │   ├── 000.scss
│   │   │   │   ├── 001.scss
│   │   │   │   └── 000.js
│   │   │   │
│   │   │   ├── s_alert/
│   │   │   │   └── 000.scss
│   │   │   │
│   │   │   ├── s_dynamic_snippet/
│   │   │   │   ├── 000.scss
│   │   │   │   ├── 000.js
│   │   │   │   └── 000.xml
│   │   │   │
│   │   │   └── ... (thư mục khác)
│   │   │
│   │   ├── img/
│   │   │   └── snippets_thumbs/
│   │   │       ├── s_button.svg             ← Thumbnail
│   │   │       ├── s_carousel.svg
│   │   │       └── ... (256x192px)
│   │   │
│   │   ├── js/
│   │   │   └── snippets/
│   │   │       └── ... (JS files)
│   │   │
│   │   └── scss/
│   │       └── ... (SCSS files)
│   │
│   └── description/
│       └── ... (static files khác)
│
├── models/                                  ← Backend models
│   ├── website.py
│   ├── website_page.py
│   └── website_snippet_filter.py           ← Cho dynamic snippets
│
└── controllers/                             ← Controllers
```

### File Manifest Chi Tiết

```python
# __manifest__.py

{
    'name': 'Website',
    'category': 'Website/Website',
    'sequence': 20,
    'version': '1.0',
    
    # Dependencies
    'depends': [
        'digest',
        'web',
        'web_editor',        ← Cần có web_editor
        'html_editor',
        'http_routing',
        'portal',
    ],
    
    # External dependencies
    'external_dependencies': {
        'python': ['geoip2'],
    },
    
    # Data files (order quan trọng)
    'data': [
        # Security & models
        'security/website_security.xml',
        'security/ir.model.access.csv',
        
        # Data
        'data/image_library.xml',
        'data/ir_asset.xml',
        
        # Views
        'views/website_templates.xml',
        
        # Snippets (snippets.xml phải đầu tiên)
        'views/snippets/snippets.xml',
        
        # Từng snippet file
        'views/snippets/s_framed_intro.xml',
        'views/snippets/s_title.xml',
        'views/snippets/s_cover.xml',
        'views/snippets/s_carousel.xml',
        'views/snippets/s_alert.xml',
        # ... (100+ files)
    ],
    
    'installable': True,
}
```

---

## 🔄 <a name="quá-trình-render"></a>7. Quá Trình Render Snippet Chi Tiết

### Bước 1: Module Initialization
```
1.1 Odoo khởi động module website
    └─ Load __manifest__.py
       └─ Đọc danh sách files trong 'data'
       
1.2 Load XML views
    └─ Parse snippets.xml
       └─ Đọc tất cả <t t-snippet="...">
       
1.3 Load Assets
    └─ Load CSS từ web.assets_frontend
    └─ Load JS từ web.assets_frontend
```

### Bước 2: Snippet Picker Initialization
```
2.1 User vào website editor
    ├─ Frontend templates được load
    └─ Snippet buttons được tạo
    
2.2 Tạo Snippet Picker UI
    ├─ Tạo tab nhóm (intro, columns, content, etc.)
    ├─ Lấy thumbnail cho mỗi snippet
    └─ Tạo search index (từ keywords)
```

### Bước 3: Drag & Drop
```
3.1 User kéo snippet vào trang
    ├─ JavaScript xử lý drag event
    └─ Tạo instance HTML của snippet
    
3.2 Insert vào DOM
    ├─ Parser HTML template
    ├─ Khởi tạo các asset CSS/JS
    └─ Gọi publicWidget.start() cho snippet
```

### Bước 4: Options Panel
```
4.1 User click snippet đã insert
    ├─ Editor tìm options template
    └─ Hiển thị options panel
    
4.2 User tùy chỉnh
    ├─ Click button → class thêm/xóa
    ├─ Color picker → inline style
    └─ Input → attribute data-* thay đổi
```

### Bước 5: Save
```
5.1 User click Save
    ├─ Serialize HTML thành string
    └─ Gửi tới backend
    
5.2 Backend xử lý
    ├─ Validate HTML
    ├─ Lưu vào database
    └─ Invalidate cache
```

---

## 📊 Diagram Quy Trình

```
┌─────────────────────────────────────────────────┐
│  HTML Template (s_carousel.xml)                 │
│  - Template đơn, tĩnh                          │
│  - Có ID, class, attributes                    │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  Snippet Picker                                 │
│  - Hiển thị thumbnail                          │
│  - Keywords search                             │
│  - Drag-drop ready                             │
└──────────────┬──────────────────────────────────┘
               │ User kéo thả
               ▼
┌─────────────────────────────────────────────────┐
│  Insert vào DOM                                │
│  - Clone HTML template                         │
│  - Tạo instance mới                            │
│  - Initialize JavaScript                       │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  Options Panel  (s_carousel_options.xml)        │
│  - we-select buttons                           │
│  - we-colorpicker                              │
│  - we-input fields                             │
└──────────────┬──────────────────────────────────┘
               │ User tùy chỉnh
               ▼
┌─────────────────────────────────────────────────┐
│  DOM Updated                                    │
│  - Class thêm/xóa                              │
│  - Style inline thay đổi                       │
│  - Attributes update                           │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  Save                                           │
│  - Serialize HTML                              │
│  - POST tới backend                            │
│  - Lưu database                                │
└─────────────────────────────────────────────────┘
```

---

**Tài liệu được cập nhật**: Tháng 4, 2026

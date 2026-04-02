# HƯỚNG DẪN THỰC HÀNH - SNIPPETS: TROUBLESHOOTING & PATTERNS

## 📋 Mục Lục
1. [Các Vấn Đề Thường Gặp](#vấn-đề-thường-gặp)
2. [Patterns Phổ Biến](#patterns)
3. [Performance Tips](#performance)
4. [Testing & Debugging](#testing)
5. [Tạo Snippet Custom](#tạo-custom)

---

## 🐛 <a name="vấn-đề-thường-gặp"></a>1. Các Vấn Đề Thường Gặp & Cách Khắc Phục

### Vấn Đề 1: Snippet Không Hiển Thị Trong Picker

**Triệu Chứng**: Tạo snippet mới nhưng không thấy nó trong editor.

**Nguyên Nhân Có Thể**:
```
❌ File XML chưa được thêm vào __manifest__.py
❌ Snippet chưa được đăng ký trong snippets.xml
❌ t-snippet attribute không khớp với template id
❌ Module chưa được cập nhật/restart
```

**Giải Pháp Từng Bước**:

```python
# Bước 1: Kiểm tra __manifest__.py
'data': [
    'views/snippets/snippets.xml',        # ← Phải có này
    'views/snippets/s_my_snippet.xml',    # ← Thêm file mới
]

# Bước 2: Kiểm tra snippets.xml
<snippet_structure>
    <t t-snippet="website.s_my_snippet"     # ← Phải trùng id
       string="My Snippet" 
       group="content">                     # ← Grouping
        <keywords>my, snippet</keywords>
    </t>
</snippet_structure>

# Bước 3: Kiểm tra XML file (s_my_snippet.xml)
<template id="s_my_snippet" name="My Snippet">  # ← ID phải đúng
    <div class="s_my_snippet">...</div>
</template>

# Bước 4: Restart Odoo
# Terminal: Ctrl + C
# Terminal: python odoo-bin -d <database> -u website
```

### Vấn Đề 2: CSS/JS Không Load

**Triệu Chứng**: Snippet hiển thị nhưng không có styling hoặc JavaScript không hoạt động.

**Nguyên Nhân Có Thể**:
```
❌ Asset không được đăng ký trong XML
❌ Path tới file CSS/JS sai
❌ Asset bundle sai (nên là web.assets_frontend)
❌ File CSS/JS không tồn tại thực sự
❌ Browser cache (F5 hoặc Ctrl+Shift+Delete)
```

**Giải Pháp**:

```xml
<!-- ĐÚNG -->
<asset id="website.s_my_snippet_000_scss" name="My Snippet SCSS">
    <bundle>web.assets_frontend</bundle>
    <path>website/static/src/snippets/s_my_snippet/000.scss</path>
</asset>

<!-- SAI - Path không đúng -->
<asset id="website.s_my_snippet_000_scss" name="My Snippet SCSS">
    <bundle>web.assets_frontend</bundle>
    <path>static/s_my_snippet/000.scss</path>  <!-- ← Path không đầy đủ -->
</asset>

<!-- SAI - Bundle sai -->
<asset id="website.s_my_snippet_000_scss" name="My Snippet SCSS">
    <bundle>web.assets_backend</bundle>  <!-- ← Nên dùng frontend -->
    <path>website/static/src/snippets/s_my_snippet/000.scss</path>
</asset>
```

**Kiểm Tra Path**:
```
Cấu Trúc thực:
f:\BMS\Odoo\odoo\addons\website\static\src\snippets\s_my_snippet\000.scss

Path trong XML:
website/static/src/snippets/s_my_snippet/000.scss

Quy Tắc: Bắt đầu từ "website/" (module name)
```

**Debug trong Browser**:
```javascript
// F12 → Console
// Kiểm tra asset được load không
odoo.define.modules;

// Kiểm tra CSS được áp dụng không
document.querySelector('.s_my_snippet').computedStyle;

// Clear cache và reload
location.reload(true);
```

### Vấn Đề 3: Options Không Hoạt Động

**Triệu Chứng**: Options panel hiển thị nhưng khi click không có gì thay đổi.

**Nguyên Nhân**:
```
❌ data-selector không khớp với HTML element
❌ data-apply-to chỉ tới selector sai
❌ Class CSS không tồn tại hoặc lỗi CSS
❌ JavaScript handler không được load
```

**Ví Dụ Sửa Lỗi**:

```xml
<!-- HTML Snippet -->
<template id="s_button" name="Button">
    <a class="btn btn-primary" href="#">Button</a>  
    <!--   ↑ HTML hiện tại               -->
</template>

<!-- ❌ SAI - selector không khớp -->
<template id="s_button_options" inherit_id="website.snippet_options">
    <xpath expr="." position="inside">
        <div data-selector=".my-button">  <!-- ← Không có class "my-button" -->
            <we-select string="Style">
                <we-button data-select-class="btn-primary">Primary</we-button>
            </we-select>
        </div>
    </xpath>
</template>

<!-- ✅ ĐÚNG - selector khớp -->
<template id="s_button_options" inherit_id="website.snippet_options">
    <xpath expr="." position="inside">
        <div data-selector=".btn">  <!-- ← Khớp với HTML -->
            <we-select string="Style">
                <we-button data-select-class="btn-primary">Primary</we-button>
            </we-select>
        </div>
    </xpath>
</template>
```

**Kiểm Tra Selector**:
```javascript
// F12 → Console
// Kiểm tra element tồn tại hay không
document.querySelector('.btn');  // Nếu null = sai selector

// Kiểm tra class được apply không
var el = document.querySelector('.btn');
el.classList.add('btn-success');  // Manual test
```

### Vấn Đề 4: Snippet Không Editable Trên Mobile

**Triệu Chứng**: Snippet hoạt động trên desktop nhưng không edit được trên mobile.

**Nguyên Nhân**:
```
❌ CSS không responsive (hardcoded width, height)
❌ JavaScript dùng event không hỗ trợ touch
❌ Viewport meta tag sai
```

**Giải Pháp - Responsive CSS**:

```scss
/* ❌ SAI - Cứng nhắc */
.s_my_snippet {
    width: 1200px;           /* ← Fixed width */
    padding: 20px 30px;
    text-align: center;
}

.s_my_snippet .title {
    font-size: 32px;         /* ← Fixed size */
}

/* ✅ ĐÚNG - Responsive */
.s_my_snippet {
    width: 100%;             /* ← Flexible */
    max-width: 1200px;
    padding: 1.5rem 1rem;
    text-align: center;
    
    /* Mobile first */
    @media (min-width: 768px) {
        padding: 1.5rem 2rem;
    }
    
    @media (min-width: 1024px) {
        padding: 1.5rem 3rem;
    }
}

.s_my_snippet .title {
    font-size: clamp(1.5rem, 5vw, 2rem);  /* ← Fluid sizing */
}
```

---

## 🎯 <a name="patterns"></a>2. Patterns Phổ Biến

### Pattern 1: Hero Section (Banner)

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

<template id="s_hero_custom" name="Hero Custom">
    <!-- Hero section điển hình -->
    <section class="s_hero_custom py-5 py-lg-6"
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        
        <div class="container">
            <div class="row align-items-center min-vh-100">
                
                <!-- Cột trái: Text -->
                <div class="col-lg-6 text-white" data-name="Text">
                    <h1 class="display-4 fw-bold mb-4">
                        Tiêu đề Lớn
                    </h1>
                    <p class="lead mb-4">
                        Mô tả ngắn gọn về sản phẩm/dịch vụ
                    </p>
                    <p>
                        <a href="/contactus" class="btn btn-light btn-lg">
                            Liên Hệ Ngay
                        </a>
                    </p>
                </div>
                
                <!-- Cột phải: Hình ảnh -->
                <div class="col-lg-6 text-center" data-name="Image">
                    <img class="img-fluid rounded shadow" 
                         src="/web/image/website.hero_image" 
                         alt=""/>
                </div>
                
            </div>
        </div>
    </section>
</template>

<template id="s_hero_custom_options" inherit_id="website.snippet_options">
    <xpath expr="." position="inside">
        <div data-selector=".s_hero_custom">
            <!-- Chọn background color -->
            <we-colorpicker string="Background color"
                           data-select-style="true"
                           data-css-property="background-color"/>
        </div>
    </xpath>
</template>

<asset id="website.s_hero_custom_000_scss" name="Hero Custom SCSS">
    <bundle>web.assets_frontend</bundle>
    <path>website/static/src/snippets/s_hero_custom/000.scss</path>
</asset>

</odoo>
```

### Pattern 2: Card Grid

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

<template id="s_card_grid_custom" name="Card Grid Custom">
    <!-- Grid thẻ có thể mở rộng -->
    <section class="s_card_grid_custom py-5">
        <div class="container">
            <div class="row g-4">
                
                <!-- Card 1 -->
                <div class="col-12 col-md-6 col-lg-4" data-name="Card">
                    <div class="card h-100 shadow-sm hover:shadow-lg transition">
                        <img class="card-img-top" 
                             src="/web/image/website.card_1"
                             alt=""/>
                        <div class="card-body">
                            <h5 class="card-title">Card Title</h5>
                            <p class="card-text">
                                Card description goes here
                            </p>
                            <a href="#" class="btn btn-primary">Learn More</a>
                        </div>
                    </div>
                </div>
                
                <!-- Card 2 -->
                <div class="col-12 col-md-6 col-lg-4" data-name="Card">
                    <div class="card h-100 shadow-sm hover:shadow-lg transition">
                        <img class="card-img-top" 
                             src="/web/image/website.card_2"
                             alt=""/>
                        <div class="card-body">
                            <h5 class="card-title">Card Title</h5>
                            <p class="card-text">
                                Card description goes here
                            </p>
                            <a href="#" class="btn btn-primary">Learn More</a>
                        </div>
                    </div>
                </div>
                
                <!-- Card 3 -->
                <div class="col-12 col-md-6 col-lg-4" data-name="Card">
                    <div class="card h-100 shadow-sm hover:shadow-lg transition">
                        <img class="card-img-top" 
                             src="/web/image/website.card_3"
                             alt=""/>
                        <div class="card-body">
                            <h5 class="card-title">Card Title</h5>
                            <p class="card-text">
                                Card description goes here
                            </p>
                            <a href="#" class="btn btn-primary">Learn More</a>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    </section>
</template>

<asset id="website.s_card_grid_custom_000_scss" name="Card Grid SCSS">
    <bundle>web.assets_frontend</bundle>
    <path>website/static/src/snippets/s_card_grid_custom/000.scss</path>
</asset>

</odoo>
```

### Pattern 3: Feature List

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

<template id="s_feature_list" name="Feature List">
    <!-- Feature list với icon -->
    <section class="s_feature_list py-5">
        <div class="container">
            <div class="row">
                <div class="col-lg-8 offset-lg-2">
                    
                    <!-- Feature 1 -->
                    <div class="feature-item d-flex gap-4 mb-5" data-name="Feature">
                        <div class="feature-icon flex-shrink-0">
                            <i class="fa fa-3x fa-check text-primary"></i>
                        </div>
                        <div class="feature-content">
                            <h4>Feature Title</h4>
                            <p class="text-muted">
                                Description of the feature goes here
                            </p>
                        </div>
                    </div>
                    
                    <!-- Feature 2 -->
                    <div class="feature-item d-flex gap-4 mb-5" data-name="Feature">
                        <div class="feature-icon flex-shrink-0">
                            <i class="fa fa-3x fa-cog text-primary"></i>
                        </div>
                        <div class="feature-content">
                            <h4>Feature Title</h4>
                            <p class="text-muted">
                                Description of the feature goes here
                            </p>
                        </div>
                    </div>
                    
                    <!-- Feature 3 -->
                    <div class="feature-item d-flex gap-4" data-name="Feature">
                        <div class="feature-icon flex-shrink-0">
                            <i class="fa fa-3x fa-rocket text-primary"></i>
                        </div>
                        <div class="feature-content">
                            <h4>Feature Title</h4>
                            <p class="text-muted">
                                Description of the feature goes here
                            </p>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    </section>
</template>

</odoo>
```

---

## ⚡ <a name="performance"></a>3. Performance Tips

### Tip 1: Lazy Load Images

```xml
<!-- ❌ SAI - Load tất cả ở lần đầu -->
<img src="/web/image/website.large_image" alt=""/>

<!-- ✅ ĐÚNG - Lazy load -->
<img src="/web/image/website.large_image" 
     loading="lazy"
     alt=""/>

<!-- ✅ Hoặc dùng data attribute -->
<img data-src="/web/image/website.large_image" 
     alt=""
     class="lazyload"/>
```

### Tip 2: Optimize CSS Selectors

```scss
/* ❌ SAI - Quá cụ thể */
div.container > div.row > div.col-lg-4 > div.card {
    padding: 20px;
}

/* ✅ ĐÚNG - Đơn giản */
.card {
    padding: 20px;
}

/* Nếu cần scope: */
.s_card_grid_custom .card {
    padding: 20px;
}
```

### Tip 3: Minimize Reflows

```javascript
/* ❌ SAI - Nhiều reflows */
el.style.width = '100px';
el.style.padding = '10px';
el.style.margin = '5px';

/* ✅ ĐÚNG - Một reflow */
el.style.cssText = 'width: 100px; padding: 10px; margin: 5px;';

/* Hoặc thêm class */
el.classList.add('formatted');
```

### Tip 4: Use CSS Variables

```scss
/* Định nghĩa một lần */
:root {
    --color-primary: #667eea;
    --color-secondary: #764ba2;
    --spacing-unit: 1rem;
}

/* Sử dụng nhiều lần */
.s_button {
    background: var(--color-primary);
    padding: var(--spacing-unit);
}

.s_card {
    border-color: var(--color-secondary);
    margin: calc(var(--spacing-unit) * 2);
}
```

---

## 🧪 <a name="testing"></a>4. Testing & Debugging

### Debug Snippet Selector

```javascript
// F12 → Console

// 1. Kiểm tra element
var snippet = document.querySelector('.s_my_snippet');
console.log(snippet);  // Nếu null = sai selector

// 2. Kiểm tra element có trong DOM
var allSnippets = document.querySelectorAll('[data-snippet="s_my_snippet"]');
console.log(allSnippets.length);

// 3. Kiểm tra classes
console.log(snippet.classList);

// 4. Kiểm tra inline styles
console.log(snippet.style);

// 5. Manually apply class
snippet.classList.add('test-class');

// 6. Kiểm tra CSS computed
var computed = window.getComputedStyle(snippet);
console.log(computed.backgroundColor);
```

### Test Options

```javascript
// Kiểm tra options template được load
var options = document.querySelector('[data-selector=".s_my_snippet"]');
console.log(options);

// Simulate option click
var button = document.querySelector('[data-select-class="my-class"]');
button.click();

// Kiểm tra class được thêm
console.log(snippet.classList.contains('my-class'));
```

### Browser Developer Tools Shortcuts

| Shortcut | Chức năng |
|----------|----------|
| F12 | Mở DevTools |
| Ctrl+Shift+C | Element Inspector |
| Ctrl+Shift+K | Console |
| Ctrl+Shift+M | Mobile view |
| Ctrl+Shift+Del | Clear cache |

---

## 🛠️ <a name="tạo-custom"></a>5. Tạo Snippet Custom - Ví Dụ Hoàn Chỉnh

### Tạo "Pricing Table" Snippet

**Bước 1**: Tạo file XML (`s_pricing_table.xml`)

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

<template id="s_pricing_table" name="Pricing Table">
    <section class="s_pricing_table py-5">
        <div class="container">
            
            <!-- Header -->
            <div class="text-center mb-5">
                <h2 class="display-5 fw-bold mb-3">Our Pricing</h2>
                <p class="lead text-muted">
                    Simple, transparent pricing that scales with your business
                </p>
            </div>
            
            <!-- Pricing Cards -->
            <div class="row g-4">
                
                <!-- Starter Plan -->
                <div class="col-12 col-md-6 col-lg-4" data-name="Plan">
                    <div class="pricing-card bg-light p-5 rounded text-center">
                        <h3 class="h4 fw-bold mb-2">Starter</h3>
                        <div class="pricing-price mb-4">
                            <span class="display-6">$29</span>
                            <span class="text-muted">/month</span>
                        </div>
                        <ul class="list-unstyled mb-4 text-start">
                            <li class="mb-2">✓ Feature 1</li>
                            <li class="mb-2">✓ Feature 2</li>
                            <li class="mb-2">✓ Feature 3</li>
                        </ul>
                        <a href="#contact" class="btn btn-outline-primary w-100">
                            Get Started
                        </a>
                    </div>
                </div>
                
                <!-- Professional Plan (Highlight) -->
                <div class="col-12 col-md-6 col-lg-4" data-name="Plan">
                    <div class="pricing-card bg-primary text-white p-5 rounded 
                                text-center transform scale-105">
                        <span class="badge bg-warning text-dark mb-3">
                            Most Popular
                        </span>
                        <h3 class="h4 fw-bold mb-2">Professional</h3>
                        <div class="pricing-price mb-4">
                            <span class="display-6">$79</span>
                            <span>/month</span>
                        </div>
                        <ul class="list-unstyled mb-4 text-start">
                            <li class="mb-2">✓ Feature 1</li>
                            <li class="mb-2">✓ Feature 2</li>
                            <li class="mb-2">✓ Feature 3</li>
                            <li class="mb-2">✓ Feature 4</li>
                        </ul>
                        <a href="#contact" class="btn btn-light w-100">
                            Get Started
                        </a>
                    </div>
                </div>
                
                <!-- Enterprise Plan -->
                <div class="col-12 col-md-6 col-lg-4" data-name="Plan">
                    <div class="pricing-card bg-light p-5 rounded text-center">
                        <h3 class="h4 fw-bold mb-2">Enterprise</h3>
                        <div class="pricing-price mb-4">
                            <span class="display-6">Custom</span>
                        </div>
                        <ul class="list-unstyled mb-4 text-start">
                            <li class="mb-2">✓ All features</li>
                            <li class="mb-2">✓ Priority support</li>
                            <li class="mb-2">✓ Custom integration</li>
                            <li class="mb-2">✓ Dedicated account</li>
                        </ul>
                        <a href="/contact" class="btn btn-outline-primary w-100">
                            Contact Sales
                        </a>
                    </div>
                </div>
                
            </div>
            
        </div>
    </section>
</template>

<!-- Options -->
<template id="s_pricing_table_options" inherit_id="website.snippet_options">
    <xpath expr="." position="inside">
        <div data-selector=".s_pricing_table">
            <!-- Chọn layout -->
            <we-button-group string="Layout">
                <we-button data-select-class="" title="Grid">Grid</we-button>
                <we-button data-select-class="pricing-table-horizontal" 
                          title="Horizontal">Horizontal</we-button>
            </we-button-group>
            
            <!-- Chọn màu chủ đạo -->
            <we-colorpicker string="Primary Color"
                           data-select-style="true"
                           data-css-property="--color-primary"/>
        </div>
    </xpath>
</template>

<!-- Assets -->
<asset id="website.s_pricing_table_000_scss" name="Pricing Table SCSS">
    <bundle>web.assets_frontend</bundle>
    <path>website/static/src/snippets/s_pricing_table/000.scss</path>
</asset>

</odoo>
```

**Bước 2**: Tạo file CSS (`website/static/src/snippets/s_pricing_table/000.scss`)

```scss
.s_pricing_table {
    background: #f8f9fa;
    
    .pricing-card {
        transition: all 0.3s ease;
        border: 1px solid transparent;
        
        &:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
    }
    
    .pricing-price {
        font-size: 1.5rem;
        color: #667eea;
        
        span.display-6 {
            font-weight: 700;
        }
    }
    
    /* Highlight card */
    .bg-primary {
        box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
        
        .pricing-price {
            color: #fff;
        }
    }
}

/* Responsive */
@media (max-width: 768px) {
    .s_pricing_table .pricing-card {
        margin-bottom: 2rem;
    }
}
```

**Bước 3**: Đăng ký trong `__manifest__.py`

```python
'data': [
    'views/snippets/snippets.xml',
    'views/snippets/s_pricing_table.xml',  # ← Thêm
]
```

**Bước 4**: Đăng ký trong `snippets.xml`

```xml
<snippet_structure>
    <!-- ... -->
    <t t-snippet="website.s_pricing_table" 
       string="Pricing Table" 
       group="content">
        <keywords>pricing, table, plans, business, payment</keywords>
    </t>
</snippet_structure>
```

---

## 📋 Checklist Hoàn Thiện Snippet

```
CREATION:
☐ File XML tạo được
☐ Template id đặt đúng (s_<name>)
☐ HTML structure hoàn thiện
☐ Responsive trên mobile/tablet/desktop
☐ Semantic HTML (sử dụng đúng tags)

STYLING:
☐ CSS file tạo được
☐ Styles áp dụng đúng
☐ Không dùng colors hardcoded (dùng variables/classes)
☐ Hover/active states công nghệ

ASSETS:
☐ Asset CSS đăng ký
☐ Asset JS đăng ký (nếu có)
☐ Path đúng (website/static/src/snippets/s_<name>/...)
☐ File tồn tại thực sự trên disk

REGISTRATION:
☐ Thêm vào __manifest__.py
☐ Đăng ký trong snippets.xml
☐ t-snippet attribute khớp với id
☐ Group đúng (intro, columns, content, etc.)
☐ Keywords đầy đủ

TESTING:
☐ Module installed/updated
☐ Snippet hiện trong picker
☐ Kéo thả vào trang được
☐ HTML render đúng
☐ CSS apply đúng
☐ Options hoạt động (nếu có)

OPTIONS (Nếu Có):
☐ Template options tạo được
☐ inherit_id đúng
☐ data-selector khớp HTML
☐ we-buttons/we-colorpicker hoạt động
☐ Class áp dụng đúng khi click

OPTIMIZATION:
☐ Minimize inline styles
☐ CSS specificity bình thường
☐ Responsive classes (col-lg, col-md, etc.)
☐ Lazy load images
☐ No hardcoded dimensions

DOCUMENTATION:
☐ Code comments
☐ Explain complex parts
☐ Thumbnail image (256x192px)
☐ Demo content có ý nghĩa
```

---

**Tài liệu được cập nhật**: Tháng 4, 2026

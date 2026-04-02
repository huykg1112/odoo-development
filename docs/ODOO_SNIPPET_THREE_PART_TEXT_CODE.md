# SNIPPET "THREE PART TEXT" - PHÂN TÍCH CODE CHI TIẾT

## 📋 Mục Lục
1. [Cấu Trúc File XML](#xml)
2. [Cấu Trúc Tùy Chọn (Options)](#options)
3. [Cấu Trúc CSS](#css)
4. [Cấu Trúc JavaScript](#javascript)
5. [Tích Hợp Vào Module](#integration)

---

## 🏗️ <a name="xml"></a>1. Cấu Trúc File XML Chi Tiết

### File: `s_three_part_text.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- TEMPLATE CHÍNH -->
    <template id="s_three_part_text" name="Three Part Text">
        <!-- Container chính của snippet -->
        <div class="s_three_part_text" 
             data-part1-text="Edit this text"
             data-part2-text=" in the middle"
             data-part3-text=" and this text">
            
            <!-- Paragraph wrapper -->
            <p class="s_three_part_text_paragraph">
                <!-- Phần 1 -->
                <span class="s_three_part_text_part1" 
                      contenteditable="true"
                      data-name="Part 1 Text">
                    Edit this text
                </span>
                
                <!-- ... (Phần 2, 3) ... -->
            </p>
        </div>
    </template>
    
    <!-- TEMPLATE OPTIONS -->
    <template id="s_three_part_text_options" 
              inherit_id="website.snippet_options">
        <!-- Nội dung options -->
    </template>
    
    <!-- ASSETS -->
    <asset>CSS & JS được load ở đây</asset>
</odoo>
```

### Chi Tiết các Attributes

#### A. `data-part1-text`, `data-part2-text`, `data-part3-text`

**Mục Đích**: Lưu text content của từng phần

```xml
<!-- Lưu text content -->
<div class="s_three_part_text" 
     data-part1-text="Mục tiêu của chúng tôi là"
     data-part2-text=" cung cấp dịch vụ chất lượng"
     data-part3-text=" với giá cạnh tranh.">
</div>
```

**Tại Sao Cần?**
- Bảo toàn text khi HTML được serialize
- Dễ load lại text khi trang reload
- Tracing và debugging

#### B. `data-name`

**Mục Đích**: Nhãn cho editor, hiển thị trên UI

```xml
<span class="s_three_part_text_part1" 
      data-name="Part 1 Text">
    Edit this text
</span>
```

Khi bạn click vào snippet, editor sẽ hiển thị "Part 1 Text" dưới cursor.

#### C. `contenteditable="true"`

**Mục Đích**: Cho phép edit text trực tiếp trên trang

```xml
<span contenteditable="true">
    Bạn có thể edit text này!
</span>
```

- Bấm đôi chuột → Có thể nhập
- Bấm Ctrl+S hoặc Save → Text được lưu

---

## 🎨 <a name="options"></a>2. Cấu Trúc Tùy Chọn (Options) Chi Tiết

### A. Cấu Trúc Chung

```xml
<template id="s_three_part_text_options" 
          inherit_id="website.snippet_options">
    <xpath expr="." position="inside">
        
        <!-- ▶ OPTIONS CHO PHẦN 1 -->
        <div data-selector=".s_three_part_text" 
             data-js="ThreePartText"
             data-name="part1_options">
            
            <!-- Các component we-* -->
            
        </div>
        
        <!-- ▶ OPTIONS CHO PHẦN 2 -->
        <div data-selector=".s_three_part_text" 
             data-js="ThreePartText"
             data-name="part2_options">
            
            <!-- Các component we-* -->
            
        </div>
        
        <!-- ▶ OPTIONS CHO PHẦN 3 -->
        <!-- ... -->
        
        <!-- ▶ OPTIONS CHUNG -->
        <div data-selector=".s_three_part_text">
            <!-- Alignment, Line height, Padding -->
        </div>
        
    </xpath>
</template>
```

### B. Web Editor Components (we-*)

#### 1. **we-title** - Tiêu Đề

```xml
<we-title string="Part 1 - Starting Text" 
          data-selector=".s_three_part_text_part1"/>
```

Hiển thị: **Part 1 - Starting Text** (bold, nổi bật)

#### 2. **we-input** - Input Text

```xml
<we-input string="Text Content"
         data-attribute-name="data-part1-text"
         data-apply-to=".s_three_part_text_part1"
         data-selector=".s_three_part_text_part1"/>
```

**Attributes:**
- `string`: Label hiển thị
- `data-attribute-name`: HTML attribute để update (data-part1-text)
- `data-apply-to`: CSS selector để apply changes
- `data-selector`: CSS selector chính

**Kết Quả**: Bạn có thể nhập text mới → Cập nhật data-part1-text attribute

#### 3. **we-colorpicker** - Chọn Màu

```xml
<we-colorpicker string="Text Color"
               data-apply-to=".s_three_part_text_part1"
               data-select-style="true"
               data-css-property="color"/>
```

**Attributes:**
- `string`: Label
- `data-apply-to`: Element nào nhận màu
- `data-select-style="true"`: Áp dụng inline style
- `data-css-property`: CSS property (color, background-color, etc.)

**Kết Quả**: Color picker → Click chọn màu → Áp dụng style `color: #...`

#### 4. **we-select** - Dropdown Lựa Chọn

```xml
<we-select string="Font Size"
          data-apply-to=".s_three_part_text_part1">
    <we-button data-select-style="font-size: 0.875rem;">
        Small (14px)
    </we-button>
    <we-button data-select-style="font-size: 1rem;">
        Normal (16px)
    </we-button>
    <we-button data-select-style="font-size: 1.5rem;">
        Large (24px)
    </we-button>
</we-select>
```

**Cấu Trúc:**
```
we-select (Dropdown)
    ├─ we-button 1 (Option 1)
    ├─ we-button 2 (Option 2)
    └─ we-button 3 (Option 3)
```

**Attributes:**
- `data-select-style`: Inline style được áp dụng
- `data-select-class`: CSS class được áp dụng (thay thế style)

**Kết Quả**: Click button → Áp dụng style `font-size: 1.5rem;`

#### 5. **we-button-group** - Nhóm Nút Toggle

```xml
<we-button-group string="Text Alignment">
    <we-button data-select-style="text-align: left;"
              title="Left Align">
        Left
    </we-button>
    <we-button data-select-style="text-align: center;"
              title="Center Align">
        Center
    </we-button>
    <we-button data-select-style="text-align: right;"
              title="Right Align">
        Right
    </we-button>
</we-button-group>
```

**Giống we-select nhưng các button được hiển thị ngang.**

### C. Dữ Liệu Được Lưu

Khi bạn tùy chỉnh options, HTML gốc được update:

```xml
<!-- Ban đầu -->
<span class="s_three_part_text_part1">Edit this text</span>

<!-- Sau khi chọn màu + size -->
<span class="s_three_part_text_part1" 
      style="color: #e53e3e; font-size: 20px;">
    Edit this text
</span>

<!-- Sau khi nhập text mới -->
<div class="s_three_part_text" 
     data-part1-text="Phần 1 mới">
    <span class="s_three_part_text_part1">
        Phần 1 mới
    </span>
</div>
```

---

## 🎨 <a name="css"></a>3. Cấu Trúc CSS Chi Tiết

### File: `000.scss`

```scss
// ========================================
// SNIPPET STYLES
// ========================================

.s_three_part_text {
    display: block;  // Block-level element
    width: 100%;     // Full width
    
    .s_three_part_text_paragraph {
        margin: 0;   // Không margin
        padding: 0;  // Không padding
        word-spacing: 0;  // Không add space giữa từ
    }
    
    // Shared styles cho cả 3 phần
    .s_three_part_text_part1,
    .s_three_part_text_part2,
    .s_three_part_text_part3 {
        display: inline;  // Nằm cạnh nhau (không xuống dòng)
        
        // Editor UI styling
        &[contenteditable="true"] {
            outline: none;
            border: 1px solid transparent;
            border-radius: 2px;
            padding: 2px 4px;
            transition: all 0.2s ease;
            
            // Khi focus (đang edit)
            &:focus {
                border: 1px dotted #667eea;
                background-color: rgba(102, 126, 234, 0.05);
            }
        }
    }
    
    // Default styles cho từng phần
    .s_three_part_text_part1 {
        color: #2d3748;       // Xanh đậm
        font-size: 1rem;       // 16px
        font-weight: 400;      // Normal
        font-style: normal;
        text-decoration: none;
    }
    
    .s_three_part_text_part2 {
        color: #e53e3e;        // Đỏ
        font-size: 1.125rem;   // 18px
        font-weight: 600;      // Semi Bold
        font-style: normal;
        text-decoration: none;
    }
    
    .s_three_part_text_part3 {
        color: #3182ce;        // Xanh nhạt
        font-size: 1rem;       // 16px
        font-weight: 400;      // Normal
        font-style: normal;
        text-decoration: none;
    }
}
```

### Padding Classes

```scss
.s_text_no_padding {
    padding: 0;
}

.s_text_small_padding {
    padding: 0.5rem 0;
}

.s_text_medium_padding {
    padding: 1rem 0;
}

.s_text_large_padding {
    padding: 1.5rem 0;
}
```

**Sử Dụng:**
```
we-select string="Padding"
    we-button data-select-class="s_text_no_padding"
    we-button data-select-class="s_text_small_padding"
```

Click → Class được thêm/xóa → Padding tự động thay đổi

### Media Query (Responsive)

```scss
@media (max-width: 768px) {
    .s_three_part_text {
        // Mobile styles
        .s_three_part_text_paragraph {
            word-break: break-word;  // Cho phép break từ dài
        }
    }
}

@media print {
    .s_three_part_text {
        [contenteditable="true"] {
            border: none !important;
            background: none !important;
            outline: none !important;
        }
    }
}
```

---

## ⚙️ <a name="javascript"></a>4. Cấu Trúc JavaScript Chi Tiết

### File: `000.js`

```javascript
odoo.define('website.snippet.option.ThreePartText', function(require) {
    'use strict';
    
    var options = require('web_editor.snippets.options');
    var publicWidget = require('web.public.widget');
    
    // ========================================
    // OPTIONS HANDLER - Cho editor
    // ========================================
    options.registry.ThreePartText = options.Class.extend({
        selector: '.s_three_part_text',  // CSS selector
        disableInEditMode: true,          // Disable frontend JS ở edit mode
        
        start: function() {
            this._super.apply(this, arguments);
            this._initializePartText();
        },
        
        // Khởi tạo và sync text
        _initializePartText: function() {
            var $snippet = this.$el;
            
            // Part 1: Load text từ data attribute vào span
            var textContent = $snippet.attr('data-part1-text') 
                            || $snippet.find('.s_three_part_text_part1').text();
            $snippet.find('.s_three_part_text_part1').text(textContent);
            $snippet.attr('data-part1-text', textContent);
            
            // Part 2, 3: Tương tự...
        },
        
        // Listen to text changes
        _listenToTextChanges: function() {
            var $snippet = this.$el;
            
            // Khi user edit text part 1
            $snippet.find('.s_three_part_text_part1').on('input', function() {
                var text = $(this).text();
                // Update data-part1-text attribute
                $snippet.attr('data-part1-text', text);
            });
            
            // Part 2, 3: Tương tự...
        },
    });
    
    // ========================================
    // PUBLIC WIDGET - Cho frontend
    // ========================================
    publicWidget.registry.ThreePartText = publicWidget.Widget.extend({
        selector: '.s_three_part_text',
        disableInEditMode: false,  // Chạy cả khi đang edit
        
        start: function() {
            // Load text từ data attributes
            this._setupParts();
            // Bảo toàn formatting
            this._preserveFormatting();
        },
        
        // Load text từ data attributes vào spans
        _setupParts: function() {
            var $snippet = this.$el;
            var part1Text = $snippet.attr('data-part1-text');
            
            if (part1Text) {
                $snippet.find('.s_three_part_text_part1').text(part1Text);
            }
            // Part 2, 3: Tương tự...
        },
        
        // Bảo toàn inline styles
        _preserveFormatting: function() {
            var $snippet = this.$el;
            
            // Lấy inline styles
            var part1Styles = $snippet.find('.s_three_part_text_part1')
                                      .attr('style');
            console.log('Part 1 Styles:', part1Styles);
        },
        
        // Public methods - có thể gọi từ ngoài
        updatePartText: function(partNumber, text) {
            var selector = '.s_three_part_text_part' + partNumber;
            this.$el.find(selector).text(text);
            this.$el.attr('data-part' + partNumber + '-text', text);
        },
        
        getPartText: function(partNumber) {
            var selector = '.s_three_part_text_part' + partNumber;
            return this.$el.find(selector).text();
        },
    });
    
    return {
        ThreePartText: options.registry.ThreePartText,
    };
});
```

### Giải Thích Objects

#### `options.registry.ThreePartText`

**Mục Đích**: Handle options panel trong editor

```javascript
options.registry.ThreePartText = options.Class.extend({
    selector: '.s_three_part_text',  // Chọn snippet nào
    
    start: function() {
        // Chạy khi snippet được select trong editor
    },
    
    onFocus: function() {
        // Chạy khi focus vào snippet
    },
});
```

**Life Cycle**:
```
User click snippet
    ↓
options.registry.ThreePartText được khởi tạo
    ↓
start() được gọi
    ↓
Options panel hiển thị
    ↓
User thay đổi options
    ↓
HTML được update tức thì
```

#### `publicWidget.registry.ThreePartText`

**Mục Đích**: Handle logic trên website (frontend)

```javascript
publicWidget.registry.ThreePartText = publicWidget.Widget.extend({
    selector: '.s_three_part_text',  // Chọn snippet nào
    
    start: function() {
        // Chạy khi trang load hoặc AJAX load snippet
        // Đây là nơi load text từ data attributes
    },
});
```

**Life Cycle**:
```
Trang website load
    ↓
publicWidget.registry.ThreePartText được khởi tạo
    ↓
start() được gọi
    ↓
Text được load từ data-part1-text, etc.
    ↓
Formatting được apply
```

---

## 🔌 <a name="integration"></a>5. Tích Hợp Vào Module

### Bước 1: File XML được Tạo

```
f:\BMS\Odoo\odoo\addons\website\views\snippets\s_three_part_text.xml
```

### Bước 2: Đăng Ký Trong `__manifest__.py`

```python
'data': [
    # ... các file khác ...
    'views/snippets/s_text_block.xml',
    'views/snippets/s_three_part_text.xml',  # ← THÊMDÒNG NÀY
    'views/snippets/s_features.xml',
]
```

### Bước 3: Đăng Ký Trong `snippets.xml`

```xml
<snippets id="snippet_structure" string="Structure">
    <!-- ...các snippet khác... -->
    
    <!-- Text group -->
    <t t-snippet="website.s_text_block" string="Text" group="text">
        <keywords>content, paragraph, article, body, description, information</keywords>
    </t>
    
    <!-- THÊM DÒNG NÀY -->
    <t t-snippet="website.s_three_part_text" string="Three Part Text" group="text">
        <keywords>three parts, formatted text, multi-style, paragraph, styling</keywords>
    </t>
    
    <!-- ...các snippet khác... -->
</snippets>
```

### Bước 4: Assets Được Tự Động Load

```xml
<!-- Trong s_three_part_text.xml -->
<asset id="website.s_three_part_text_000_scss" name="Three Part Text SCSS">
    <bundle>web.assets_frontend</bundle>
    <path>website/static/src/snippets/s_three_part_text/000.scss</path>
</asset>

<asset id="website.s_three_part_text_000_js" name="Three Part Text JS">
    <bundle>web.assets_frontend</bundle>
    <path>website/static/src/snippets/s_three_part_text/000.js</path>
</asset>
```

**Bundle**: `web.assets_frontend` → Load cùng website assets

---

## 🏃 Quy Trình Hoạt Động Hoàn Chỉnh

```
1. MODULE INITIALIZE
   ├─ Load __manifest__.py
   ├─ Đọc 'views/snippets/s_three_part_text.xml'
   ├─ Parse template, options, assets
   └─ Register snippet

2. WEBSITE EDITOR LOAD
   ├─ Đọc snippets.xml
   ├─ Tạo snippet picker buttons
   └─ Load CSS/JS assets

3. USER DRAG SNIPPET
   ├─ Kéo snippet vào trang
   ├─ Clone HTML template
   ├─ Gọi options.registry.ThreePartText.start()
   └─ Hiển thị options panel

4. USER EDIT TEXT
   ├─ Click double → Cơ chế contenteditable
   ├─ Type text mới
   ├─ onInput event → Update data-part1-text
   └─ Save trang

5. USER CHANGE STYLE
   ├─ Click color picker
   ├─ Select màu → style được update
   ├─ HTML: <span style="color: #...">
   └─ Save trang

6. WEBSITE LOAD
   ├─ HTML được render
   ├─ publicWidget.registry.ThreePartText.start()
   ├─ Load text từ data attributes
   ├─ Apply inline styles
   └─ Display với formatting đã lưu

7. SAVE TO DATABASE
   ├─ HTML được serialize
   ├─ Save vào ir.ui.view
   ├─ Next time: Load từ database
   └─ Same process
```

---

## 🛠️ Mở Rộng Snippet

### Thêm Tính Năng Mới

#### 1. Thêm Part 4

**Trong XML**:
```xml
<span class="s_three_part_text_part4" 
      contenteditable="true"
      data-name="Part 4 Text">
     and part 4
</span>
```

**Trong Options**:
```xml
<div data-selector=".s_three_part_text" data-js="ThreePartText"
     data-name="part4_options">
    <we-title string="Part 4 - Fourth Text" 
              data-selector=".s_three_part_text_part4"/>
    <!-- we-input, we-colorpicker, etc. -->
</div>
```

**Trong CSS**:
```scss
.s_three_part_text_part4 {
    color: #667eea;
    font-size: 1rem;
    font-weight: 400;
}
```

**Trong JS**:
```javascript
// Thêm vào _initializePartText() function
var textContent = $snippet.attr('data-part4-text') 
                || $snippet.find('.s_three_part_text_part4').text();
$snippet.find('.s_three_part_text_part4').text(textContent);
$snippet.attr('data-part4-text', textContent);

// Thêm vào _listenToTextChanges() function
$snippet.find('.s_three_part_text_part4').on('input', function() {
    var text = $(this).text();
    $snippet.attr('data-part4-text', text);
});
```

#### 2. Thêm Background Color

**Trong Options**:
```xml
<we-colorpicker string="Background Color"
               data-select-style="true"
               data-css-property="background-color"
               data-apply-to=".s_three_part_text"/>
```

#### 3. Thêm Text Transform

**Trong Options**:
```xml
<we-select string="Text Transform">
    <we-button data-select-style="text-transform: none;">Normal</we-button>
    <we-button data-select-style="text-transform: uppercase;">Uppercase</we-button>
    <we-button data-select-style="text-transform: lowercase;">Lowercase</we-button>
    <we-button data-select-style="text-transform: capitalize;">Capitalize</we-button>
</we-select>
```

---

**Tài liệu được cập nhật**: Tháng 4, 2026

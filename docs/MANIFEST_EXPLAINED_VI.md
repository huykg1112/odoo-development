# Hướng Dẫn Chi Tiết File Manifest Trong Odoo

## Giới Thiệu Chung

File `__manifest__.py` là tệp tin cấu hình quan trọng của mỗi module/addon trong Odoo. Nó chứa thông tin metadata về module như tên, phiên bản, dependency, dữ liệu khởi tạo, và đặc biệt là cấu hình **assets** (tài nguyên tĩnh như CSS, JavaScript, XML).

---

## 1. Cấu Trúc Cơ Bản Của File Manifest

File manifest là một dictionary Python chứa các cặp key-value. Dưới đây là các phần chính:

```python
{
    'name': 'Tên module',
    'category': 'Danh mục',
    'version': 'Phiên bản',
    'depends': ['Module phụ thuộc'],
    'data': ['Tệp tin dữ liệu'],
    'assets': { # Phần quan trọng nhất
        'bundle_name': [
            'đường/dẫn/file.js',
            'đường/dẫn/file.scss',
        ]
    }
}
```

---

## 2. Các Trường Cơ Bản

### 2.1. `'name'` - Tên Module
```python
'name': 'Website'
```
- Tên hiển thị của module trong giao diện Odoo
- Người dùng sẽ thấy tên này khi cài đặt module

### 2.2. `'category'` - Danh Mục
```python
'category': 'Website/Website'
```
- Phân loại module thành các nhóm
- Dùng để sắp xếp và tìm kiếm module
- Theo định dạng: `'Main Category/Sub Category'`

### 2.3. `'sequence'` - Thứ Tự Cài Đặt
```python
'sequence': 20
```
- Xác định thứ tự cài đặt module
- Số thấp = cài đặt trước (vì có dependencies)
- Website là 20 vì phụ thuộc vào nhiều module khác

### 2.4. `'summary'` - Tóm Tắt
```python
'summary': 'Enterprise website builder'
```
- Mô tả ngắn gọn tính năng của module
- Hiển thị trong danh sách module

### 2.5. `'version'` - Phiên Bản
```python
'version': '1.0'
```
- Phiên bản của module
- Thường tuân theo phiên bản Odoo (16.0.1.0.0, ...)

### 2.6. `'installable'` - Có Thể Cài Được
```python
'installable': True
```
- `True`: Module có thể cài đặt
- `False`: Module bị ẩn khỏi danh sách cài đặt

### 2.7. `'application'` - Ứng Dụng Chính
```python
'application': True
```
- `True`: Module là ứng dụng chính (hiển thị to hơn trong menu)
- `False`: Là module hỗ trợ

---

## 3. Phần `'depends'` - Các Module Phụ Thuộc

```python
'depends': [
    'digest',
    'web',
    'web_editor',
    'html_editor',
    'http_routing',
    'portal',
    'social_media',
    'auth_signup',
    'mail',
    'google_recaptcha',
    'utm',
]
```

### Với nghĩa là gì?
- Khi cài đặt module `website`, Odoo sẽ **tự động cài đặt** tất cả module này trước
- Thứ tự cài đặt được tính toán dựa trên dependency tree
- Nếu module phụ thuộc không được cài, module này cũng không thể cài

### Ví dụ thực tế:
```
website (muốn cài)
  → web (cần cài trước)
    → base (cần cài trước web)
  → web_editor (cần cài trước)
  → mail (cần cài trước)
```

---

## 4. Phần `'data'` - Các Tệp Dữ Liệu

```python
'data': [
    'security/website_security.xml',
    'security/ir.model.access.csv',
    'data/image_library.xml',
    'views/website_templates.xml',
    'views/snippets/snippets.xml',
    # ... nhiều file khác
]
```

### Các loại tệp trong `data`:

#### 4.1. **Security XML** (`security/`)
```python
'security/website_security.xml'
'security/ir.model.access.csv'
```
- Định nghĩa nhóm người dùng (groups) và quyền truy cập
- **Cần cài đặt trước** các tệp khác (vì dữ liệu cần quyền)

#### 4.2. **Data Files** (`data/`)
```python
'data/image_library.xml'
'data/website_data.xml'
'data/ir_asset.xml'
```
- Dữ liệu khởi tạo: hình ảnh, cấu hình, assets
- Được tải lên database khi cài đặt module

#### 4.3. **Views** (`views/`)
```python
'views/website_templates.xml'
'views/website_views.xml'
'views/res_partner_views.xml'
```
- Giao diện (views) của models
- Hiển thị dữ liệu dưới dạng form, list, kanban, ...

#### 4.4. **Snippets** (`views/snippets/`)
```python
'views/snippets/snippets.xml'
'views/snippets/s_framed_intro.xml'
'views/snippets/s_title.xml'
```
- Các mảnh HTML tái sử dụng trong website builder
- Người dùng có thể kéo thả các snippet này để xây dựng trang

#### 4.5. **Wizard** (`wizard/`)
```python
'wizard/base_language_install_views.xml'
'wizard/blocked_third_party_domains.xml'
```
- Các dialog/hộp thoại wizard
- Hướng dẫn từng bước người dùng

---

## 5. Phần `'demo'` - Dữ Liệu Demo

```python
'demo': [
    'data/website_demo.xml',
    'data/website_visitor_demo.xml',
]
```

### Khác gì với `data`?
- **Dữ liệu demo chỉ được tải khi chọn "Load Demo Data"**
- Dữ liệu chính (`data`) luôn được tải
- Dùng để hiển thị ví dụ cho người dùng mới

---

## 6. Hooks - Các Hàm Chạy Đặc Biệt

```python
'post_init_hook': 'post_init_hook'
'uninstall_hook': 'uninstall_hook'
```

### `post_init_hook`
- Chạy **sau khi** module được cài đặt
- Dùng cho logic khởi tạo phức tạp
- Ví dụ: cập nhật dữ liệu, tạo tệp, ...

### `uninstall_hook`
- Chạy **trước khi** module được gỡ bỏ
- Dùng để dọn dẹp dữ liệu trước khi xóa
- Ví dụ: xóa tệp tạm, khôi phục cấu hình, ...

---

## 7. 🎯 PHẦN ASSETS - CHI TIẾT TOÀN BỘ

### 7.1. Asset Là Gì?

**Asset** (tài nguyên) là các tệp tĩnh mà trình duyệt cần để hiển thị giao diện:
- **CSS** (`.scss`, `.css`) - Styling
- **JavaScript** (`.js`) - Logic interactivity
- **XML** (`.xml`) - Templates

### 7.2. Cấu Trúc Assets

```python
'assets': {
    'bundle_name_1': [
        'file1.js',
        'file2.scss',
    ],
    'bundle_name_2': [
        'file3.css',
    ]
}
```

**Bundle** là một nhóm assets được gộp lại thành một tệp duy nhất:
- Tăng hiệu suất: Giảm số request HTTP
- Được cache: Trình duyệt tải một lần
- Được minify: Nén kích thước tệp

### 7.3. Các Bundle Chính Trong Website Module

#### **A. `web.assets_frontend` - Frontend Của Trang Web**

```python
'web.assets_frontend': [
    ('replace', 'web/static/src/legacy/js/public/public_root_instance.js', 
     'website/static/src/js/content/website_root_instance.js'),
    'website/static/src/core/errors/beforeunload_error_handler.js',
    'website/static/src/libs/zoomodoo/zoomodoo.scss',
    'website/static/src/scss/website.scss',
    # ... nhiều file khác
]
```

**Dùng cho:** Trang web công khai mà khách hàng nhìn thấy
**Bao gồm:**
- CSS cho styling trang
- JavaScript cho menu, animation, cookies, ...
- XML templates

**Các lệnh đặc biệt:**
- `('replace', old_file, new_file)` - Thay thế file cũ bằng file mới
- Ví dụ: Thay `public_root_instance.js` bằng phiên bản custom của website

**Nội dung chi tiết:**
```python
('replace', 'web/static/src/legacy/js/public/public_root_instance.js', 
 'website/static/src/js/content/website_root_instance.js'),
# → Thay thế file js gốc của web module

'website/static/src/scss/website.scss',
# → CSS chính cho website

'website/static/src/js/content/website_root.js',
# → Root component của website

'website/static/src/js/content/menu.js',
# → Logic xử lý menu chính

'website/static/src/js/content/snippets.animation.js',
# → Animation cho các snippet

'website/static/src/js/show_password.js',
# → Toggle hiển thị mật khẩu

'website/static/src/xml/website.xml',
# → Các template cho website
```

#### **B. `web.assets_frontend_minimal` - Bundle Tối Thiểu**

```python
'web.assets_frontend_minimal': [
    'website/static/src/js/content/inject_dom.js',
    'website/static/src/js/content/auto_hide_menu.js',
    'website/static/src/js/content/redirect.js',
    'website/static/src/js/content/adapt_content.js',
    'website/static/src/snippets/observing_cookie_mixin.js',
    'website/static/src/js/content/generate_video_iframe.js',
]
```

**Dùng cho:** Tải nhanh ban đầu (critical CSS/JS)
**Bao gồm:** Chỉ những code cần thiết nhất để trang hiện lên

**Ví dụ:**
- `inject_dom.js` - Chèn HTML vào trang
- `auto_hide_menu.js` - Tự động ẩn menu khi scroll
- `redirect.js` - Redirect người dùng

#### **C. `web.assets_frontend_lazy` - Bundle Lazy Load**

```python
'web.assets_frontend_lazy': [
    ('remove', 'website/static/src/js/content/inject_dom.js'),
    ('remove', 'website/static/src/js/content/auto_hide_menu.js'),
    # ... gỡ bỏ file khỏi minimal
]
```

**Dùng cho:** Tải sau khi trang hiển thị
**Công dụng:** 
- `('remove', file)` - Gỡ bỏ file khỏi bundle cha
- Giàn vãi tải: tải file này sau, không blocking

#### **D. `web.assets_backend` - Backend (Giao Diện Quản Lý)**

```python
'web.assets_backend': [
    ('include', 'website.assets_editor'),
    'website/static/src/scss/color_palettes.scss',
    'website/static/src/js/backend/**/*',
    'website/static/src/client_actions/*/*',
    'website/static/src/components/fields/*',
    # ... nhiều file khác
]
```

**Dùng cho:** Giao diện quản lý (backend) của Odoo
**Bao gồm:**
- CSS cho giao diện quản lý
- JavaScript cho hành động (actions)
- Components cho form, list view, ...

**Lệnh đặc biệt:**
```python
('include', 'website.assets_editor')
# → Nhúng toàn bộ bundle website.assets_editor vào đây
```

**Gỡ bỏ Dark Mode:**
```python
('remove', 'website/static/src/client_actions/*/*.dark.scss'),
# → Không tải CSS dark mode
```

#### **E. `web._assets_primary_variables` - CSS Variables Chính**

```python
'web._assets_primary_variables': [
    'website/static/src/scss/primary_variables.scss',
    'website/static/src/scss/options/user_values.scss',
    'website/static/src/scss/options/colors/user_color_palette.scss',
]
```

**Dùng cho:** Định nghĩa các CSS variables cơ bản
**Ví dụ:**
```scss
$primary-color: #007bff;
$secondary-color: #6c757d;
$border-radius: 4px;
```

**Bundle có prefix `_` (underscore) không được tải trực tiếp, dùng qua `@import`**

#### **F. `web._assets_secondary_variables` - CSS Variables Phụ**

```python
'web._assets_secondary_variables': [
    ('prepend', 'website/static/src/scss/secondary_variables.scss'),
]
```

**Dùng cho:** Định nghĩa CSS variables từ primary variables
**Lệnh `prepend`:** Thêm file này lên đầu bundle (trước các file khác)

#### **G. `website.assets_wysiwyg` - WYSIWYG Editor**

```python
'website.assets_wysiwyg': [
    ('include', 'web._assets_helpers'),
    'website/static/src/scss/website.wysiwyg.scss',
    'website/static/src/js/editor/snippets.editor.js',
    'website/static/src/snippets/s_card/options.xml',
    # ... nhiều file khác
]
```

**Dùng cho:** Giao diện chỉnh sửa WYSIWYG (kéo thả trên website)
**Bao gồm:**
- CSS cho editor
- JavaScript xử lý snippets, options
- XML cho giao diện options

**Ví dụ file:**
```
s_card/options.xml → Options (cài đặt) cho snippet card
s_carousel/options.js → Logic xử lý carousel
s_countdown/options.js → Logic xử lý countdown
```

#### **H. `web.assets_tests` - Test Suite**

```python
'web.assets_tests': [
    'website/static/tests/tour_utils/focus_blur_snippets_options.js',
    'website/static/tests/tour_utils/website_preview_test.js',
    'website/static/tests/tours/**/*',
]
```

**Dùng cho:** Kiểm thử tự động (automated tests)
**Bao gồm:**
- JavaScript test files
- Tour utils (mô phỏng hành động người dùng)

#### **I. `web_editor.assets_media_dialog` - Dialog Quản Lý Media**

```python
'web_editor.assets_media_dialog': [
    'website/static/src/components/media_dialog/*',
]
```

**Dùng cho:** Dialog chọn hình ảnh/video
**Bao gồm:** Components để tìm kiếm và chọn media

### 7.4. Các Thao Tác Đặc Biệt Với Assets

#### **Thao tác `replace`** - Thay Thế
```python
('replace', 'đường/dẫn/cũ.js', 'đường/dẫn/mới.js')
```
- Gỡ bỏ file cũ khỏi bundle
- Thêm file mới vào

#### **Thao tác `remove`** - Gỡ Bỏ
```python
('remove', 'đường/dẫn/file.js')
```
- Xóa file khỏi bundle
- Dùng khi muốn loại bỏ code không cần thiết

#### **Thao tác `include`** - Nhúng Bundle
```python
('include', 'tên.bundle.khác')
```
- Nhúng toàn bộ bundle khác vào
- Tất cả file của bundle kia sẽ được thêm vào

#### **Thao tác `prepend`** - Thêm Lên Đầu
```python
('prepend', 'đường/dẫn/file.scss')
```
- Thêm file này lên đầu bundle (trước các file khác)
- Dùng cho variables, imports cần thiết trước

#### **Wildcard Patterns** - Mẫu Tìm Kiếm
```python
'website/static/src/js/backend/**/*'      # Tất cả file trong backend
'website/static/src/components/fields/*'  # Tất cả trong fields
'website/static/tests/tours/**/*'         # Tất cả test tours
```

### 7.5. Thứ Tự Tải Assets

**CSS variables được tải trước CSS thường:** 
```
primary_variables.scss 
  ↓
secondary_variables.scss
  ↓
website.scss (dùng biến từ trên)
```

**Được minify và cache:**
```
website/static/src/scss/website.scss  (1000 dòng)
  ↓ (minify + gzip)
/bundles/web.assets_frontend.0d73f.min.css  (50KB)
```

---

## 8. Cấu Hình Dark Mode

```python
"web.assets_web_dark": [
    'website/static/src/components/dialog/*.dark.scss',
    'website/static/src/scss/website.backend.dark.scss',
    'website/static/src/client_actions/*/*.dark.scss',
]
```

**Dùng cho:** Ghi đè CSS khi công tắc dark mode
**Ví dụ:**
```scss
/* website.backend.dark.scss */
body {
    background: #1a1a1a;
    color: #ffffff;
}
```

---

## 9. External Dependencies

```python
'external_dependencies': {
    'python': ['geoip2'],
}
```

**Dùng để:** Khai báo thư viện Python cần cài đặt
**Ví dụ:** 
- `geoip2` - Xác định vị trí địa lý từ IP
- `requests` - Gọi API HTTP
- `lxml` - Parse XML

**Cài đặt tự động khi cài module**

---

## 10. Cấu Hình Snipet Mặc Định

```python
'configurator_snippets': {
    'homepage': ['s_cover', 's_text_image', 's_numbers'],
    'about_us': ['s_text_image', 's_image_text', 's_title', 's_company_team'],
    'our_services': ['s_three_columns', 's_quotes_carousel', 's_references'],
}
```

**Dùng để:** Đặt sẵn snippet khi tạo trang mới
**Ví dụ:** Trang "homepage" mặc định có 3 snippet: cover, text_image, numbers

---

## 11. Template Trang Mới

```python
'new_page_templates': {
    'basic': {
        '1': ['s_text_block_h1', 's_text_block', 's_image_text'],
        '2': ['s_text_block_h1', 's_picture', 's_text_block'],
    },
    'about': {
        'full': ['s_text_block_h1', 's_image_text', ...],
    },
}
```

**Dùng để:** Cung cấp template trang để người dùng lựa chọn
**Cách dùng:** Khi tạo trang → Chọn loại (basic/about/gallery) → Chọn template → Layout tự động được tạo

---

## 12. Ví Dụ Thực Tế: Cách Lấy Assets

### Khi người dùng truy cập website công khai:
```
1. Trình duyệt tải /web/assets/
2. Load bundle 'web.assets_frontend' (từ web module)
3. Load bundle 'web.assets_frontend' (từ website module)
4. Gộp tất cả + minify + gzip
5. Cache trong /bundles/web.assets_frontend.0d73f.min.js
6. Trình duyệt tải file cache này
```

### Khi admin chỉnh sửa website:
```
1. Mở /web/ (backend)
2. Load bundle 'web.assets_backend'
3. Load bundle 'website.assets_editor'
4. Load bundle 'website.assets_wysiwyg'
5. Hiển thị giao diện editor with kéo thả
```

---

## 13. Best Practices

### ✅ NÊN LÀM:
1. **Tách assets theo bundle** - Frontend / Backend / Editor
2. **Dùng wildcard** - `'path/**/*'` thay vì liệt kê từng file
3. **Thêm comments** - Giải thích tại sao cần file này
4. **Xóa unused assets** - Dùng `remove` để loại bỏ code không cần

### ❌ KHÔNG NÊN LÀM:
1. **Để tất cả file trong 1 bundle** - Gây delay tải trang
2. **Hardcode path đầy đủ** - Dùng relative path
3. **Bundle quá nặng** - Chia thành nhiều bundle nho nhỏ
4. **Không test trên mobile** - Assets phải tối ưu cho di động

---

## 14. Bash Commands Hữu Ích

### Tìm tất cả JS files:
```bash
find . -name "*.js" -path "*/website/*"
```

### Xem kích thước assets:
```bash
ls -lh /odoo/static/bundles/
```

### Clear cache assets:
```bash
rm -rf /odoo/static/bundles/
# Odoo sẽ tái tạo tại lần tải tiếp theo
```

---

## 15. Tổng Kết

| Phần | Dùng Cho | Ví Dụ |
|------|----------|-------|
| `name` | Tên module | 'Website' |
| `depends` | Module phụ thuộc | `['web', 'mail']` |
| `data` | Dữ liệu XML/CSV | `['views/website_views.xml']` |
| `assets` | CSS/JS/XML cho giao diện | Xem phần 7 |
| `post_init_hook` | Chạy sau cài | `post_init_hook` |

**Assets là phần quan trọng nhất** vì nó kiểm soát toàn bộ hiệu suất và hiển thị giao diện!

---

## Tham Khảo Thêm

- [Odoo Module Manifest Documentation](https://www.odoo.com/documentation/)
- Phần Assets của module khác để so sánh
- Folder `website/static/` để xem cấu trúc thực tế

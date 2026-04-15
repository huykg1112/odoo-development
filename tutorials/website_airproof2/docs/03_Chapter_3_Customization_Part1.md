# Thực hành Odoo 18.0 Theme - Phase 3: Tuỳ biến Giao diện (CSS/SCSS)

Dựa trên tài liệu: [Chapter 3 - Customisation, Part I](https://www.odoo.com/documentation/18.0/developer/tutorials/website_theme/03_customisation_part1.html)

Đến lúc thay đổi diện mạo thực sự. Theme Bootstrap của Odoo được xây dựng với kiến trúc dựa rất nhiều vào cấu trúc biến SCSS. Bạn không nên viết lại từ đầu mã CSS, mà hãy đè các giá trị biến nền tảng.

## 1. Hệ thống Asset bundles của Odoo

Odoo đóng gói (compile) các tệp SCSS thông qua hệ thống Asset Bundles. Có ba Bundle quan trọng đối với dân làm Theme khai báo trong `__manifest__.py > assets`:

```python
'assets': {
    # 1. assets_primary_variables: Nơi định nghĩa màu sắc chủ đạo, font chữ.
    'web._assets_primary_variables': [
        'website_airproof/static/src/scss/primary_variables.scss',
    ],
    
    # 2. assets_frontend_helpers: Nơi override các biến Bootstrap 
    # dùng hàm trộn (mixins), hoặc độ rộng các container.
    'web._assets_frontend_helpers': [
        ('prepend', 'website_airproof/static/src/scss/bootstrap_overridden.scss'),
    ],
    
    # 3. assets_frontend: Nơi chứa toàn bộ SCSS/CSS và JS tuỳ chỉnh
    # của riêng các element do bạn tạo ra.
    'web.assets_frontend': [
        'website_airproof/static/src/scss/font.scss',
        'website_airproof/static/src/scss/layout/header.scss',
    ],
}
```
*Lưu ý từ khoá `('prepend', ...)`: Cú pháp này bắt buộc Odoo chèn đè tệp SCSS của chúng ta TRƯỚC khi gọi hệ thống Bootstrap cốt lõi, từ đó các biến của chúng ta được ưu tiên so với hệ thống gốc.*

## 2. Override biến cốt lõi (`primary_variables.scss`)

Tại thư mục SCSS, chúng ta sẽ định nghĩa lại bộ bảng màu bằng SCSS maps.
Odoo dùng một biến map `$o-color-palette` để gen các màu Odoo-theme theo nguyên lý số từ 1 đến 5 (VD: o-color-1, o-color-2...).

Tạo file `static/src/scss/primary_variables.scss`:
```scss
// Ghi đè bộ màu Color Palette chuẩn của Odoo Theme
$o-color-palette: (
    '1': #292E31, // Đen nhạt / Xám than
    '2': #969DA3, // Xám nhạt
    '3': #FFFFFF, // Trắng
    '4': #FF7043, // Cam (Màu nhấn Accent color)
    '5': #F8F9FA, // Trắng đục nền
);

// Ghi đè Font chữ mặc định thành font Inter hoặc Roboto theo ý đồ thiết kế.
$font-family-sans-serif: 'Roboto', 'Inter', sans-serif;
```
Bằng cách khai báo map này, website của bạn sẽ tự động có các class màu tiện lợi như `.bg-o-color-4` (nền cam), `.text-o-color-1` (chữ màu xám than).

## 3. Override System Bootstrap (`bootstrap_overridden.scss`)

Cái hay của Bootstrap là mọi độ dày nết border, kiểu bo viện (border-radius), hay độ rộng container đều phụ thuộc biến số.

Tạo file `static/src/scss/bootstrap_overridden.scss`:
```scss
// Làm tắt chế độ bo tròn góc của các thành phần như Button, Card
$enable-rounded: false;

// Đặt độ to chữ (font-size) cho thẻ Body
$font-size-base: 1.1rem;

// Ghi đè định dạng font Heading (h1, h2, h3...)
$headings-font-weight: 700;
$headings-margin-bottom: 2rem;

// Điều chỉnh lại độ rộng tối đa của Container (Thường Bootstrap cũ hẹp)
$container-max-widths: (
  sm: 540px,
  md: 720px,
  lg: 960px,
  xl: 1200px,
  xxl: 1400px
);
```

## 4. Khai báo Font Tuỳ chỉnh (`font.scss`)

Nếu bạn sử dụng thư viện font trực tiếp (như upload file .woff2 lên) hoặc muốn @import thư viện Google Fonts thẳng vào Frontend without dùng backend config.

Tạo file `static/src/scss/font.scss`:
```scss
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');

// Cấu trúc code SCSS/CSS thông thường để trang trí các UI Element...
.o_header_standard {
    border-bottom: 1px solid rgba(0,0,0,0.1);
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}
```

Kết thúc Phim 3, khi bạn Refersh trình duyệt (nhớ vào Odoo backend nhấn Update module nhé), Website sẽ thay đổi toàn bộ skin màu sắc và font chữ một cách mượt mà mà không phải chèn code Inline khó chịu. Điểm dừng này rất lý tưởng để xây dựng Design System vững chắc cho việc lập code Frontend sau này. Chuyển qua Bước 4.

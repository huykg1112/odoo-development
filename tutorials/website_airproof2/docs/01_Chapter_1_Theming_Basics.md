# Thực hành Odoo 18.0 Theme - Phase 1: Nền tảng & Theming Basics

Dựa trên tài liệu: [Chapter 1 - Theming](https://www.odoo.com/documentation/18.0/developer/tutorials/website_theme/01_theming.html)

Trong bài học này, chúng ta sẽ bắt đầu tạo một module giao diện (Theme) cho Odoo. Trong Odoo, một "Theme" thực chất chỉ là một module thông thường nhưng được cấu hình đặc biệt để hệ thống nhận diện nó là giao diện cho ứng dụng Website.

## 1. Cấu trúc thư mục ban đầu

Tạo thư mục module `website_airproof` (bạn có thể thay thế bằng `theme_airproof_practice` nếu muốn theo sát thực hành). Cấu trúc ban đầu:

```text
website_airproof/
├── __init__.py
└── __manifest__.py
```

- `__init__.py`: Giữ trống. Trong các theme cơ bản, chúng ta chỉ thao tác với XML, SCSS và JS tĩnh nên không cần code Python khởi tạo module này.

## 2. Viết file Manifest (`__manifest__.py`)

File manifest là nơi khai báo module với hệ thống Odoo.

```python
{
    'name': 'Airproof Theme',
    'description': 'Airproof Theme - Drones, modelling, camera',
    # Quan trọng: Định nghĩa category là Website/Theme để hệ thống
    # hiển thị module này trong danh sách "Lựa chọn Theme", thay vì Apps.
    'category': 'Website/Theme',
    'version': '18.0.1.0',
    'author': 'Odoo S.A.',
    'license': 'LGPL-3',
    # Khai báo các module phụ thuộc:
    # website_sale: Hỗ trợ eCommerce
    # website_sale_wishlist: Hỗ trợ danh sách mong muốn
    # website_blog: Hỗ trợ Blog
    # website_mass_mailing: Hỗ trợ Email Marketing (Newsletter)
    'depends': ['website_sale', 'website_sale_wishlist', 'website_blog', 'website_mass_mailing'],
    
    # Nơi nạp các file dữ liệu (Views, Menus, Options, ...)
    'data': [
    ],
    
    # Nơi cấu hình các file tĩnh tĩnh (CSS/SCSS, JS)
    'assets': {
    },
    
    # Tính năng mới từ Odoo 16+: Định nghĩa các template cho phần tạo trang mới (Trang dịch vụ, Giới thiệu...)
    'new_page_templates': {
        'airproof': {
            'services': ['s_parallax', 's_airproof_key_benefits_h2', 's_call_to_action', 's_airproof_carousel']
        }
    },
}
```

### Phân tích chi tiết:
1. **`category`: `'Website/Theme'`**: Đây là yếu tố then chốt nhất. Nếu không có dòng này, module của bạn sẽ nằm trong kho Ứng dụng (Apps) bình thường. Khai báo category này giúp module xuất hiện ở giao diện **Webiste > Configuration > Settings > Choose a Theme**.
2. **`depends`**: Module giao diện thường sẽ tuỳ biến (override) lại các views của eCommerce, Blog hoặc Newsletter. Do đó, bạn phải khai báo các module này vào mục `depends` để Odoo nạp chúng trước, sau đó mới nạp Theme của bạn ở sau cùng để đè lên.
3. **`new_page_templates`**: Khi người dùng nhấn nút "+ New > Page" từ công cụ Website Builder xây dựng front-end, Odoo sẽ hỏi họ muốn tạo loại trang gì (About us, Services, Pricing...). Dictionary này cho phép bạn đăng ký các mẫu trang mới cho theme của bạn. Ý nghĩa đoạn code: Tạo danh mục `airproof`, thêm tuỳ chọn loại trang `services` với dàn bố cục gồm chứa các snippet do bạn quy định.

## Tổng kết Phase 1
Bạn đã hoàn thành việc khởi tạo một bộ khung trống nhưng đầy đủ chuẩn mực để Odoo hiểu đây là một Theme và nó có tác động đến những module nào (Sale, Blog...). Chuyển sang Phase 2, chúng ta sẽ bắt đầu "đổ bê tông" cho website bằng cách tạo Sitemap và thiết kế Homepage.

# Thực hành Odoo 18.0 Theme - Phase 2: Sitemap & Trang Chủ

Dựa trên tài liệu: [Chapter 2 - Build your website](https://www.odoo.com/documentation/18.0/developer/tutorials/website_theme/02_build_website.html)

Trong giai đoạn này, chúng ta sẽ bắt đầu xây dựng cấu trúc của website bao gồm cấu hình giao diện mặc định, tạo menu và xây dựng nội dung cho trang chủ. Bạn nên tạo các file này trong thư mục `data/` của module.

## 1. Cài đặt các tuỳ chọn mặc định của Theme (`data/website.xml`)

Trong Odoo, nhiều tham số của giao diện được lưu trong thư viện cấu hình (chẳng hạn layout, màu sắc khởi tạo, định dạng logo...). Chúng ta có thể ghi đè chúng thông qua XML.

Tạo file `data/website.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="1">
        <!-- Nạp bộ font chữ (Google Fonts) được sử dụng mặc định -->
        <record id="theme_fonts" model="theme.utils">
            <field name="theme_id" ref="base.theme_default"/>
            <field name="font_family">Odoo Unicode Support Noto, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol</field>
        </record>
    </data>
</odoo>
```
*Giải thích:*
- Thẻ `<data noupdate="1">`: Chỉ ghi dữ liệu này vào CSDL một lần duy nhất lúc cài module. Khi module cập nhật (upgrade), file này sẽ không bị ghi đè, giúp không làm mất những thay đổi của người dùng trên web.

## 2. Tạo Sitemap qua Menus (`data/menu.xml`)

Website cần có thanh điều hướng (header menu). Chúng ta sẽ tạo một menu "Products" trỏ đến phần trang cửa hàng (`/shop`).

Tạo file `data/menu.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="1">
        <!-- Tạo một Menu Item -->
        <record id="airproof_menu_shop" model="website.menu">
            <field name="name">Shop Airproof</field>
            <!-- URL mà menu sẽ chuyển hướng tới -->
            <field name="url">/shop</field>
            <!-- Chỉ định parent_id trỏ về menu chính mặc định của website -->
            <field name="parent_id" search="[
                ('website_id', '=', 1), 
                ('name', '=', 'Top Menu')
            ]"/>
            <!-- Vị trí thứ tự hiển thị -->
            <field name="sequence" type="int">20</field>
            <field name="website_id" type="int">1</field>
        </record>
    </data>
</odoo>
```
*Giải thích:* 
Đoạn mã trên tự động thêm một mục có tên "Shop Airproof" (dẫn đến `/shop`) vào thanh Menu chính ở sát trên cùng (Top Menu). Khối `<field name="parent_id" search="...">` giúp tự dò tìm ID của Top Menu mặc định (ID thường không cố định tuỳ bản cài đặt, nên phải dùng hàm search thay vì gán cứng ID).

## 3. Khai báo Trang Chủ (`data/pages/home.xml`)

Một hệ thống quản trị nội dung CMS lưu trữ các View HTML trong CSDL thay vì ở file cục bộ. Vậy ta tạo trang chủ bằng cách push (đẩy) record lên bảng `website.page`.

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="1">
        <!-- 1. Cấu hình View (Phần cấu trúc HTML/QWeb QWeb) -->
        <record id="airproof_home_page_template" model="ir.ui.view">
            <field name="name">Airproof Home Page</field>
            <!-- Kiểu dữ liệu QWeb -->
            <field name="type">qweb</field>
            <!-- Website view key -->
            <field name="key">website_airproof.home</field>
            <field name="arch" type="xml">
                <!-- t-call="website.layout" gọi bộ khung tổng của trang (bao gồm Header và Footer chung) -->
                <t t-name="website_airproof.home">
                    <t t-call="website.layout">
                        <!-- Phần thân trang wrap bên trong khu vực #wrap -->
                        <div id="wrap" class="oe_structure oe_empty">
                            
                            <!-- Bắt đầu đưa các Snippets mặc định vào trang chủ -->
                            <!-- Snippet 1: Banner Parallax -->
                            <section class="s_parallax s_parallax_is_muting s_parallax_is_muting oe_custom_bg pt240 pb240" data-scroll-background-ratio="1" data-snippet="s_parallax" data-name="Parallax Banner">
                                <div class="container container-fluid">
                                    <div class="row align-items-center">
                                        <div class="col-lg-6">
                                            <h1>Bầu trời là giới hạn</h1>
                                            <p class="lead">Khám phá thế giới trên cao với góc nhìn hoàn toàn mới.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            
                            <!-- Thêm các block cấu trúc khác tương tự class s_... của bootstrap tại đây... -->

                        </div>
                    </t>
                </t>
            </field>
        </record>

        <!-- 2. Cấu hình Page (Định tuyến của URL) -->
        <record id="airproof_home_page" model="website.page">
            <field name="name">Home</field>
            <!-- Đường dẫn URL để truy cập -->
            <field name="url">/</field>
            <!-- Khai báo trang này thuộc về View template nào được định nghĩa phía trên -->
            <field name="view_id" ref="airproof_home_page_template"/>
            <field name="track">True</field>
            <field name="is_published">True</field>
        </record>
    </data>
</odoo>
```

### Phân tích việc tạo trang:
Tạo 1 trang mới trong Odoo luôn đòi hỏi kết hợp cấu hình 2 Record ở 2 Model:
1. **Model `ir.ui.view`**: Chứa toàn bộ nội dung HTML (cấu trúc hình ảnh, thẻ div, lưới cột...). Bạn nên đặt class `oe_structure oe_empty` vào thẻ `div#wrap` chính. Class này biến `div` đó thành một vùng "Drag & Drop", cho phép người dùng kéo thả các khối block mới vào trong đó khi thao tác ở Website Builder.
2. **Model `website.page`**: Đóng vai trò là hệ thống "Định tuyến" (Routing Router). Cung cấp `url` ("/") để khi người dùng gõ `tensite.com/`, Odoo sẽ lấy thông tin từ `view_id` tương ứng lên để render.

Đừng quên khai báo tất cả các file XML này vào `data: []` list ở file `__manifest__.py` theo thứ tự tuỳ thuộc vào cấp bậc logic nhé. Giai đoạn 2 kết thúc, bạn có một website với menu hoạt động và trang chủ mẫu hiện ra màn hình. Chuyển sang Phase 3, làm đẹp cho chúng.

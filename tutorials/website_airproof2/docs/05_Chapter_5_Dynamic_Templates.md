# Thực hành Odoo 18.0 Theme - Phase 5: Ghi đè Template Động (Dynamic Templates)

Dựa trên tài liệu: [Chapter 5 - Dynamic templates](https://www.odoo.com/documentation/18.0/developer/tutorials/website_theme/05_dynamic_templates.html)

Một Theme không chỉ thiết kế các block tĩnh (Home, About Us) mà còn làm đẹp cho các giao diện quản trị hiển thị dữ liệu Hệ thống (Sản phẩm trong kho, bài viết Blog). Giai đoạn này tập trung vào kỹ năng QWeb Inheritance để "độ" giao diện của E-commerce (module `website_sale`).

## 1. Bản chất QWeb Templates trong Odoo

Mọi dòng code render trang Web của Odoo (HTML+Python Logic) đều được điều khiển bởi ngôn ngữ QWeb. Dữ liệu (VD: danh sách đồ điện tử) được xử lý ở backend (Python Controller), sau đó đẩy sang khung mẫu QWeb (Template) để biến thành luồng ký tự HTML trả về cho người dùng.

Để đổi giao diện trang Shop, chúng ta KHÔNG viết lại tính năng lôi dữ liệu. Chúng ta chỉ "kế thừa" lại Template render HTML và chèn thêm HTML class mới.

## 2. Ghi đè giao diện Cửa hàng (Shop Page)

Tạo file `views/website_sale_templates.xml`. Ở đây ta nhắm mục tiêu vào lưới danh sách (Grid list) sản phẩm.
Template đích xác cần thay trong `website_sale` là `website_sale.products_item`.

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Tạo một template, định nghĩa inherit_id trỏ về đúng ID của module mẹ website_sale -->
    <template id="airproof_products_item" inherit_id="website_sale.products_item" name="Airproof Products Item">
        
        <!-- 1. Dùng xpath để tìm vị trí muốn sửa. Tại đây ta tìm thẻ có div mang class 'oe_product_image' -->
        <xpath expr="//div[hasclass('oe_product_image')]" position="attributes">
            <!-- Xoá bỏ đi style viền hoặc chiều cao ban đầu nếu không phù hợp -->
            <!-- Mẹo: Dùng position="attributes" để chèn/sửa/xoá attribute HTML thay vì nội dung bên trong -->
            <!-- ... -->>
        </xpath>
        
        <!-- 2. Tìm thẻ mô tả thông tin (tên sản phẩm, giá) thay đổi cấu trúc padding/margin -->
        <xpath expr="//div[hasclass('o_wsale_product_information')]" position="replace">
            <!-- Thay vì dùng position="attributes", ta dùng replace để XÓA HOÀN TOÀN div cũ và render cụm Div mới do ta quyết định -->
            <div class="o_wsale_product_information card-body custom-airproof-padding">
                <div class="o_wsale_product_information_text">
                    <!-- Gọi hàm nội bộ cũ để in Tên sản phẩm, đánh giá sao -->
                    <h6 class="o_wsale_products_item_title mb-2">
                        <a t-att-href="product_href" itemprop="name" t-field="product.name" contenttarget="_blank" />
                    </h6>
                </div>
                <!-- Chỗ đặt Button giỏ hàng -->
                <div class="o_wsale_product_btn"/>
            </div>
        </xpath>
    </template>
</odoo>
```

### Các phương thức XPath (position):
- `inside`: Nhét vào trong thẻ.
- `before`: Đặt mã HTML lên ngay phía trên thẻ cần tim.
- `after`: Đặt mã HTML xuống ngay phía dưới.
- `replace`: Vứt cái thẻ kia đi, thay bằng cục HTML mình truyền vào.
- `attributes`: Thêm/xoá thuộc tính HTML (vd: xoá class `col-12` để chèn class `col-6`).

## 3. Ghi đè Trang Chi tiết Sản phẩm (Product Page)

Tương tự, để thay đổi khu vực "Mô tả" hoặc "Hình ảnh Slider" của từng sản phẩm riêng lẻ, ta can thiệp vào trang `website_sale.product`.

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <template id="airproof_product_page" inherit_id="website_sale.product" name="Airproof Product Details">
        
        <!-- Ví dụ đổi vị trí hiển thị thanh Breadcrumb của module gốc -->
        <xpath expr="//section[@id='product_detail']//div[hasclass('row')][1]" position="before">
            <div class="container custom-product-header">
                <h2>Chi tiết thiết bị bay siêu tốc.</h2>
            </div>
        </xpath>
        
        <!-- Thêm một block Cam kết/Bảo hành ở dưới nút "Add to Cart" -->
        <xpath expr="//a[@id='add_to_cart']" position="after">
            <div class="alert alert-info mt-3" role="alert">
                 Cam kết bảo hành 12 tháng - Lỗi đổi mới!
            </div>
        </xpath>
    </template>
</odoo>
```

Quá trình "Theming" các template động yêu cầu developer dùng Developer Tools (F12) trên trình duyệt, soi thật kỹ ID và cấu trúc class của Template Odoo Base (Gốc), sau đó vào source code `website_sale/views` để xác thực, tiếp đó mới được code nội dung file inherit trong module theme của mình.

Nắm được nguyên lý hoạt động của `dynamic templates` xong, bạn có toàn quyền chỉnh mặt mũi bất kỳ một module ứng dụng nào của Odoo được cài vào cho khách hàng (ví dụ: màn hình My Account, màn hình Thanh Toán...).

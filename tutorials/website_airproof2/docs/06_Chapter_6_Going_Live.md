# Thực hành Odoo 18.0 Theme - Phase 6: Tài nguyên Mặc định và Đóng Gói (Going Live)

Dựa trên tài liệu: [Chapter 6 - Going live](https://www.odoo.com/documentation/18.0/developer/tutorials/website_theme/06_going_live.html)

Một bản giao diện mẫu chuẩn ngoài code, thì nội dung đồ hoạ cũng phải đẹp và có sẵn để người dùng tải lên phát là có demo chất lượng. Bài viết cuối cùng này sẽ hướng dẫn cách load các bức ảnh và kỹ thuật cấu hình ảnh shape nền.

## 1. Upload thư mục tài nguyên (`static/`)

Thông thường các hình ảnh, video của website sẽ được vứt vào thư mục `static/img` hoặc trực tiếp để ngoài. Ví dụ ảnh banner `airproof-home-page.jpg`. Bạn hãy để trong module của bạn. Tuy nhiên chỉ ném vào đó thì hình vẫn chưa hiểu là thuộc quyền quản lý của website. Odoo dùng một cơ chế attachment để cache.

## 2. Load Images vào Cơ sở dữ liệu (`data/images.xml`)
Khi cài giao diện, bạn muốn ảnh được nạp ngay lập tức lên bảng đính kèm (Attachments) để Snippet có thể truy xuất.

Tạo file `data/images.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <data noupdate="1">
        <!-- Khai báo file Hình ảnh để Odoo chép chúng từ module tạo thành attachment -->
        
        <!-- Ảnh Background Trang chủ -->
        <record id="airproof_home_bg" model="ir.attachment">
            <!-- Tên sẽ hiển thị trong Media Library của Odoo -->
            <field name="name">Airproof: Home Background</field>
            <!-- Định vị URL tĩnh của module để Odoo fetch -->
            <field name="url">/website_airproof/static/airproof-home-page.jpg</field>
            <field name="type">url</field>
            <field name="res_model">ir.ui.view</field>
            <field name="public" eval="True"/>
        </record>
        
        <!-- Cứ thế tạo record tương tự với các bức hình còn lại -->
    </data>
</odoo>
```

Tốt hơn, ta quay lại `data/pages/home.xml`, ở chỗ background ta đổi lại dùng đường dẫn `/website_airproof/static/airproof-home-page.jpg`.

## 3. Quản lý Shapes SVG (`data/shapes.xml`)

Odoo cung cấp hệ thống Shape lượn sóng (Shape Divider) dùng ảnh vector. Khi tạo theme, bạn hoàn toàn có thể nhúng các SVG tuỳ biến cho module của bạn. Đây là một mảng dữ liệu riêng chứ không nằm trong file attachment thường.

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Khai báo thêm Shapes vào bộ sưu tập Shapes của Odoo -->
    <template id="custom_airproof_shapes" name="Airproof Wave Shapes" inherit_id="website.we_shape">
        <!-- xpath vào option chọn hình khối -->
        <xpath expr="//we-select[@data-name='shape_img']" position="inside">
            <!-- Thêm icon Waves cho module của ta, dẫn về web path -->
            <we-button data-select-data-val="/website_airproof/static/shape-waves.svg" data-name="airproof_wave" title="Airproof Wavy Shape"/>
        </xpath>
    </template>
</odoo>
```

Khác với ảnh Jpeg bình thường, SVG dùng cho shape có thể tự đổi mã màu tuỳ theo mảng biến màu Theme Color mà người dùng đang chọn. (Tính năng này yêu cầu chỉnh sửa kỹ thuật SVG gốc cho trùng khớp với thông số fill của Odoo).

## 4. Công việc Đóng gói và Deploy

1. Sau khi chuẩn bị toàn bộ file XML. Xem lại một lần nữa list `data: []` trong `__manifest__.py`. Hãy chắc chắn rằng `website.xml` hoặc `images.xml` đứng trước `home.xml` (do giao diện phải load ảnh ra trước rồi qweb mới lấy ra render).
2. Hãy chắc chắn rằng icon module bạn đã cài vào thư mục `static/description/icon.png`.
3. Kiểm tra biến môi trường phiên bản `'version': '18.0.1.0'`.
4. ZIP thư mục `website_airproof` lại.
5. Cài đặt trực tiếp lên hệ thống Apps của mình.
6. Chuyển sang Website, bấm nút Chỉnh sửa / Themes (Bảng màu) đê kéo xuống chọn Airproof.

## Lời Kết
Qua chuỗi 6 giai đoạn, bạn đã nắm vững toàn bộ kiến trúc lõi của việc Odoo Theme vận hành ra sao: Từ cấu hình khung sườn (`manifest`), bóc tách kế thừa `views/CSS/JS`, thiết kế Custom Block cho người thiết kế (Kéo 1 block vào ra 1 cấu trúc Bootstrap phức tạp tuỳ ý). Cuối cùng là can thiệp sửa bố cục của module E-Commerce `website_sale` mà không làm chết lỗi logic Python dưới lòng đất. Chúc bạn vận dụng tốt vào việc làm Theme cho **Phòng Khám Hoàn Hảo**.

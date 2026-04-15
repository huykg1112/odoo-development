# Thực hành Odoo 18.0 Theme - Phase 4: Tạo Custom Snippets

Dựa trên tài liệu: [Chapter 4 - Customisation, Part II](https://www.odoo.com/documentation/18.0/developer/tutorials/website_theme/04_customisation_part2.html)

Một Theme Odoo đúng nghĩa không chỉ đổi màu và font, mà phải cung cấp một thư viện các khối giao diện (Snippets) được thiết kế đặc thù cho ngành nghề đó để kéo thả vào khung. Trong bài này, ta sẽ tạo snippet Carousel (Danh sách nội dung dạng vuốt cuộn).

## 1. Cơ chế Tạo một Snippet 
Có 4 bước cốt lõi để khởi tạo thành công 1 snippet hoàn toàn mới:
1. Tạo một tệp HTML/XML khai báo View dạng Public cho nó.
2. Thăng cấp nó thành Snippet hoạt động được để đưa vào Sidebar Editor bằng cách inject nó vào template `website.snippets`.
3. Cung cấp chức năng cho người dùng tuỳ biến UI Snippet bằng "Options".
4. Viết CSS/Javascript (JS là bắt buộc khi Snippet có tương tác động ví dụ như slider).

## 2. Thiết kế HTML View Block (`views/snippets/s_airproof_carousel.xml`)

Tạo tệp XML để chứa code HTML của Snippet:

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Template chính chứa mã nguồn HTML của Snippet -->
    <!-- Đặt tên luôn nhớ tiền tố s_ (viết tắt của Snippet) -->
    <template id="s_airproof_carousel" name="Airproof Carousel">
        <section class="s_airproof_carousel pt32 pb32">
            <div class="container container-custom">
                <!-- Khu vực bao ngoài JS móc nối -->
                <div class="row align-items-center">
                    <div class="col-lg-6">
                        <h2>Sản phẩm nổi bật</h2>
                        <p>Danh sách các thiết bị tối tân nhất hiện nay.</p>
                    </div>
                    <!-- Đây là nơi băng chuyền sẽ trượt qua -->
                    <div class="col-lg-6 slider-wrapper">
                        <!-- Nội dung mock tĩnh nằm ở đây -->
                        <div class="card item">
                             Drone 1...
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </template>
</odoo>
```

Tiếp theo, phải inject (Nhúng) cái Template này vào khung công cụ Kéo Thả (Snippets Sidebar) bằng XML inheritance:

```xml
    <!-- Thêm snippet s_airproof_carousel vào thanh menu của Website Builder -->
    <template id="airproof_snippets" inherit_id="website.snippets" name="Airproof Snippets">
        <!-- Chèn snippet mới vào bên trong khối chức năng Dymanic Content (xpath expr) -->
        <xpath expr="//t[@id='website_snippets']//div[@id='snippet_dynamic_content']" position="inside">
            <t t-snippet="website_airproof.s_airproof_carousel" t-thumbnail="/website_airproof/static/src/snippets/s_airproof_carousel/000.png" />
        </xpath>
    </template>
```

Trong đó: `t-snippet` là gọi tới id `s_airproof_carousel` nằm trong module `website_airproof`. `t-thumbnail` là hình ảnh minh hoạ hiển thị trong thanh kéo thả bên tay phải.

## 3. Options cho Snippet (`views/snippets/options.xml`)

Khi người dùng đã kéo thả block ra, họ click vào block, làm menu "tuỳ biến" sẽ hiện nằm dọc bên phải. Menu tuỳ biến này gọi là Options Panel. Để thêm quyền thay hình nền, căn chỉnh màu sắc, ta tạo file `options.xml`.

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <template id="s_airproof_carousel_options" inherit_id="website.snippet_options">
        <xpath expr="." position="inside">
            
            <!-- Target chính xác tới selector css của thẻ Section Snippet mà ta vừa tạo -->
            <div data-js="AirproofCarouselOption" data-selector=".s_airproof_carousel">
                
                <!-- Bố trí các lựa chọn giao diện đồ họa. (Ví dụ: Tuỳ chọn Background color thuộc tính của Bootstrap) -->
                <we-colorpicker string="Màu nền" title="Background Color" data-select-class="bg-o-color-1|bg-o-color-2|bg-o-color-5" data-css-property="background-color"/>
                
                <!-- Tuỳ chọn hiển thị Fullscreen mode hay thu gọn bằng attribute  -->
                 <we-checkbox string="Chế độ toàn màn hình" data-select-class="container-fluid" data-remove-class="container"/>
                 
            </div>
        </xpath>
    </template>
</odoo>
```
*Ghi chú Cú Pháp:*
Thẻ `<we-...>` là các UI Component Odoo hỗ trợ tự động build Options trong Sidebar.
- `we-colorpicker`: Gen ra bảng chọn màu.
- `we-checkbox`: Gen ra nut gặt bật tắt. Khi gạt bật, phần mềm tự thêm CSS `container-fluid` vào class Snippet, lúc tắt nó sẽ gỡ `container-fluid` đẩy vào `container`.

## 4. JS Script và CSS Styles
Bạn viết style cho Carousel trong tệp `website_airproof/static/src/snippets/s_airproof_carousel/000.scss`

Nếu snippet cần gọi Owl Component để kéo danh sách record thật, ta sẽ cần file Javascript, điều này tương đương với học Owl framework sẽ không nằm trong phạm vi tài liệu này. Đừng quên nạp chúng vào block `web.assets_frontend` tại `__manifest__.py`.

Kết thúc Phase 4, bạn đã nắm được kỹ thuật kéo thả và tạo Custom Options cho Blocks. Mọi Theme trên Store Odoo đều sống dựa vào cấu trúc Snippet Custom Option này.

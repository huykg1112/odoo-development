# Odoo Website Editor Widgets (we-*) - Tài Liệu Chi Tiết

## 1) Phạm vi và cách đọc tài liệu

Tài liệu này được tổng hợp từ source thực tế trong:
- `odoo/addons/website/views/**/*.xml`
- đối chiếu thêm với:
  - `odoo/addons/web_editor/views/snippets.xml`
  - `odoo/addons/web_editor/views/editor.xml`

Mục tiêu: liệt kê đầy đủ các widget UI editor đang được dùng trong Website views, giải thích:
- Dùng để làm gì
- Dùng khi nào
- Các thành phần bên trong (children, data-*)
- Cách dùng đúng chuẩn

## 2) Tổng quan cơ chế Website Snippet Options

Một khối option thường có dạng:

```xml
<div data-js="TenOptionClass" data-selector=".css_selector_muc_tieu" data-target="...">
    <we-select string="..."></we-select>
    <we-input string="..."></we-input>
</div>
```

Ý nghĩa:
- `data-selector`: chọn snippet/element gốc để bind option.
- `data-target`: target con bên trong snippet (nếu cần).
- `data-js`: class option xử lý hành vi (trong JS options registry).

Nhóm thuộc tính quan trọng dùng chung:
- Nhóm target/áp dụng:
  - `data-apply-to`
  - `data-target`
- Nhóm cập nhật style/class:
  - `data-select-style`
  - `data-css-property`
  - `data-select-class`
- Nhóm cập nhật attribute/dataset:
  - `data-attribute-name`
  - `data-select-data-attribute`
  - `data-select-attribute`
- Nhóm trạng thái/UI:
  - `data-name`
  - `data-dependencies`
  - `data-no-preview`

## 3) Danh sách đầy đủ widget trong website/views

Kết quả quét source cho thấy 23 widget:
- `we-alert`
- `we-button`
- `we-button-group`
- `we-checkbox`
- `we-collapse`
- `we-colorpicker`
- `we-datepicker`
- `we-datetimepicker`
- `we-divider`
- `we-fontfamilypicker`
- `we-gpspicker`
- `we-imagepicker`
- `we-input`
- `we-list`
- `we-many2many`
- `we-matrix`
- `we-multi`
- `we-range`
- `we-row`
- `we-select`
- `we-title`
- `we-urlpicker`
- `we-videopicker`

## 4) Catalog chi tiết từng widget

### 4.1) we-alert
Dùng để làm gì:
- Hiển thị thông báo/cảnh báo trong panel options.

Dùng khi nào:
- Cần cảnh báo user về hành vi bị khóa, field bắt buộc, trạng thái cũ, ...

Thành phần:
- Thường chỉ là text/HTML bên trong.

Thuộc tính hay gặp:
- `class`

Ví dụ source:
- `odoo/addons/website/views/snippets/s_website_form.xml` (khối cảnh báo field bắt buộc)
- `odoo/addons/website/views/snippets/s_instagram_page.xml`

---

### 4.2) we-button
Dùng để làm gì:
- Action button có một hành động rõ ràng: add/remove/switch/set value.

Dùng khi nào:
- Muốn kích hoạt một thao tác ngay lập tức (không cần dropdown).

Thành phần:
- Inner text hoặc icon.
- Đặt trong `we-select`, `we-row`, `we-button-group` hoặc dùng độc lập.

Thuộc tính hay gặp (rất nhiều):
- Chọn class/style/data: `data-select-class`, `data-select-style`, `data-select-data-attribute`
- Action: `data-add-*`, `data-remove-*`, `data-toggle-*`, `data-customize-*`, `data-reload`
- Trạng thái: `data-name`, `data-dependencies`, `data-no-preview`
- Trình bày: `title`, `data-img`, `data-icon`, `class`

Ví dụ source:
- `odoo/addons/website/views/snippets/snippets.xml` (xuyên suốt toàn bộ options)

---

### 4.3) we-button-group
Dùng để làm gì:
- Gom nhóm nút có ý nghĩa cùng cấp độ (Alignment, Shadow, Layout...).

Dùng khi nào:
- Có ít lựa chọn ngang hàng, user cần nhìn nhanh icon/layout.

Thành phần:
- Chứa nhiều `we-button`.

Thuộc tính hay gặp:
- `string`, `title`, `data-apply-to`, `data-dependencies`, `data-name`, `data-no-preview`
- Một số option chuyên biệt: `data-shadow-class`, `data-imagepicker`

Ví dụ source:
- `odoo/addons/website/views/snippets/snippets.xml` (Shadow, Vertical Alignment, Add Elements)
- `odoo/addons/website/views/snippets/s_website_form.xml` (Label Position)

---

### 4.4) we-checkbox
Dùng để làm gì:
- Bật/tắt 1 tính năng hoặc 1 class/attribute.

Dùng khi nào:
- Option boolean: on/off, show/hide, required/not required.

Thành phần:
- Thường là self-closing, có label qua `string`.

Thuộc tính hay gặp:
- `data-select-class`, `data-select-style`, `data-select-attribute`, `data-select-data-attribute`
- `data-attribute-name`, `data-apply-to`
- `data-toggle-*` (toggle behavior), `data-dependencies`, `data-no-preview`

Ví dụ source:
- `odoo/addons/website/views/snippets/s_chart.xml` (Tooltip, Stacked)
- `odoo/addons/website/views/snippets/s_website_form.xml`

---

### 4.5) we-collapse
Dùng để làm gì:
- Tạo nhóm option có thể collapse/expand.

Dùng khi nào:
- Option nhiều cấp, cần giảm rối panel.

Thành phần:
- Chứa `we-row`, `we-input`, `we-select`, ... bên trong.

Thuộc tính hay gặp:
- `string`, `class`

Ví dụ source:
- `odoo/addons/website/views/snippets/snippets.xml` (Conditional Visibility, Theme sections)

---

### 4.6) we-colorpicker
Dùng để làm gì:
- Chọn màu text/background/border/variable/theme.

Dùng khi nào:
- Cần đổi màu theo style inline, class prefix, hoặc CSS variable.

Thành phần:
- Color tabs, custom color, gradients (hệ thống colorpicker của web_editor).

Thuộc tính hay gặp:
- `data-select-style`, `data-css-property`, `data-apply-to`
- `data-color-prefix`, `data-color`, `data-selected-tab`
- `data-variable`, `data-customize-website-color`
- `data-no-preview`, `data-excluded`, `data-with-gradients`

Ví dụ source:
- `odoo/addons/website/views/snippets/snippets.xml`
- `odoo/addons/website/views/snippets/s_chart.xml`

---

### 4.7) we-datepicker
Dùng để làm gì:
- Chọn ngày cho field date.

Dùng khi nào:
- Option default value/condition cho date.

Thành phần:
- Input date + mapping vào attribute/property.

Thuộc tính hay gặp:
- `data-apply-to`
- `data-attribute-name`
- `data-select-attribute` / `data-select-data-attribute`
- `data-select-value-property`

Ví dụ source:
- `odoo/addons/website/views/snippets/s_website_form.xml`

---

### 4.8) we-datetimepicker
Dùng để làm gì:
- Chọn ngày giờ cho field datetime.

Dùng khi nào:
- DateTime default value, date-time conditional visibility.

Thành phần:
- UI date + time picker.

Thuộc tính hay gặp:
- Giống `we-datepicker`: `data-apply-to`, `data-attribute-name`, ...

Ví dụ source:
- `odoo/addons/website/views/snippets/s_countdown.xml`
- `odoo/addons/website/views/snippets/s_website_form.xml`

---

### 4.9) we-divider
Dùng để làm gì:
- Tách nhóm option trong `we-select` hoặc panel.

Dùng khi nào:
- Có nhóm lựa chọn cần khoảng cách logic.

Thành phần:
- Không cần child.

Thuộc tính hay gặp:
- Thường không có.

Ví dụ source:
- `odoo/addons/website/views/snippets/snippets.xml` (Transition: Slide/Fade/None)

---

### 4.10) we-fontfamilypicker
Dùng để làm gì:
- Chọn font family.

Dùng khi nào:
- Theme typography (paragraph/headings/navbar).

Thành phần:
- Picker font + variable mapping.

Thuộc tính hay gặp:
- `data-variable`, `string`

Ví dụ source:
- `odoo/addons/website/views/snippets/snippets.xml` (Header, Paragraph, Headings)

---

### 4.11) we-gpspicker
Dùng để làm gì:
- Chọn vị trí địa lý/address cho map.

Dùng khi nào:
- Các snippet map (Google map).

Thành phần:
- Input địa chỉ + geocoding + set gps/formatted address.

Thuộc tính hay gặp:
- `data-attribute-name="mapGps"`
- `data-select-data-attribute`
- `data-set-formatted-address`
- `placeholder`, `data-no-preview`

Ví dụ source:
- `odoo/addons/website/views/snippets/s_google_map.xml`

---

### 4.12) we-imagepicker
Dùng để làm gì:
- Chọn/chỉnh hình ảnh (thường cho background).

Dùng khi nào:
- Đổi background image, body background, image assets.

Thành phần:
- Button mở media dialog hoặc picker.

Thuộc tính hay gặp:
- `data-background`, `data-name`, `title`
- Thêm bối cảnh theme: `data-customize-body-bg`

Ví dụ source:
- `odoo/addons/website/views/snippets/snippets.xml`

---

### 4.13) we-input
Dùng để làm gì:
- Nhập giá trị text/number/unit/attribute/property.

Dùng khi nào:
- Cần giá trị tùy biến (width, speed, placeholder, label, min/max, v.v.).

Thành phần:
- Input text/number + optional unit.

Thuộc tính hay gặp:
- `data-select-style` + `data-css-property`
- `data-select-attribute` + `data-attribute-name`
- `data-select-data-attribute`
- `data-apply-to`
- `data-unit`, `data-step`, `data-min`, `data-max`
- `data-dependencies`, `data-no-preview`, `placeholder`

Ví dụ source:
- `odoo/addons/website/views/snippets/s_website_form.xml`
- `odoo/addons/website/views/snippets/snippets.xml`

---

### 4.14) we-list
Dùng để làm gì:
- Quản lý danh sách dynamic item trong option panel.

Dùng khi nào:
- Danh sách social links, entries có thể thêm/xóa/sắp xếp theo item.

Thành phần:
- Danh sách item + control add/remove theo logic JS.

Thuộc tính hay gặp:
- `data-render-list-items`
- `data-has-default`, `data-default-value`
- `data-id-mode`, `data-name`
- `data-new-elements-not-toggleable`
- `data-render-on-input-blur`, `data-no-preview`

Ví dụ source:
- `odoo/addons/website/views/snippets/s_social_media.xml`

---

### 4.15) we-many2many
Dùng để làm gì:
- Chọn nhiều bản ghi (M2M-like) trong option panel.

Dùng khi nào:
- Conditional visibility theo country/language/utm...

Thành phần:
- Picker records + data model/domain/fields.

Thuộc tính hay gặp:
- `data-model`, `data-fields`, `data-domain`, `data-call-with`
- `data-save-attribute`, `data-attribute-name`
- `data-select-record`, `data-allow-delete`, `data-fakem2m`
- `data-no-preview`, `data-dependencies`

Ví dụ source:
- `odoo/addons/website/views/snippets/snippets.xml` (snippet_options_conditional_visibility)

---

### 4.16) we-matrix
Dùng để làm gì:
- Biểu diễn/chỉnh sửa dữ liệu ma trận (hàng/cột), thường cho chart.

Dùng khi nào:
- Các option cần bảng dữ liệu 2 chiều.

Thành phần:
- Chứa table, bên trong dùng `we-button` để thêm row/column.

Thuộc tính hay gặp:
- Hiện tại trong website views dùng khá tối giản (không đặt nhiều data-* trên tag này).

Ví dụ source:
- `odoo/addons/website/views/snippets/s_chart.xml`

---

### 4.17) we-multi
Dùng để làm gì:
- Gom nhiều input con để map vào 1 CSS property tổng hợp.

Dùng khi nào:
- Các property nhiều thành phần như `box-shadow`, `background-size`.

Thành phần:
- Bên trong thường có `we-input`, `we-colorpicker`, `we-row`, `we-checkbox`.

Thuộc tính hay gặp:
- `data-css-property`
- `data-dependencies`

Ví dụ source:
- `odoo/addons/website/views/snippets/snippets.xml` (shadow options)

---

### 4.18) we-range
Dùng để làm gì:
- Slider/chọn giá trị theo khoảng.

Dùng khi nào:
- Intensity, spacing, opacity, dimensions, range value.

Thành phần:
- Thanh trượt + value display.

Thuộc tính hay gặp:
- `data-min`, `data-max`, `data-step`
- `data-css-property` hoặc `data-attribute-name`
- `data-select-style` hoặc `data-select-data-attribute`
- `data-display-range-value`, `data-display-range-value-unit`
- `data-dependencies`, `data-no-preview`

Ví dụ source:
- `odoo/addons/website/views/snippets/snippets.xml`
- `odoo/addons/website/views/snippets/s_image_gallery.xml`

---

### 4.19) we-row
Dùng để làm gì:
- Hàng layout trong panel option, để nhóm widget theo 1 dòng.

Dùng khi nào:
- Cần bố trí nhiều widget cạnh nhau (vd 2 input X/Y).

Thành phần:
- Chứa bất kỳ `we-*` con.

Thuộc tính hay gặp:
- `string`, `class`, `title`, `data-name`, `data-no-preview`

Ví dụ source:
- `odoo/addons/website/views/snippets/snippets.xml`
- `odoo/addons/website/views/snippets/s_website_form.xml`

---

### 4.20) we-select
Dùng để làm gì:
- Tạo bộ lựa chọn gồm nhiều `we-button`.

Dùng khi nào:
- Chọn 1 trong nhiều mode/style/type.

Thành phần:
- Child bắt buộc gần như luôn là `we-button`.
- Có thể chứa `we-divider` để tách nhóm.

Thuộc tính hay gặp:
- target: `data-apply-to`
- update attribute: `data-attribute-name`, `data-select-data-attribute`
- style/class: thông qua `we-button` (`data-select-style`, `data-select-class`)
- state: `data-name`, `data-dependencies`, `data-no-preview`

Ví dụ source:
- `odoo/addons/website/views/snippets/snippets.xml`
- `odoo/addons/website/views/snippets/s_google_map.xml`

---

### 4.21) we-title
Dùng để làm gì:
- Tiêu đề nhỏ trong panel option.

Dùng khi nào:
- Chia section, đặt nhãn để đọc panel rõ hơn.

Thành phần:
- Text title, có thể là child trong row/collapse.

Thuộc tính hay gặp:
- Thường không cần data-*, chủ yếu là nội dung text.

Ví dụ source:
- `odoo/addons/website/views/snippets/snippets.xml`
- `odoo/addons/website/views/snippets/s_website_form.xml`

---

### 4.22) we-urlpicker
Dùng để làm gì:
- Chọn URL từ page route/nội bộ/ngoài.

Dùng khi nào:
- Redirect URL, button/link destination.

Thành phần:
- Input + picker trợ giúp route.

Thuộc tính hay gặp:
- `data-select-data-attribute`
- `data-attribute-name`
- `data-name`, `data-dependencies`
- `placeholder`

Ví dụ source:
- `odoo/addons/website/views/snippets/s_website_form.xml`
- `odoo/addons/website/views/snippets/s_countdown.xml`

---

### 4.23) we-videopicker
Dùng để làm gì:
- Chọn/chỉnh background video.

Dùng khi nào:
- Snippet support video background.

Thành phần:
- Video source picker (qua media dialog).

Thuộc tính hay gặp:
- `data-background`
- `data-name`
- `data-dependencies`
- `title`

Ví dụ source:
- `odoo/addons/website/views/snippets/snippets.xml` (Background video options)

## 5) Mẫu phối hợp widget đúng chuẩn

Mẫu 1: Chọn class
```xml
<we-select string="Alignment" data-apply-to=".target">
    <we-button data-select-class="text-start">Left</we-button>
    <we-button data-select-class="text-center">Center</we-button>
    <we-button data-select-class="text-end">Right</we-button>
</we-select>
```

Mẫu 2: Chọn style inline
```xml
<we-select string="Font Size" data-apply-to=".target">
    <we-button data-select-style="font-size: 14px;">14px</we-button>
    <we-button data-select-style="font-size: 18px;">18px</we-button>
</we-select>
```

Mẫu 3: Input style property
```xml
<we-input string="Width"
          data-apply-to=".target"
          data-select-style=""
          data-css-property="width"
          data-unit="px"/>
```

Mẫu 4: Toggle bằng checkbox
```xml
<we-checkbox string="Show Description"
             data-toggle-description="true"
             data-no-preview="true"/>
```

## 6) Checklist debug nhanh khi option không hoạt động

1. Kiểm tra `data-selector` có match snippet trên trang không.
2. Kiểm tra `data-apply-to` có tìm thấy child element không.
3. Nếu dùng style:
   - `we-button` trong `we-select` nên dùng `data-select-style` đầy đủ giá trị CSS hoặc dùng cặp `data-select-style` + `data-css-property` đúng chuẩn theo widget.
4. Nếu dùng attribute:
   - Kiểm tra cặp `data-attribute-name` + `data-select-data-attribute`.
5. Kiểm tra `data-dependencies` có vô tình ẩn option không.
6. Kiểm tra `data-no-preview` (có thể chỉ apply sau action nhất định).
7. Kiểm tra JS option class (`data-js`) đã đăng ký đúng trong registry chưa.

## 7) Ghi chú quan trọng

- Tài liệu này mô tả các widget được sử dụng thực tế trong Website views của source hiện tại.
- `web_editor` có thêm một số custom tag UI khác (ví dụ pager/page widgets) nhưng không nằm trong danh sách quét của `website/views`.
- Thuộc tính trên mỗi widget là tập hợp thuộc tính bắt gặp trong source, không phải API schema chính thức 1-1 theo docs.

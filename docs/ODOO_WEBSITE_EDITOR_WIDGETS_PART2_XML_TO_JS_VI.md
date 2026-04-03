# Part 2 - Map Widget XML -> JS Handler trong snippets.options.js

## Mục tiêu

Tài liệu này map từng widget `we-*` (đã liệt kê ở Part 1) với JS handler tương ứng để bạn nhìn rõ luồng chạy:
- XML option trong `views/snippets/*.xml`
- dựng widget UI trong `snippets.options.js`
- gọi method option theo `data-*`
- cập nhật DOM snippet target

---

## Tiến trình thực hiện (rõ mốc)

- ✅ Bước 1: Quét toàn bộ `website/views` để chốt danh sách widget thực dùng.
- ✅ Bước 2: Đọc core handler trong `web_editor/static/src/js/editor/snippets.options.js`.
- ✅ Bước 3: Đọc extension của website trong `website/static/src/js/editor/snippets.options.js`.
- ✅ Bước 4: Đối chiếu widget nào có class handler trực tiếp, widget nào chỉ là layout/markup.
- ✅ Bước 5: Tổng hợp thành bảng map + luồng xử lý chi tiết XML -> JS.

---

## 1) Luồng tổng quát XML -> JS

### 1.1 Dựng cây widget từ XML

Trong core `snippets.options.js`:

1. `_renderOriginalXML()`
- clone XML options của snippet
- build trước các layout node đặc biệt (`we-row`, `we-collapse`)

2. `_renderXMLWidgets(parentEl, parentWidget)`
- duyệt từng node
- nếu tag nằm trong `userValueWidgetsRegistry` thì tạo instance widget JS tương ứng
- nếu không nằm trong registry thì chỉ duyệt sâu con

3. `widget.loadMethodsData(validMethodNames)`
- parse toàn bộ `data-*` của node
- key nào trùng tên method của Option class thì được xem là method cần gọi
- key khác đưa vào `params` (ví dụ `applyTo`, `attributeName`, `cssProperty`, `dependencies`, ...)

### 1.2 Khi user thao tác widget

4. Widget phát event `user_value_update` (preview/change/reset)
- qua `notifyValueChange()`

5. Option class nhận event `_onUserValueUpdate` -> gọi `_select(previewMode, widget)`

6. `_select()` chạy tuần tự các method đã map
- ví dụ: `selectClass`, `selectStyle`, `selectDataAttribute`, ...
- mỗi method nhận `(previewMode, widgetValue, params)`

7. Sau khi áp dụng DOM, gọi `updateUI()` để sync lại trạng thái active/visible của toàn bộ widget.

---

## 2) Registry map: widget nào được bind trong snippets.options.js

## 2.1 Core registry (web_editor)

Trong `odoo/addons/web_editor/static/src/js/editor/snippets.options.js` có `userValueWidgetsRegistry` map trực tiếp:

- `we-button` -> `ButtonUserValueWidget`
- `we-checkbox` -> `CheckboxUserValueWidget`
- `we-select` -> `SelectUserValueWidget`
- `we-button-group` -> `ButtonGroupUserValueWidget`
- `we-input` -> `InputUserValueWidget`
- `we-multi` -> `MultiUserValueWidget`
- `we-colorpicker` -> `ColorpickerUserValueWidget`
- `we-datetimepicker` -> `DatetimePickerUserValueWidget`
- `we-datepicker` -> `DatePickerUserValueWidget`
- `we-list` -> `ListUserValueWidget`
- `we-imagepicker` -> `ImagepickerUserValueWidget`
- `we-videopicker` -> `VideopickerUserValueWidget`
- `we-range` -> `RangeUserValueWidget`
- `we-select-pager` -> `SelectPagerUserValueWidget`
- `we-many2one` -> `Many2oneUserValueWidget`
- `we-many2many` -> `Many2manyUserValueWidget`

## 2.2 Website extension registry (website)

Trong `odoo/addons/website/static/src/js/editor/snippets.options.js` có extend thêm:

- `we-urlpicker` -> `UrlPickerUserValueWidget`
- `we-fontfamilypicker` -> `FontFamilyPickerUserValueWidget`
- `we-gpspicker` -> `GPSPicker`

Kết luận quan trọng:
- Nếu bạn chỉ đọc core `web_editor/snippets.options.js` sẽ thiếu 3 widget website-specific ở trên.

---

## 3) Bảng map đầy đủ 23 widget (theo website/views)

| Widget | Handler JS chính | File map | Trạng thái |
|---|---|---|---|
| we-alert | Không có UserValueWidget riêng | XML/Option class xử lý thủ công nếu cần | UI tĩnh/placeholder |
| we-button | ButtonUserValueWidget | web_editor snippets.options.js | Có handler trực tiếp |
| we-button-group | ButtonGroupUserValueWidget | web_editor snippets.options.js | Có handler trực tiếp |
| we-checkbox | CheckboxUserValueWidget | web_editor snippets.options.js | Có handler trực tiếp |
| we-collapse | _buildCollapseElement (layout builder) | web_editor snippets.options.js | Layout container |
| we-colorpicker | ColorpickerUserValueWidget | web_editor snippets.options.js | Có handler trực tiếp |
| we-datepicker | DatePickerUserValueWidget | web_editor snippets.options.js | Có handler trực tiếp |
| we-datetimepicker | DatetimePickerUserValueWidget | web_editor snippets.options.js | Có handler trực tiếp |
| we-divider | Không có UserValueWidget riêng | render như node con trong menu | UI tĩnh |
| we-fontfamilypicker | FontFamilyPickerUserValueWidget | website snippets.options.js | Có handler qua extension |
| we-gpspicker | GPSPicker | website snippets.options.js | Có handler qua extension |
| we-imagepicker | ImagepickerUserValueWidget | web_editor snippets.options.js | Có handler trực tiếp |
| we-input | InputUserValueWidget | web_editor snippets.options.js | Có handler trực tiếp |
| we-list | ListUserValueWidget | web_editor snippets.options.js | Có handler trực tiếp |
| we-many2many | Many2manyUserValueWidget | web_editor snippets.options.js | Có handler trực tiếp |
| we-matrix | Không có UserValueWidget riêng | dùng event trong snippet options riêng | Logic theo snippet |
| we-multi | MultiUserValueWidget | web_editor snippets.options.js | Có handler trực tiếp |
| we-range | RangeUserValueWidget | web_editor snippets.options.js | Có handler trực tiếp |
| we-row | _buildRowElement (layout builder) | web_editor snippets.options.js | Layout container |
| we-select | SelectUserValueWidget | web_editor snippets.options.js | Có handler trực tiếp |
| we-title | _buildTitleElement / label UI | web_editor snippets.options.js | Label UI |
| we-urlpicker | UrlPickerUserValueWidget | website snippets.options.js | Có handler qua extension |
| we-videopicker | VideopickerUserValueWidget | web_editor snippets.options.js | Có handler trực tiếp |

---

## 4) Map method xử lý mặc định (quan trọng nhất)

Các method “xương sống” nằm trong `options.Class` (core):

- `selectClass(previewMode, widgetValue, params)`
- `selectDataAttribute(previewMode, widgetValue, params)`
- `selectAttribute(previewMode, widgetValue, params)`
- `selectProperty(previewMode, widgetValue, params)`
- `selectStyle(previewMode, widgetValue, params)`
- `selectColorCombination(previewMode, widgetValue, params)`

Ý nghĩa thực tế:

1. Nếu XML có `data-select-class="..."` -> chạy `selectClass`
2. Nếu XML có `data-select-data-attribute="..."` + `data-attribute-name` -> chạy `selectDataAttribute`
3. Nếu XML có `data-select-attribute="..."` + `data-attribute-name` -> chạy `selectAttribute`
4. Nếu XML có `data-select-style="..."` + `data-css-property` -> chạy `selectStyle`

Lưu ý:
- Tên method được suy từ key `data-*` sau khi parse dataset (camelCase).
- Chỉ method nào tồn tại trên Option class mới được đưa vào `_methodsNames`.

---

## 5) Map theo nhóm widget bạn hay dùng

### 5.1 Nhóm chọn mode (select/button/button-group)

- `we-select` và `we-button-group` là container chọn 1 trong nhiều `we-button`.
- `we-button` giữ giá trị “active value” cho từng method.
- Khi click button -> notify -> Option class `_select()` -> chạy method tương ứng.

Thường đi với:
- `data-select-class`
- `data-select-style`
- `data-select-data-attribute`

### 5.2 Nhóm nhập liệu (input/range/multi)

- `we-input`: text/number + unit (`data-unit`, `data-save-unit`, `data-step`, `data-min`, `data-max`).
- `we-range`: slider có thể map class/style/attribute.
- `we-multi`: gom nhiều giá trị con (ví dụ `box-shadow`, `background-size`).

### 5.3 Nhóm media

- `we-imagepicker` -> mở media dialog ảnh.
- `we-videopicker` -> mở media dialog video.
- Cả hai kế thừa `MediapickerUserValueWidget`.

### 5.4 Nhóm ngày giờ

- `we-datetimepicker` kế thừa từ `InputUserValueWidget` + tích hợp `datetime_picker` service.
- `we-datepicker` kế thừa lại từ datetime picker với `pickerType = 'date'`.

### 5.5 Nhóm website-specific

- `we-urlpicker` (website extension): input URL + autocomplete page + nút mở tab mới.
- `we-fontfamilypicker` (website extension): select font + thêm/xóa font Google/local.
- `we-gpspicker` (website extension): input GPS/address + Google Places API.

---

## 6) Các widget “không có handler class trực tiếp”

### we-row, we-collapse
- Không nằm trong userValueWidgetsRegistry.
- Được xử lý ở bước build layout:
  - `_buildRowElement`
  - `_buildCollapseElement`

### we-title
- Dùng làm nhãn/title cho widget hoặc section.
- Được tạo/di chuyển trong quá trình build UI (không phải widget value).

### we-divider
- Chủ yếu là node markup phân tách trong menu chọn.
- Không có class handler riêng.

### we-alert
- Không có user value widget riêng.
- Thường được Option class khác query/update theo ngữ cảnh.

### we-matrix
- Không có userValueWidget trong core.
- Logic nằm ở snippet-specific option class, ví dụ:
  - `odoo/addons/website/static/src/snippets/s_chart/options.js`
  - events như `input we-matrix input`, `click we-button.add_row`, ...

---

## 7) Ví dụ luồng thực tế (đọc 1 phát là hiểu)

Ví dụ XML:

```xml
<we-select string="Type" data-attribute-name="mapType">
    <we-button data-select-data-attribute="ROADMAP">RoadMap</we-button>
    <we-button data-select-data-attribute="SATELLITE">Satellite</we-button>
</we-select>
```

Luồng:
1. `we-select` -> `SelectUserValueWidget`
2. `we-button` active value = `ROADMAP` hoặc `SATELLITE`
3. method map được nhận diện là `selectDataAttribute`
4. `_select()` gọi `selectDataAttribute(...)`
5. target DOM cập nhật `dataset.mapType = 'ROADMAP'` (hoặc giá trị khác)
6. Option class snippet (ví dụ GoogleMap) có thể phản ứng thêm nếu có method custom.

---

## 8) Checklist debug Part 2 (khi bạn tự viết option mới)

1. Tag `we-*` có nằm trong `userValueWidgetsRegistry` chưa?
- Nếu chưa: cần extension registry (giống website làm với `we-urlpicker`, `we-fontfamilypicker`, `we-gpspicker`).

2. Dataset key có map thành method hợp lệ không?
- Ví dụ `data-select-style` -> `selectStyle`.
- Method phải tồn tại trên Option class (`options.Class` hoặc class con của `options.registry.*`).

3. `data-attribute-name`, `data-css-property`, `data-apply-to` có đủ không?

4. Với widget đặc thù (`we-matrix`) có event handler riêng trong snippet options JS chưa?

5. `data-dependencies` có làm widget bị ẩn ngoài ý muốn không?

---

## 9) Tài liệu liên quan

- Part 1: `docs/ODOO_WEBSITE_EDITOR_WIDGETS_REFERENCE_VI.md`
- Core engine: `odoo/addons/web_editor/static/src/js/editor/snippets.options.js`
- Website extension: `odoo/addons/website/static/src/js/editor/snippets.options.js`
- Ví dụ `we-matrix`: `odoo/addons/website/static/src/snippets/s_chart/options.js`

---

## Kết luận ngắn

- `web_editor/snippets.options.js` là lõi parse + dispatch cho đa số widget `we-*`.
- `website/snippets.options.js` bổ sung widget riêng của website (`url/font/gps`).
- Một số tag (`we-row`, `we-collapse`, `we-title`, `we-divider`, `we-alert`, `we-matrix`) không phải “value widget” thuần, nên không có class handler kiểu registry trực tiếp.

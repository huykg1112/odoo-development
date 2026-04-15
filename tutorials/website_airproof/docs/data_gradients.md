# Giải thích file data/gradients.xml (line-by-line)

Nguồn: data/gradients.xml

## Giải thích theo dòng
- L1: Khai báo XML và encoding UTF-8.
- L2: Mở thẻ gốc `odoo`.
- L3: Record view `colorpicker` để mở rộng bộ chọn màu.
- L4: Field `key` định danh QWeb view.
- L5: Field `name` mô tả view.
- L6: Field `type=qweb` vì đây là QWeb template.
- L7: `inherit_id` kế thừa view `web_editor.colorpicker`.
- L8: Field `arch` chứa XML kế thừa.
- L9: XPath tìm block gradient mặc định trong colorpicker.
- L10: Thêm một gradient tuyến tính mới vào danh sách.
- L11: Kết thúc xpath.
- L12: Kết thúc field `arch`.
- L13: Kết thúc record.
- L14: Đóng thẻ `odoo`.

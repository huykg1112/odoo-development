# Giải thích file data/shapes.xml (line-by-line)

Nguồn: data/shapes.xml

## Giải thích theo dòng
- L1: Khai báo XML và encoding UTF-8.
- L2: Mở thẻ gốc `odoo`.
- L3: Comment nhóm Background shapes.
- L4: Record `shape_waves` lưu shape vào `ir.attachment`.
- L5: `name` là tên file hiển thị.
- L6: `datas` đọc file SVG và lưu base64.
- L7: `url` đường dẫn public cho shape trong web editor.
- L8: `public=True` cho phép truy cập công khai.
- L9: Kết thúc record.
- L10: Đóng thẻ `odoo`.

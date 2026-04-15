# Giải thích file data/website.xml (line-by-line)

Nguồn: data/website.xml

## Giải thích theo dòng
- L1: Khai báo XML và encoding UTF-8.
- L2: Mở thẻ gốc `odoo`, `noupdate=1` để tránh bị ghi đè khi update module.
- L3: Record cập nhật website mặc định `website.default_website`.
- L4: Đặt tên website là `Airproof`.
- L5: Đặt logo website từ file SVG (base64 load từ file).
- L6: Đặt favicon từ file PNG.
- L7: `shop_ppr=3` (products per row) cho trang shop.
- L8: Kết thúc record website.
- L9: Đóng thẻ `odoo`.

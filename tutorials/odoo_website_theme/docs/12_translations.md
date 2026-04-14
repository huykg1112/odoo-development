# Phần 12: Translations — Đa Ngôn Ngữ i18n

> **Tài liệu gốc:** [Translations](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/translations.html)
> **Mục tiêu:** Hỗ trợ đa ngôn ngữ cho theme.

---

## 1. Cơ Chế Translation Trong Odoo

Odoo dùng **`.po` files** (GNU Gettext format) để lưu bản dịch. Workflow:

```
1. Odoo quét source XML/Python để tìm string cần dịch
       ↓
2. Export ra file .pot (template)
       ↓
3. Tạo file .po cho từng ngôn ngữ (vi.po, fr.po, ...)
       ↓
4. Dịch string trong .po file
       ↓
5. Odoo load .po khi render với ngôn ngữ tương ứng
```

---

## 2. Cấu Trúc i18n

```
i18n/
├── vi.po      ← Tiếng Việt
├── fr.po      ← Tiếng Pháp
└── de.po      ← Tiếng Đức
```

---

## 3. Đánh Dấu String Cần Dịch Trong Template

### Trong XML/QWeb templates:

```xml
<!-- Cách 1: t-out với string literal được dịch tự động -->
<p>Contact Us</p>

<!-- Cách 2: Dùng _ (underscore function) trong t-esc -->
<p><t t-esc="env['ir.ui.view']._('{string}')"/></p>

<!-- Cách 3: Attribute translate -->
<input placeholder="Your name" translate="yes"/>

<!-- Cách 4: Trong Python controller -->
<!-- _("String to translate") -->
```

Odoo tự động dịch text content trong các template XML, không cần đánh dấu đặc biệt.

### Trong Python:

```python
from odoo import _

error_msg = _("An error occurred. Please try again.")
```

---

## 4. Export Translation Template

```bash
# Export tất cả strings cần dịch ra file .pot
python odoo-bin -d airproof_dev \
    --modules=website_airproof \
    --i18n-export=website_airproof/i18n/website_airproof.pot \
    --language=en_US
```

---

## 5. Tạo File Dịch `.po`

### Tạo thủ công từ `.pot`:

Sao chép file `.pot` thành `vi.po` và dịch từng string:

```po
# Translation of website_airproof
# Language: Vietnamese (vi)
# Copyright (C) Airproof
msgid ""
msgstr ""
"Project-Id-Version: website_airproof 18.0\n"
"Language: vi\n"
"Content-Type: text/plain; charset=UTF-8\n"
"Content-Transfer-Encoding: 8bit\n"
"Plural-Forms: nplurals=1; plural=0;\n"

#. Theme strings
msgid "Contact Us"
msgstr "Liên Hệ"

msgid "Shop Now"
msgstr "Mua Ngay"

msgid "Sign up for our newsletter"
msgstr "Đăng ký nhận bản tin"

msgid "Don't miss the newsletter with news and special offers !"
msgstr "Đừng bỏ lỡ newsletter với tin tức và khuyến mãi đặc biệt!"

msgid "Subscribe"
msgstr "Đăng ký"

msgid "Our drones"
msgstr "Máy bay không người lái của chúng tôi"

msgid "Our accessories"
msgstr "Phụ kiện"

msgid "Contact us"
msgstr "Liên hệ"

msgid "© Airproof. All rights reserved."
msgstr "© Airproof. Bảo lưu mọi quyền."

#. Menu
msgid "Shop"
msgstr "Cửa hàng"

msgid "Blog"
msgstr "Blog"

msgid "Contact"
msgstr "Liên hệ"

#. Product page
msgid "Add to Cart"
msgstr "Thêm vào giỏ"

msgid "Add to Wishlist"
msgstr "Yêu thích"

#. Form labels
msgid "Your Name"
msgstr "Họ tên"

msgid "Email"
msgstr "Email"

msgid "Phone"
msgstr "Điện thoại"

msgid "Message"
msgstr "Tin nhắn"

msgid "Send Message"
msgstr "Gửi tin nhắn"

msgid "Send Request"
msgstr "Gửi yêu cầu"

msgid "I agree to the Privacy Policy"
msgstr "Tôi đồng ý với Chính sách bảo mật"
```

### Import translation:

```bash
python odoo-bin -d airproof_dev \
    --modules=website_airproof \
    --i18n-import=website_airproof/i18n/vi.po \
    --language=vi
```

---

## 6. Khai Báo trong Module

Không cần khai báo đặc biệt trong `__manifest__.py` — Odoo tự động load tất cả `.po` files trong thư mục `i18n/`.

---

## 7. Cài Đặt Ngôn Ngữ Trên Website

### Qua UI:

1. **Settings** → **Translations** → **Languages** → Add language (Vietnamese)
2. **Website** → **Configuration** → **Settings** → **Languages** → Thêm ngôn ngữ
3. Trên website, sẽ hiện language switcher (nếu đã bật trong header)

### Qua XML:

```xml
<!-- Thêm ngôn ngữ qua data XML -->
<record id="lang_vi" model="res.lang">
    <field name="name">Vietnamese</field>
    <field name="code">vi</field>
    <field name="iso_code">vi</field>
    <field name="active" eval="True"/>
</record>
```

---

## 8. URL-based Language

Odoo hỗ trợ URL prefix cho từng ngôn ngữ:
- Tiếng Anh (default): `/`
- Tiếng Việt: `/vi/`
- Tiếng Pháp: `/fr/`

Cấu hình trong Website Settings:
**Website → Configuration → Settings → Languages → URL code**

---

## 9. Dịch Nội Dung Trang (Pages)

Nội dung trang tĩnh (homepage, contact...) được dịch trực tiếp qua Website Builder:

1. Chuyển sang ngôn ngữ cần dịch (bao gồm URL prefix)
2. Click Edit
3. Sửa text → text này được lưu riêng cho ngôn ngữ đó

---

## 10. Chú Ý Quan Trọng

> **String chỉ được dịch nếu chúng KHÁC NHAU giữa các ngôn ngữ.** Nếu source string và translation giống nhau → không cần dịch.

> **Symbols đặc biệt trong .po:** Tránh dùng `%s`, `%d` trực tiếp trong msgstr nếu msgid không có.

> **Reload translations sau khi thêm:** Restart server hoặc chạy `-u website_airproof`.

---

## Checklist Bước 12

- [ ] Tạo thư mục `i18n/`
- [ ] Export `.pot` file từ module
- [ ] Tạo `vi.po` (hoặc ngôn ngữ cần thiết)
- [ ] Dịch ít nhất 20-30 strings phổ biến nhất
- [ ] Import translation vào database
- [ ] Cài đặt ngôn ngữ trong Website Settings
- [ ] Test hiển thị language switcher trong header
- [ ] Test chuyển sang ngôn ngữ khác

**Bước tiếp theo:** [Phần 13 — Going Live](./13_going_live.md)

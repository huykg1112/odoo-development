# Hướng dẫn Theme Website Odoo (kế thừa module website)

Tài liệu này giải thích cấu trúc SCSS của module website và hướng dẫn cách cấu hình theme kế thừa. Đồng thời nhấn mạnh các file SCSS quan trọng mà một Odoo developer cần tập trung khi phát triển.

## 1) Tổng quan thư mục SCSS

Thư mục gốc: `odoo/addons/website/static/src/scss/`
- Đây là lớp style cốt lõi của website: palette, layout frontend, editor UI, và các hook user chỉnh bằng giao diện.

Thư mục con:
- `options/`: hook chứa giá trị người dùng cấu hình trong Website Editor.
- `options/colors/`: hook chứa 3 loại palette do editor ghi (color, gray, theme).

## 2) File SCSS cần chú trọng khi phát triển theme

Nếu bạn làm theme kế thừa website, tập trung vào các file sau (quan trọng nhất trước):

1) `primary_variables.scss`
- Nơi định nghĩa palette nền tảng, danh sách palette, font configs, mixin/function.
- Khi muốn thêm palette mới, font mới, hoặc default values mới, hãy tham chiếu cấu trúc ở đây.

2) `secondary_variables.scss`
- Hợp nhất user values và palette để tạo ra `$o-website-values` cuối cùng.
- Cần hiểu rõ luồng merge này để tránh override sai thứ tự.

3) `bootstrap_overridden.scss`
- Bridge giữa hệ thống giá trị Odoo và Bootstrap.
- Nếu theme của bạn phụ thuộc mạnh vào Bootstrap variables, hãy theo cách Odoo override ở đây.

4) `website.scss`
- File frontend chính: layout (full/boxed/framed/postcard), navbar, footer, heading.
- Mọi thay đổi UI chính của theme đều dựa trên logic ở đây.

5) `website.wysiwyg.scss` và `website.wysiwyg.fonts.scss`
- Ảnh hưởng trực tiếp tới trải nghiệm editor (font, button, badge, icon).
- Nếu theme yêu cầu cảm giác WYSIWYG giống frontend, bạn phải kiểm tra kỹ 2 file này.

6) `website.edit_mode.scss`
- Quy định UI khi edit: dropzone, outline, translation highlight.
- Khi đổi layout hoặc block đặc biệt, nên kiểm tra edit mode để tránh lỗi UX.

7) `color_palettes.scss`
- In ra CSS variables cho preview/editor.
- Quan trọng khi bạn thêm palette mới mà cần thấy trong preview hoặc website configurator.

Các file còn lại bạn chỉ cần tham khảo khi có nhu cầu cụ thể:
- `website.ui.scss`: UI khi user login (frontend-to-backend nav, publish state).
- `website.backend.scss` và `website.backend.dark.scss`: style backend dashboard và dark mode.
- `website_controller_page.scss`, `website_controller_page_kanban.scss`, `website_visitor_views.scss`: UI backend list/kanban.
- `user_custom_bootstrap_overridden.scss` và `user_custom_rules.scss`: hook cho người dùng, không dùng cho theme.
- `options/*`: các hook do editor ghi tự động, không nên sửa tay.

## 3) Liên kết assets trong website

Trong `website/__manifest__.py`, các bundle quan trọng:
- `web._assets_primary_variables`: chứa `primary_variables.scss` và user palette hooks.
- `web._assets_secondary_variables`: chứa `secondary_variables.scss`.
- `web.assets_frontend`: chứa `website.scss`, `website.ui.scss`, các style frontend khác.
- `website.assets_wysiwyg`: chứa WYSIWYG fonts, wysiwyg scss, edit_mode.
- `web.assets_backend`: chứa backend scss và view hierarchy.

Điều này quyết định thứ tự build SCSS và nơi bạn nên chèn file theme của mình.

## 4) Cấu trúc module theme mẫu

```
my_theme/
├── __init__.py
├── __manifest__.py
├── views/
│   └── assets.xml
└── static/
    └── src/
        ├── scss/
        │   ├── theme_variables.scss
        │   ├── theme_rules.scss
        │   └── editor_overrides.scss
        └── img/
```

## 5) Ví dụ __manifest__.py cho theme

```python
{
    'name': 'My Theme',
    'category': 'Theme/Website',
    'version': '1.0',
    'depends': ['website'],
    'data': [
        'views/assets.xml',
    ],
    'assets': {
        'web._assets_primary_variables': [
            'my_theme/static/src/scss/theme_variables.scss',
        ],
        'web._assets_secondary_variables': [
            ('prepend', 'my_theme/static/src/scss/theme_variables.scss'),
        ],
        'web.assets_frontend': [
            'my_theme/static/src/scss/theme_rules.scss',
        ],
        'website.assets_wysiwyg': [
            'my_theme/static/src/scss/editor_overrides.scss',
        ],
        'web.assets_backend': [
            'my_theme/static/src/scss/editor_overrides.scss',
        ],
    },
    'application': False,
    'installable': True,
}
```

Gợi ý phân vai:
- `theme_variables.scss`: override palette, font, website values.
- `theme_rules.scss`: layout, component rules cho frontend.
- `editor_overrides.scss`: chỉnh UI trong WYSIWYG/editor (nếu cần).

## 6) Nên override biến nào trong theme

Trong `theme_variables.scss`, bạn thường chỉnh:
- `$o-base-website-values-palette` (font, size, radius, layout defaults).
- `$o-color-palettes` (thêm palette mới theo brand).
- `$o-theme-font-configs` (thêm font mới).

Ví dụ an toàn:

```scss
$o-base-website-values-palette: map-merge($o-base-website-values-palette, (
  'font': 'Inter',
  'headings-font': 'Inter Tight',
  'btn-border-radius-lg': 2rem,
));

$o-color-palettes: map-merge($o-color-palettes, (
  'my-brand': o-make-palette(#123456, #abcdef, (
    'menu': 2,
    'footer': 5,
  )),
));
```

## 7) Lưu ý khi làm việc với hook user

- Không sửa trực tiếp các file `user_*` trong `options/`.
- Các file đó do editor ghi tự động, sửa tay dễ gây xung đột UI.
- Theme nên đặt default sạch, editor sẽ override theo cấu hình người dùng.

## 8) Thêm font mới

```scss
$o-theme-font-configs: map-merge($o-theme-font-configs, (
  'MyFont': (
    'family': ('MyFont', sans-serif),
    'url': 'MyFont:300,400,700',
  ),
));

$o-base-website-values-palette: map-merge($o-base-website-values-palette, (
  'font': 'MyFont',
));
```

## 9) Checklist test nhanh

- Xóa cache assets, update module, reload website.
- Kiểm tra menu, footer, buttons, headings.
- Vào editor để kiểm tra WYSIWYG font và màu.
- Test mobile preview và layout boxed/framed.

## 10) Lỗi thường gặp

- Không viết CSS rules trong `user_custom_bootstrap_overridden.scss`.
- Không sửa trực tiếp các file `options/user_*`.
- Tránh override các biến mà editor đang quản lý nếu bạn vẫn muốn UI configurator hoạt động.

{
    'name': 'Phòng Khám Hoàn Hảo - Website Theme',
    'description': 'Theme phòng khám đa khoa Hoàn Hảo - Hệ thống y khoa Trust Care',
    'category': 'Website/Theme',
    'version': '18.0.1.0.0',
    'author': 'BMS',
    'license': 'LGPL-3',
    'depends': ['website'],
    'data': [
        # Presets: Bật/tắt các optional views mặc định
        'data/presets.xml',
        # Views: Header/Footer custom templates
        'views/website_templates.xml',
    ],
    'assets': {
        # Bundle 1: Primary variables (load TRƯỚC Bootstrap)
        # Định nghĩa bảng màu, font, cấu hình theme
        'web._assets_primary_variables': [
            'odoo_website_theme/static/src/scss/primary_variables.scss',
        ],
        # Bundle 2: Bootstrap overrides (load ngay trước Bootstrap compiler)
        # Ghi đè các biến Bootstrap: font-size, border-radius, navbar colors...
        'web._assets_frontend_helpers': [
            ('prepend', 'odoo_website_theme/static/src/scss/bootstrap_overridden.scss'),
        ],
        # Bundle 3: Frontend assets (load SAU Bootstrap)
        # Style tùy chỉnh cho header, snippets, pages...
        'web.assets_frontend': [
            'odoo_website_theme/static/src/scss/layout/header.scss',
        ],
    },
    'installable': True,
    'application': False,
}
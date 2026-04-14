{
    'name': 'Odoo website Theme',
    'depends': ['website'],
    'version': '0.1',
    'application': True,
    'category': 'Tutorials',
    'installable': True,
    'data': [
        # 'data/presets.xml',  # Color presets
        'views/odoo_theme_menus.xml',
    ],
    'assets': {
        # Bundle 1: Primary variables (load TRƯỚC Bootstrap)
        'web._assets_primary_variables': [
            'odoo_website_theme/static/src/scss/primary_variables.scss',
        ],
        # Bundle 2: Bootstrap overrides (load TRƯỚC Bootstrap, SAU primary_variables)
        'web._assets_frontend_helpers': [
            ('prepend', 'odoo_website_theme/static/src/scss/bootstrap_overridden.scss'),
        ],
        # Bundle 3: Frontend assets (style thông thường)
        'web.assets_frontend': [
            'odoo_website_theme/static/src/scss/font.scss',
            # Thêm SCSS khác...
        ],
    },
    'license': 'AGPL-3'
}
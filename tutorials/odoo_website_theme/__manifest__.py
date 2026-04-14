{
    'name': 'Odoo website Theme',
    'category': 'Website/Theme',
    'depends': ['website'],
    'data': [
        # 'data/presets.xml',  # Color presets
    ],
    'assets': {
        # Bundle 1: Primary variables (load TRƯỚC Bootstrap)
        'web._assets_primary_variables': [
            'website_airproof/static/src/scss/primary_variables.scss',
        ],
        # Bundle 2: Bootstrap overrides (load TRƯỚC Bootstrap, SAU primary_variables)
        'web._assets_frontend_helpers': [
            ('prepend', 'website_airproof/static/src/scss/bootstrap_overridden.scss'),
        ],
        # Bundle 3: Frontend assets (style thông thường)
        'web.assets_frontend': [
            'website_airproof/static/src/scss/font.scss',
            # Thêm SCSS khác...
        ],
    },
}
{
    'name': "My Pet Plus",
    'version': "18.0.1.2",
    'category': "Lifestyle",
    'summary': """A simple pet plus management module built with Odoo""",
    'description': """
        This module provides a basic pet management system to manage pets, owners, and related information.
    """,
    'author': "Huy Tran",
    'website': "https://thhuydev.id.vn",
    'maintainer': "Huy Tran <huyth.dev@gmail.com>",
    'sequence': 1,
    'application': True,
    'depends': ["my_pet"],
    'data': [
        # 'security/college_erp_security.xml',
        'security/ir.model.access.csv',
        'views/my_pet_plus_views.xml',
        "views/product_pet_views.xml",
        "views/product_pet_type_views.xml",
        # ⚠️ Rating widget template is INLINE in rating_widget.js
        # No separate XML template needed
        # "static/src/components/rating_widget.xml",
    ],
    'assets': {
        'web.assets_backend': [
            # ========== COMPONENTS & WIDGETS ==========
            # JavaScript component definitions
            'my_pet_plus/static/src/components/**/*.js',
            # CSS styling
            'my_pet_plus/static/src/components/**/*.css',
            # ⚠️ XML templates should be in 'data' section above, not here
        ],
    },
    'license': 'LGPL-3',
    # 'installable': True,
    # 'auto_install': True,
}
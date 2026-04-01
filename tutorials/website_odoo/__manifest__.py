{
    'name': "odoo website tutorial",
    'version': "18.0.1.4",
    'category': "website",
    'summary': """A simple odoo website tutorial module built with Odoo""",
    'description': """
        This module provides a basic odoo website tutorial system to manage pets, owners, and related information.
            """,
    'author': "Huy Tran",
    'website': "https://thhuydev.id.vn",
    'maintainer': "Huy Tran <huyth.dev@gmail.com>",
    'sequence': 1,
    'application': True,
    'depends': ["website"],
    'data': [
        'security/ir.model.access.csv',
        'views/header.xml',
    ],
    'assets': {
        # Theme mau/font cho toan website module
        'web.assets_frontend': [
            # 'website_odoo/static/src/scss/theme.scss',
        ],
        'web.assets_backend': [],
    },
    'license': 'LGPL-3',
    'installable': True,
    'auto_install': False,
}
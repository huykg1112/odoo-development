{
    'name': "My Pet",
    'version': "18.0.1.2",
    'category': "Lifestyle",
    'summary': """A simple pet management module built with Odoo""",
    'description': """
        This module provides a basic pet management system to manage pets, owners, and related information.
    """,
    'author': "Huy Tran",
    'website': "https://thhuydev.id.vn",
    'maintainer': "Huy Tran <huyth.dev@gmail.com>",
    'sequence': 1,
    'application': True,
    'depends': ["product", "base", "web"],
    'data': [
        # 'security/college_erp_security.xml',
        'security/ir.model.access.csv',
        'views/my_pet_views.xml',
        'wizard/batch_update.xml',
    ],
    'assets':{
        'web.assets_backend': [
            'my_pet/static/src/js/**/*.js',
        ],
      },
    'license': 'LGPL-3',
    'installable': True,
    'auto_install': True,
}
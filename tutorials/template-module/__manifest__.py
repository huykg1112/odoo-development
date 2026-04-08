{
    'name': "Template Module",
    'version': "18.0.1.0",
    'category': "Tutorials",
    'summary': """ A template website module for Odoo 18. """,
    'description': """
        This module provides a basic template website functionality for Odoo 18.
    """,
    'author': "Huy Tran",
    'website': "https://thhuydev.id.vn",
    'maintainer': "Huy Tran <huyth.dev@gmail.com>",
    'sequence': 1,
    'application': True,
    'depends': ['base', 'mail' , 'website'],
    'data': [
    ],
    'assets':{
        'web._assets_primary_variables': [
        ],
        'web._assets_frontend_helpers': [
        ],
        'web.assets_frontend': [
        ],
        'website.assets_wysiwyg': [
        ],
      },
    'license': 'LGPL-3',
}
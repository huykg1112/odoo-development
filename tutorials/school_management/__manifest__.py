{
    'name': "School Management",
    'version': "18.0.1.0",
    'category': "Education",
    'summary': """ A School Management module for Odoo 18. """,
    'description': """
        This module provides a basic School Management functionality for Odoo 18.
    """,
    'author': "Huy Tran",
    'website': "https://thhuydev.id.vn",
    'maintainer': "Huy Tran <huyth.dev@gmail.com>",
    'sequence': 1,
    'application': True,
    'depends': [
        'base',       # Module gốc - luôn cần
        'mail',       # Để dùng chatter (ghi chú, log)
        'hr',         # Human Resources
        'account',    # Kế toán
        'sale',       # Bán hàng
    ],
    'data': [
        # security
        'security/ir.model.access.csv',

        # data
        'data/student_classroom_sequence.xml',

        # views
        'views/student_views.xml',
        'views/classroom_view.xml',
        'views/menu.xml',
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
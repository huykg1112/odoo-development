{
    'name': "College ERP",
    'version': "18.0.1.2",
    'category': "Education",
    'summary': """A simple College ERP system built with Odoo""",
    'description': """
        This module provides a basic College ERP system to manage students, courses, and enrollments.
    """,
    'author': "Huy Tran",
    'website': "https://thhuydev.id.vn",
    'maintainer': "Huy Tran <huyth.dev@gmail.com>",
    'sequence': 1,
    'application': True,
    'depends': ['base', 'mail'],
    'data': [
        'security/college_erp_security.xml',
        'security/ir.model.access.csv',
        'views/college_student.xml',
        'views/college_erp_menus.xml',
    ],
    # 'assets':{
    #     'college_erp.assets': [
    #         'college_ERP/static/src/**/*',
    #     ],
    #   },
    'license': 'LGPL-3',
}
# -*- coding: utf-8 -*-
{
    'name': "Snippets Development",

    'summary': """
        Starting module for "Discover the JS framework, chapter 2: Snippets development"
    """,

    'author': "Odoo",
    'website': "https://www.odoo.com",
    'category': 'Tutorials/AwesomeClicker',
    'version': '0.1',

    'depends': ['website'],

    'data': [
        'views/snippets/three_part_text/three_part_text.xml',
        'views/snippets/three_part_text/three_text_options.xml',
        'views/snippets/text_gradient/text_gradient.xml',
        'views/snippets/text_gradient/gradient_options.xml',
        'views/snippet_registry.xml',
    ],
    'assets': {
        # 1. Load cho tất cả người xem web (chứa CSS/SCSS và JS animation/tương tác ngoài frontend)
        'web.assets_frontend': [
            'snippets_development/static/src/scss/main.scss',
            'snippets_development/static/src/js/three_part_text.js',
        ],
        
        # 2. Xóa hoặc để trống nếu không có file JS/CSS nào cần load lazy ở frontend
        'web.assets_frontend_lazy': [],

        # 3. CHỈ load khi bấm nút "Edit" trên website (chứa các Tùy chọn, Cài đặt Snippet)
        'website.assets_wysiwyg': [
            'snippets_development/static/src/js/text_gradient.js',
            'snippets_development/static/src/js/three_part_text_options.js', 
        ],
    },
    'license': 'AGPL-3'
}
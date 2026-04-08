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
        'web.assets_frontend': [
            'snippets_development/static/src/scss/main.scss',
            'snippets_development/static/src/js/three_part_text.js',
            'snippets_development/static/src/js/text_gradient_public.js',
            
        ],
        'website.assets_wysiwyg': [
            'snippets_development/static/src/scss/main.scss',
            'snippets_development/static/src/js/three_part_text_options.js',
            'snippets_development/static/src/js/text_gradient.js',
        ],
    },
    'license': 'AGPL-3'
}
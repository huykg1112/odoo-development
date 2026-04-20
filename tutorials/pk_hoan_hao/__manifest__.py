{
    "name": "PK Hoan Hao Theme",
    "summary": "Website theme for PK Hoan Hao clinic",
    "category": "Website",
    'sequence': 1,
    "version": "18.0.1.0.0",
    "license": "LGPL-3",
    "author": "PK Hoan Hao",
    "depends": ["website", "website_blog", "website_crm"],
    "data": [
        "views/hoan_hao_menu.xml",
        "views/layout/header.xml",
        "views/layout/login.xml",
        "views/snippets/snippets.xml",
        "views/snippets/s_pk_badge.xml",
    ],
    "assets": {
        "web._assets_primary_variables": [
            "pk_hoan_hao/static/src/scss/primary_variables.scss",
        ],
        "web._assets_frontend_helpers": [
            ("prepend", "pk_hoan_hao/static/src/scss/bootstrap_overridden.scss"),
        ],
        "web.assets_frontend": [
            "pk_hoan_hao/static/src/scss/layout/header.scss",
            "pk_hoan_hao/static/src/scss/snippets/s_pk_badge/000.scss",
            "pk_hoan_hao/static/src/scss/page/login.scss",
        ],
    },
    "application": False,
    "installable": True,
}

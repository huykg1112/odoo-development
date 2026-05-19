# 📖 Tài liệu Tích hợp & Sử dụng `website_blog` — Dự án PK Hoàn Hảo

> **Phiên bản:** Odoo 18.0 | **Module dự án:** `pk_hoan_hao` | **Ngày:** 2026-04-20

---

## Mục lục

1. [Tổng quan kiến trúc module](#1-tổng-quan-kiến-trúc-module)
2. [Cài đặt & Tích hợp cơ bản](#2-cài-đặt--tích-hợp-cơ-bản)
3. [Các Model dữ liệu](#3-các-model-dữ-liệu)
4. [URL Routing & Controller](#4-url-routing--controller)
5. [Quản lý Blog qua Backend](#5-quản-lý-blog-qua-backend)
6. [Templates & QWeb cơ bản](#6-templates--qweb-cơ-bản)
7. [Tùy chọn giao diện có sẵn (Options)](#7-tùy-chọn-giao-diện-có-sẵn-options)
8. [Áp dụng cho PK Hoàn Hảo — Thiết lập nội dung](#8-áp-dụng-cho-pk-hoàn-hảo--thiết-lập-nội-dung)
9. [Nâng cao: Kế thừa Template (XML Inheritance)](#9-nâng-cao-kế-thừa-template-xml-inheritance)
10. [Nâng cao: Thêm Custom Field vào Blog Post](#10-nâng-cao-thêm-custom-field-vào-blog-post)
11. [Nâng cao: Override Controller](#11-nâng-cao-override-controller)
12. [Nâng cao: Custom Snippet hiển thị Blog Posts](#12-nâng-cao-custom-snippet-hiển-thị-blog-posts)
13. [Nâng cao: SCSS Styling cho Blog y tế](#13-nâng-cao-scss-styling-cho-blog-y-tế)
14. [SEO & Multilingual (Đa ngôn ngữ)](#14-seo--multilingual-đa-ngôn-ngữ)
15. [Checklist tích hợp hoàn chỉnh](#15-checklist-tích-hợp-hoàn-chỉnh)

---

## 1. Tổng quan kiến trúc module

### Cấu trúc thư mục `website_blog`

```
website_blog/
├── __manifest__.py          # Khai báo module, dependencies, assets
├── models/
│   ├── website_blog.py      # Blog, BlogPost, BlogTag, BlogTagCategory models
│   ├── website.py           # Mixin extend website
│   └── website_snippet_filter.py  # Dynamic snippet filter cho blog posts
├── controllers/
│   └── main.py              # HTTP routes: /blog, /blog/<blog>/<post>
├── views/
│   ├── website_blog_views.xml       # Backend views (list, form)
│   ├── website_blog_templates.xml   # Frontend templates chính
│   ├── website_blog_components.xml  # Components: sidebar, navbar, tags
│   ├── website_blog_posts_loop.xml  # Loop hiển thị danh sách bài viết
│   ├── snippets/
│   │   └── s_blog_posts.xml         # Dynamic snippet "Blog Posts"
│   └── website_pages_views.xml
├── data/
│   ├── website_blog_data.xml        # Blog mặc định + menu item
│   └── blog_snippet_template_data.xml # Snippet templates editor
├── security/
│   └── ir.model.access.csv          # Quyền truy cập
└── static/src/
    ├── scss/website_blog.scss
    └── js/ (options.js, website_blog.js, ...)
```

### Dependency chain

```
website_blog
    └── website_mail      (mail thread, followers)
    └── website_partner   (res.partner integration)
            └── website   (core website module)
```

> `pk_hoan_hao` đã khai báo `"depends": ["website", "website_blog", "website_crm"]` — ✅ **đã sẵn sàng.**

---

## 2. Cài đặt & Tích hợp cơ bản

### 2.1 Dependency trong `__manifest__.py`

`pk_hoan_hao` đã có sẵn dependency đúng:

```python
# f:\BMS\Odoo\tutorials\pk_hoan_hao\__manifest__.py
{
    "name": "PK Hoan Hao Theme",
    "depends": ["website", "website_blog", "website_crm"],
    ...
}
```

### 2.2 Kích hoạt module

```bash
# Từ Odoo backend: Settings → Apps → tìm "Blog" → Install
# Hoặc qua CLI:
python odoo-bin -u pk_hoan_hao -d your_database
```

### 2.3 Kiểm tra sau cài đặt

Sau khi cài đặt, các thứ tự xảy ra tự động:
- Route `/blog` được đăng ký
- Menu item **"Blog"** xuất hiện trên navbar website (sequence 40)
- Blog mặc định **"Our blog"** được tạo (`website_blog_data.xml`)
- Backend menu: **Website → Blog**

---

## 3. Các Model dữ liệu

### 3.1 `blog.blog` — Blog (danh mục)

| Field | Type | Mô tả |
|-------|------|--------|
| `name` | Char | Tên blog (translate=True) |
| `subtitle` | Char | Phụ đề (translate=True) |
| `active` | Boolean | Hiển thị/Ẩn |
| `content` | Html | Nội dung header (dùng trong website editor) |
| `blog_post_ids` | One2many | Các bài viết thuộc blog này |
| `blog_post_count` | Integer (computed) | Số lượng bài viết |
| `cover_properties` | Json | Ảnh bìa, resize class, opacity |
| `website_id` | Many2one | Multi-website support |

**Mixin kế thừa:**
- `mail.thread` — theo dõi thay đổi, thông báo email
- `website.seo.metadata` — meta title, description, keywords
- `website.multi.mixin` — multi-website
- `website.cover_properties.mixin` — ảnh bìa cover

### 3.2 `blog.post` — Bài viết

| Field | Type | Mô tả |
|-------|------|--------|
| `name` | Char | Tiêu đề (required, translate=True) |
| `subtitle` | Char | Phụ đề |
| `author_id` | Many2one(`res.partner`) | Tác giả |
| `author_avatar` | Binary (related) | Avatar tác giả |
| `author_name` | Char (related, stored) | Tên tác giả |
| `blog_id` | Many2one(`blog.blog`) | Blog cha |
| `tag_ids` | Many2many(`blog.tag`) | Tags |
| `content` | Html | Nội dung chính (translate, sanitize=False) |
| `teaser` | Text (computed) | Tóm tắt 200 ký tự đầu |
| `teaser_manual` | Text | Tóm tắt tùy chỉnh |
| `post_date` | Datetime (computed) | Ngày xuất bản hiển thị |
| `published_date` | Datetime | Ngày publish thực tế |
| `visits` | Integer | Số lượt xem |
| `is_published` | Boolean (mixin) | Trạng thái public |
| `website_url` | Char (computed) | URL: `/blog/<blog-slug>/<post-slug>` |

### 3.3 `blog.tag` và `blog.tag.category`

```
blog.tag.category (nhóm tag)
    └── blog.tag (tag cụ thể — many2many với blog.post)
```

| Model | Field quan trọng |
|-------|-----------------|
| `blog.tag` | `name`, `color` (0-11), `category_id`, `post_ids` |
| `blog.tag.category` | `name`, `tag_ids` |

---

## 4. URL Routing & Controller

### 4.1 Các URL được đăng ký

| URL Pattern | Chức năng |
|-------------|-----------|
| `/blog` | Trang tất cả blog |
| `/blog/page/<int:page>` | Phân trang |
| `/blog/<blog>` | Trang một blog cụ thể |
| `/blog/<blog>/page/<int:page>` | Phân trang trong blog |
| `/blog/<blog>/tag/<string:tag>` | Lọc theo tag |
| `/blog/<blog>/<post>` | Chi tiết bài viết |
| `/blog/<blog>/feed` | Atom/RSS feed |

### 4.2 Dữ liệu truyền vào template

Controller `_prepare_blog_values()` truyền các variable sau vào template:

```python
{
    'blogs': [blog.blog records],       # Tất cả blogs
    'blog': blog.blog record,           # Blog hiện tại (nếu có)
    'posts': [blog.post records],       # Danh sách bài viết (paginated)
    'pager': pager_dict,                # Phân trang
    'tags': [blog.tag records],         # (trong post detail)
    'tag': current_tag,                 # Tag đang lọc
    'active_tag_ids': [int],            # IDs các tag đang active
    'nav_list': {year: [months]},       # Navigation theo tháng/năm
    'other_tags': [blog.tag],           # Tags không có category
    'tag_category': [blog.tag.category], # Nhóm tag
    'date_begin': str,
    'date_end': str,
    'search': str,
    'search_count': int,
    'next_post': blog.post,             # (trong post detail)
    'blog_url': QueryURL,               # Helper tạo URL có filter
}
```

---

## 5. Quản lý Blog qua Backend

### 5.1 Backend Menu

Vào **Website → Configuration → Blog**:
- **Blogs**: Tạo/sửa blog (danh mục)
- **Tags**: Quản lý tags
- **Tag Categories**: Quản lý nhóm tags

### 5.2 Tạo Blog cho PK Hoàn Hảo (qua XML)

Tạo file `data/blog_data.xml` trong module `pk_hoan_hao`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<odoo>
    <data noupdate="1">

        <!-- Blog chính: Tin tức & Sức khỏe -->
        <record id="blog_suc_khoe" model="blog.blog">
            <field name="name">Tin tức Sức khỏe</field>
            <field name="subtitle">Thông tin y tế chính xác từ các chuyên gia PK Hoàn Hảo</field>
            <field name="cover_properties">
                {"background-image": "url('/pk_hoan_hao/static/src/img/blog_cover_health.jpg')",
                 "resize_class": "o_record_has_cover o_half_screen_height",
                 "opacity": "0.4"}
            </field>
        </record>

        <!-- Blog: Dịch vụ & Chuyên khoa -->
        <record id="blog_dich_vu" model="blog.blog">
            <field name="name">Dịch vụ & Chuyên khoa</field>
            <field name="subtitle">Giới thiệu các dịch vụ thẩm mỹ và y tế tại PK Hoàn Hảo</field>
        </record>

        <!-- Tag Categories -->
        <record id="tag_cat_chuyen_khoa" model="blog.tag.category">
            <field name="name">Chuyên khoa</field>
        </record>
        <record id="tag_cat_tu_van" model="blog.tag.category">
            <field name="name">Tư vấn sức khỏe</field>
        </record>

        <!-- Tags -->
        <record id="tag_tham_my" model="blog.tag">
            <field name="name">Thẩm mỹ</field>
            <field name="category_id" ref="tag_cat_chuyen_khoa"/>
            <field name="color">1</field>
        </record>
        <record id="tag_da_lieu" model="blog.tag">
            <field name="name">Da liễu</field>
            <field name="category_id" ref="tag_cat_chuyen_khoa"/>
            <field name="color">2</field>
        </record>
        <record id="tag_dinh_duong" model="blog.tag">
            <field name="name">Dinh dưỡng</field>
            <field name="category_id" ref="tag_cat_tu_van"/>
            <field name="color">4</field>
        </record>

    </data>
</odoo>
```

Thêm vào `__manifest__.py`:

```python
"data": [
    ...
    "data/blog_data.xml",   # thêm dòng này
],
```

---

## 6. Templates & QWeb cơ bản

### 6.1 Các template chính

| Template ID | Tên | Chức năng |
|-------------|-----|-----------|
| `website_blog.index` | Blog Navigation | Layout wrapper cho tất cả trang blog |
| `website_blog.blog_post_short` | Blog Posts | Trang danh sách bài viết |
| `website_blog.blog_post_complete` | Blog Post | Trang chi tiết một bài viết |
| `website_blog.blog_post_content` | Blog post content | Nội dung bài viết |
| `website_blog.blogs_nav` | Blogs Bar Template | Navbar giữa các blogs |
| `website_blog.sidebar_blog_index` | Sidebar - Blog page | Sidebar trang danh sách |
| `website_blog.blog_post_sidebar` | Sidebar - Blog Post | Sidebar trang bài viết |
| `website_blog.posts_loop` | (posts loop) | Vòng lặp hiển thị card bài viết |

### 6.2 Cây template inheritance

```
website_blog.index
    └── website_blog.blog_post_short      ← trang danh sách
        ├── opt_blog_cover_post           ← banner ảnh bìa
        ├── opt_blog_cover_post_fullwidth_design
        ├── opt_blog_sidebar_show         ← bật sidebar (default: OFF)
        ├── opt_blog_cards_design         ← kiểu card (default: OFF)
        ├── opt_blog_list_view            ← hiển thị dạng list (default: OFF)
        └── opt_blog_readable             ← tăng readability (default: ON)

    └── website_blog.blog_post_complete   ← trang chi tiết
        ├── opt_blog_post_readable        ← tăng readability (default: ON)
        ├── opt_blog_post_sidebar         ← sidebar (default: OFF)
        ├── opt_blog_post_regular_cover   ← cover thường (default: OFF)
        ├── opt_blog_post_breadcrumb      ← breadcrumbs (default: ON)
        ├── opt_blog_post_comment         ← comments (default: OFF)
        ├── opt_blog_post_read_next       ← đọc bài tiếp (default: ON)
        └── opt_blog_post_select_to_tweet ← tweet khi chọn (default: OFF)
```

---

## 7. Tùy chọn giao diện có sẵn (Options)

Các tùy chọn này có thể bật/tắt qua **Website Editor → Customize** hoặc qua XML:

### 7.1 Bật sidebar mặc định cho danh sách blog

```xml
<!-- Trong file views của pk_hoan_hao -->
<template id="opt_blog_sidebar_show_pk"
          inherit_id="website_blog.opt_blog_sidebar_show"
          active="True"/>  <!-- Đổi từ False → True -->
```

### 7.2 Bật comments cho bài viết

```xml
<template id="opt_blog_post_comment_pk"
          inherit_id="website_blog.opt_blog_post_comment"
          active="True"/>
```

### 7.3 Bật kiểu Cards design

```xml
<template id="opt_blog_cards_design_pk"
          inherit_id="website_blog.opt_blog_cards_design"
          active="True"/>
```

> ⚠️ **Lưu ý:** Khi dùng `inherit_id`, bạn đang override trạng thái `active` mặc định. Đặt `active="True"` để bật, `active="False"` để tắt.

---

## 8. Áp dụng cho PK Hoàn Hảo — Thiết lập nội dung

### 8.1 Cấu trúc Blog đề xuất cho phòng khám

```
📋 Blog 1: "Tin tức Sức khỏe"    → /blog/tin-tuc-suc-khoe
   ├── Bài: Chăm sóc da mùa hè
   ├── Bài: Dinh dưỡng cho bệnh nhân sau phẫu thuật
   └── Bài: ...

📋 Blog 2: "Dịch vụ & Chuyên khoa"  → /blog/dich-vu-chuyen-khoa
   ├── Bài: Thẩm mỹ mí mắt — Quy trình & Giá cả
   ├── Bài: Điều trị mụn bằng laser
   └── Bài: ...
```

### 8.2 Menu tùy chỉnh cho clinic

Sửa menu blog để phù hợp với PK Hoàn Hảo:

```xml
<!-- views/hoan_hao_menu.xml — thêm blog vào menu phù hợp -->
<record id="menu_blog_suc_khoe" model="website.menu">
    <field name="name">Blog Sức khỏe</field>
    <field name="url">/blog/tin-tuc-suc-khoe-1</field>  <!-- slug tự sinh -->
    <field name="parent_id" ref="website.main_menu"/>
    <field name="sequence" type="int">50</field>
</record>
```

---

## 9. Nâng cao: Kế thừa Template (XML Inheritance)

### 9.1 Thêm logo clinic vào sidebar blog

Tạo file `views/blog_customizations.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

    <!-- Thêm thông tin phòng khám vào sidebar trang danh sách -->
    <template id="pk_sidebar_clinic_info"
              inherit_id="website_blog.sidebar_blog_index"
              name="PK - Clinic Info Sidebar">
        <!-- Thay thế phần "About us" mặc định -->
        <xpath expr="//div[hasclass('o_wblog_sidebar_block')][1]" position="replace">
            <div class="o_wblog_sidebar_block pb-5">
                <h6 class="text-uppercase pb-2 mb-4 border-bottom fw-bold">
                    Về Chúng Tôi
                </h6>
                <div class="text-center mb-3">
                    <img src="/pk_hoan_hao/static/src/img/logo_clinic.png"
                         alt="PK Hoàn Hảo"
                         class="img-fluid rounded"
                         style="max-width: 100px;"/>
                </div>
                <p class="text-muted small">
                    <strong>Phòng khám Thẩm mỹ Hoàn Hảo</strong> — Đội ngũ chuyên gia
                    hàng đầu với hơn 10 năm kinh nghiệm trong lĩnh vực thẩm mỹ và
                    chăm sóc sức khỏe toàn diện.
                </p>
                <a href="/lien-he" class="btn btn-sm btn-primary w-100">
                    Đặt lịch khám
                </a>
            </div>
        </xpath>
    </template>

</odoo>
```

### 9.2 Thêm badge "Y tế kiểm chứng" vào bài viết

```xml
    <!-- Thêm badge vào phần header bài viết -->
    <template id="pk_post_medical_badge"
              inherit_id="website_blog.blog_post_content"
              name="PK - Medical Verified Badge">
        <xpath expr="//div[@t-field='blog_post.content']" position="before">
            <div t-if="blog_post.tag_ids.filtered(lambda t: t.name in ['Thẩm mỹ', 'Da liễu', 'Dinh dưỡng'])"
                 class="alert alert-info d-flex align-items-center mb-3 pk-medical-notice">
                <i class="fa fa-stethoscope me-2 fs-5"/>
                <div>
                    <strong>Nội dung được kiểm duyệt bởi chuyên gia PK Hoàn Hảo.</strong>
                    Thông tin chỉ mang tính tham khảo, không thay thế tư vấn y tế.
                </div>
            </div>
        </xpath>
    </template>
```

### 9.3 Tùy chỉnh footer "Đọc bài tiếp theo"

```xml
    <!-- Override "Read Next" để thêm CTA đặt lịch -->
    <template id="pk_blog_post_next_cta"
              inherit_id="website_blog.opt_blog_post_read_next"
              name="PK - Add CTA after next post">
        <xpath expr="//div[@id='o_wblog_next_container']" position="after">
            <div class="container py-5 text-center bg-light mt-4">
                <h4 class="mb-3">Bạn cần tư vấn thêm?</h4>
                <p class="text-muted mb-4">
                    Đội ngũ chuyên gia PK Hoàn Hảo sẵn sàng hỗ trợ bạn.
                </p>
                <a href="/lien-he#booking" class="btn btn-primary btn-lg me-2">
                    <i class="fa fa-calendar me-2"/>Đặt lịch khám
                </a>
                <a href="tel:19001234" class="btn btn-outline-primary btn-lg">
                    <i class="fa fa-phone me-2"/>1900 1234
                </a>
            </div>
        </xpath>
    </template>
```

---

## 10. Nâng cao: Thêm Custom Field vào Blog Post

### 10.1 Tạo model extension

Tạo file `models/blog_post.py` trong `pk_hoan_hao`:

```python
# models/blog_post.py
from odoo import models, fields, api


class BlogPost(models.Model):
    _inherit = 'blog.post'

    # Thêm field "chuyên gia kiểm duyệt"
    pk_reviewer_id = fields.Many2one(
        'res.partner',
        string='Chuyên gia kiểm duyệt',
        domain="[('is_company', '=', False)]",
        help='Bác sĩ / chuyên gia kiểm duyệt nội dung bài viết này'
    )
    pk_reviewer_title = fields.Char(
        string='Chức danh chuyên gia',
        compute='_compute_reviewer_info',
        store=True,
    )
    pk_medical_disclaimer = fields.Boolean(
        string='Hiển thị cảnh báo y tế',
        default=True,
        help='Hiển thị dòng "Nội dung chỉ mang tính tham khảo" trên bài viết'
    )
    pk_reading_time = fields.Integer(
        string='Thời gian đọc (phút)',
        compute='_compute_reading_time',
        store=True,
    )

    @api.depends('pk_reviewer_id', 'pk_reviewer_id.function')
    def _compute_reviewer_info(self):
        for post in self:
            post.pk_reviewer_title = post.pk_reviewer_id.function or ''

    @api.depends('content')
    def _compute_reading_time(self):
        """Ước tính ~200 từ/phút"""
        for post in self:
            if post.content:
                from odoo.addons.website.tools import text_from_html
                text = text_from_html(post.content or '')
                word_count = len(text.split())
                post.pk_reading_time = max(1, round(word_count / 200))
            else:
                post.pk_reading_time = 0
```

### 10.2 Khai báo `__init__.py`

```python
# models/__init__.py
from . import blog_post
```

```python
# pk_hoan_hao/__init__.py
from . import models
```

### 10.3 Hiển thị thời gian đọc trong template

```xml
<!-- Thêm "X phút đọc" vào header bài viết -->
<template id="pk_reading_time_display"
          inherit_id="website_blog.blog_post_complete"
          name="PK - Reading Time">
    <xpath expr="//section[@id='o_wblog_post_top']" position="inside">
        <div t-if="blog_post.pk_reading_time"
             class="pk-reading-time position-absolute bottom-0 end-0 m-3">
            <span class="badge bg-white text-dark shadow-sm px-3 py-2">
                <i class="fa fa-clock-o me-1"/>
                <t t-esc="blog_post.pk_reading_time"/> phút đọc
            </span>
        </div>
    </xpath>
</template>

<!-- Hiển thị chuyên gia kiểm duyệt -->
<template id="pk_reviewer_display"
          inherit_id="website_blog.blog_post_content"
          name="PK - Expert Reviewer">
    <xpath expr="//div[@t-field='blog_post.content']" position="after">
        <div t-if="blog_post.pk_reviewer_id"
             class="pk-reviewer-card border rounded p-4 mt-4 bg-light">
            <div class="d-flex align-items-center">
                <div t-if="blog_post.pk_reviewer_id.image_128"
                     t-field="blog_post.pk_reviewer_id.image_128"
                     t-options='{"widget": "image", "class": "rounded-circle me-3", "style": "width:64px;height:64px;object-fit:cover;"}'/>
                <div>
                    <small class="text-muted text-uppercase fw-bold">Được kiểm duyệt bởi</small>
                    <div class="fw-bold" t-esc="blog_post.pk_reviewer_id.name"/>
                    <small class="text-muted" t-esc="blog_post.pk_reviewer_title"/>
                </div>
                <div class="ms-auto">
                    <span class="badge bg-success">
                        <i class="fa fa-check-circle me-1"/>Đã xác minh
                    </span>
                </div>
            </div>
        </div>
    </xpath>
</template>
```

### 10.4 Thêm field vào backend form view

```xml
<!-- views/blog_post_views.xml -->
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="view_blog_post_form_pk" model="ir.ui.view">
        <field name="name">blog.post.form.pk_hoan_hao</field>
        <field name="model">blog.post</field>
        <field name="inherit_id" ref="website_blog.blog_post_backend_list"/>
        <field name="arch" type="xml">
            <!-- Không có form mặc định trong website_blog,
                 bài viết được sửa trực tiếp trên website.
                 Thêm field vào list view: -->
        </field>
    </record>

    <!-- Nếu muốn thêm một action xem blog posts từ backend: -->
    <record id="action_pk_blog_posts" model="ir.actions.act_window">
        <field name="name">Bài viết Blog</field>
        <field name="res_model">blog.post</field>
        <field name="view_mode">list,form</field>
        <field name="domain">[('website_published', '=', True)]</field>
    </record>
</odoo>
```

---

## 11. Nâng cao: Override Controller

### 11.1 Thêm dữ liệu bổ sung vào trang blog

Tạo file `controllers/blog.py`:

```python
# controllers/blog.py
from odoo import http
from odoo.http import request
from odoo.addons.website_blog.controllers.main import WebsiteBlog


class PKWebsiteBlog(WebsiteBlog):
    """Extend controller blog để thêm dữ liệu phòng khám"""

    def _prepare_blog_values(self, blogs, blog=False, **kwargs):
        """Override để thêm thông tin bác sĩ và dịch vụ liên quan"""
        values = super()._prepare_blog_values(blogs, blog=blog, **kwargs)

        # Thêm danh sách bác sĩ nổi bật (nếu có model res.partner với role)
        # values['featured_doctors'] = request.env['res.partner'].sudo().search([
        #     ('is_doctor', '=', True), ('active', '=', True)
        # ], limit=3)

        # Thêm số điện thoại hotline vào context
        values['clinic_phone'] = '1900 1234'
        values['clinic_name'] = 'PK Hoàn Hảo'

        return values

    @http.route([
        '/blog',
        '/blog/page/<int:page>',
        '/blog/tag/<string:tag>',
        '/blog/tag/<string:tag>/page/<int:page>',
        '''/blog/<model("blog.blog"):blog>''',
        '''/blog/<model("blog.blog"):blog>/page/<int:page>''',
        '''/blog/<model("blog.blog"):blog>/tag/<string:tag>''',
        '''/blog/<model("blog.blog"):blog>/tag/<string:tag>/page/<int:page>''',
    ], type='http', auth="public", website=True, sitemap=True)
    def blog(self, blog=None, tag=None, page=1, search=None, **opt):
        # Gọi super() để render bình thường,
        # dữ liệu thêm đã được inject trong _prepare_blog_values
        return super().blog(blog=blog, tag=tag, page=page, search=search, **opt)
```

Khai báo controller:

```python
# controllers/__init__.py
from . import blog
```

```python
# pk_hoan_hao/__init__.py
from . import models
from . import controllers
```

---

## 12. Nâng cao: Custom Snippet hiển thị Blog Posts

### 12.1 Tạo snippet "Bài viết nổi bật" cho landing pages

Tạo file `views/snippets/s_pk_latest_posts.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>

    <!-- ===== Snippet Template: PK Latest Blog Posts ===== -->
    <template id="s_pk_latest_posts" name="PK - Bài viết mới nhất">
        <section class="s_pk_latest_posts py-5">
            <div class="container">
                <!-- Header -->
                <div class="row mb-4">
                    <div class="col-12 text-center">
                        <h2 class="fw-bold">Tin tức Sức khỏe</h2>
                        <p class="text-muted">Thông tin y tế mới nhất từ các chuyên gia PK Hoàn Hảo</p>
                    </div>
                </div>

                <!-- Lấy 3 bài viết mới nhất từ blog "Sức khỏe" -->
                <div class="row g-4">
                    <t t-set="recent_posts" t-value="
                        request.env['blog.post'].sudo().search(
                            [('website_published', '=', True),
                             ('post_date', '<=', fields.Datetime.now())],
                            order='post_date DESC',
                            limit=3
                        )
                    "/>
                    <t t-foreach="recent_posts" t-as="post">
                        <div class="col-12 col-md-4">
                            <div class="card h-100 border-0 shadow-sm overflow-hidden pk-blog-card">
                                <!-- Ảnh bìa -->
                                <div class="pk-blog-card-img overflow-hidden"
                                     style="height: 200px;">
                                    <t t-set="_cp" t-value="json.loads(post.cover_properties)"/>
                                    <div class="w-100 h-100 bg-light"
                                         t-att-style="_cp.get('background-image') and 'background:' + _cp.get('background-image') + '; background-size: cover; background-position: center;'"/>
                                </div>
                                <!-- Nội dung -->
                                <div class="card-body p-4">
                                    <!-- Tags -->
                                    <div class="mb-2">
                                        <t t-foreach="post.tag_ids[:2]" t-as="t_tag">
                                            <span t-attf-class="badge me-1 o_tag o_color_#{t_tag.color}"
                                                  t-esc="t_tag.name"/>
                                        </t>
                                    </div>
                                    <!-- Tiêu đề -->
                                    <h5 class="card-title fw-bold">
                                        <a t-att-href="post.website_url"
                                           class="text-decoration-none text-dark stretched-link"
                                           t-esc="post.name"/>
                                    </h5>
                                    <!-- Teaser -->
                                    <p class="card-text text-muted small" t-esc="post.teaser"/>
                                    <!-- Meta -->
                                    <div class="d-flex align-items-center mt-3">
                                        <small class="text-muted">
                                            <i class="fa fa-calendar me-1"/>
                                            <span t-field="post.post_date"
                                                  t-options="{'format': 'dd/MM/yyyy'}"/>
                                        </small>
                                        <small t-if="post.pk_reading_time" class="text-muted ms-3">
                                            <i class="fa fa-clock-o me-1"/>
                                            <t t-esc="post.pk_reading_time"/> phút đọc
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </t>
                </div>

                <!-- CTA "Xem tất cả" -->
                <div class="row mt-5">
                    <div class="col-12 text-center">
                        <a href="/blog" class="btn btn-outline-primary btn-lg">
                            Xem tất cả bài viết <i class="fa fa-arrow-right ms-2"/>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    </template>

    <!-- ===== Đăng ký snippet vào Website Editor ===== -->
    <template id="snippets_pk_latest_posts" inherit_id="website.snippets">
        <xpath expr="//div[@id='snippet_groups']" position="inside">
            <div class="o_panel">
                <div class="o_panel_header">PK Hoàn Hảo</div>
                <div class="o_panel_body">
                    <t t-snippet="pk_hoan_hao.s_pk_latest_posts"
                       t-thumbnail="/pk_hoan_hao/static/src/img/snippets/s_pk_latest_posts.svg"/>
                </div>
            </div>
        </xpath>
    </template>

</odoo>
```

### 12.2 Sử dụng Dynamic Snippet có sẵn của Odoo

`website_blog` đã tích hợp sẵn snippet động **"Blog Posts"** (`s_blog_posts`). Để dùng ngay:

1. Vào trang website bất kỳ → **Edit**
2. Kéo block **"Blog Posts"** từ panel Snippets
3. Configure: chọn Blog, số bài, layout (Grid/List/Carousel)

Snippet này được định nghĩa tại: `views/snippets/s_blog_posts.xml`

---

## 13. Nâng cao: SCSS Styling cho Blog y tế

Tạo file `static/src/scss/blog/pk_blog.scss`:

```scss
// ==========================================
// PK Hoàn Hảo — Blog Healthcare Styling
// ==========================================
// Import biến từ primary_variables (đã được định nghĩa trong module)

// --- Blog card hover effect ---
.pk-blog-card {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    border-radius: 12px;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
    }

    .pk-blog-card-img img {
        transition: transform 0.4s ease;
    }

    &:hover .pk-blog-card-img img {
        transform: scale(1.05);
    }
}

// --- Medical disclaimer notice ---
.pk-medical-notice {
    border-left: 4px solid var(--o-color-1, #0e7cde) !important;
    background-color: rgba(14, 124, 222, 0.06) !important;
    border-radius: 8px;
    font-size: 0.875rem;
}

// --- Expert reviewer card ---
.pk-reviewer-card {
    border-radius: 12px;
    border-color: #e8f4fd !important;
    background: linear-gradient(135deg, #f8fbff 0%, #eef6ff 100%) !important;
}

// --- Reading time badge ---
.pk-reading-time {
    .badge {
        font-size: 0.8rem;
        border-radius: 20px;
        backdrop-filter: blur(8px);
    }
}

// --- Blog sidebar for clinic ---
#o_wblog_sidebar {
    .o_wblog_sidebar_block {
        border-radius: 12px;
        padding: 1.5rem !important;
        background: #f8f9fa;
        margin-bottom: 1.5rem;

        h6 {
            color: var(--o-color-1, #0e7cde);
            letter-spacing: 0.05em;
            font-size: 0.75rem;
        }
    }
}

// --- Blog post cover overlay text ---
#o_wblog_post_name {
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

// --- Responsive: mobile blog cards ---
@media (max-width: 576px) {
    .pk-blog-card .pk-blog-card-img {
        height: 160px !important;
    }
}
```

Đăng ký SCSS trong `__manifest__.py`:

```python
"assets": {
    "web.assets_frontend": [
        ...
        "pk_hoan_hao/static/src/scss/blog/pk_blog.scss",  # thêm dòng này
    ],
},
```

---

## 14. SEO & Multilingual (Đa ngôn ngữ)

### 14.1 SEO tự động

`blog.post` đã kế thừa `website.seo.metadata`, tự động tạo:

```python
# metadata mặc định của blog post (trong website_blog.py)
res['default_opengraph']['og:description'] = self.subtitle
res['default_opengraph']['og:type'] = 'article'
res['default_opengraph']['article:published_time'] = self.post_date
res['default_opengraph']['article:tag'] = self.tag_ids.mapped('name')
res['default_opengraph']['og:image'] = # ảnh từ cover_properties
```

Trong **Website Editor**: mỗi bài viết có tab **SEO** để chỉnh:
- `meta_title`, `meta_description`, `meta_keywords`

### 14.2 Đa ngôn ngữ (Việt/Anh)

Các field có `translate=True`:
- `blog.blog`: `name`, `subtitle`
- `blog.post`: `name`, `subtitle`, `content`, `teaser`
- `blog.tag`: `name`, `blog.tag.category`: `name`

**Cách thêm bản dịch tiếng Việt:**

Option 1 — Qua Website Editor: chuyển ngôn ngữ → sửa trực tiếp  
Option 2 — Qua `.po` file (như file `i18n/vi_VN.po` trong dự án):

```po
msgid "Our blog"
msgstr "Blog PK Hoàn Hảo"

msgid "Health News"
msgstr "Tin tức Sức khỏe"
```

Option 3 — Qua XML `ir.translation`:

```xml
<record id="blog_suc_khoe_vi" model="ir.translation">
    <field name="name">blog.blog,name</field>
    <field name="res_id" ref="pk_hoan_hao.blog_suc_khoe"/>
    <field name="lang">vi_VN</field>
    <field name="value">Tin tức Sức khỏe</field>
    <field name="state">translated</field>
</record>
```

---

## 15. Checklist tích hợp hoàn chỉnh

### ✅ Giai đoạn 1: Cài đặt cơ bản

- [x] `website_blog` đã trong `depends` của `pk_hoan_hao`
- [ ] Tạo `data/blog_data.xml` với blogs, tags cho phòng khám
- [ ] Thêm `data/blog_data.xml` vào `__manifest__.py`
- [ ] Đặt tên menu Blog phù hợp tiếng Việt

### ✅ Giai đoạn 2: Giao diện

- [ ] Tạo `views/blog_customizations.xml` với các template override
- [ ] Thêm thông tin phòng khám vào sidebar
- [ ] Thêm CTA "Đặt lịch khám" sau mỗi bài viết
- [ ] Tạo SCSS blog healthcare styling
- [ ] Đăng ký SCSS vào `assets`

### ✅ Giai đoạn 3: Custom Fields (nâng cao)

- [ ] Tạo `models/blog_post.py` với custom fields
- [ ] Cập nhật `models/__init__.py` & `pk_hoan_hao/__init__.py`
- [ ] Thêm template hiển thị `pk_reading_time`
- [ ] Thêm template hiển thị `pk_reviewer_id` (chuyên gia)
- [ ] Thêm medical disclaimer template

### ✅ Giai đoạn 4: Snippet trang chủ

- [ ] Tạo snippet `s_pk_latest_posts.xml`
- [ ] Đăng ký snippet vào snippets panel
- [ ] Dùng snippet trên trang chủ hoặc trang dịch vụ

### ✅ Giai đoạn 5: SEO & Đa ngôn ngữ

- [ ] Bật `vi_VN` trong Settings → Languages
- [ ] Dịch tên blogs, tags sang tiếng Việt
- [ ] Cấu hình meta description cho từng blog

---

## 📝 Ghi chú quan trọng

> [!IMPORTANT]
> **Không sửa trực tiếp** file trong `odoo/addons/website_blog/`. Luôn dùng **XML inheritance** (`inherit_id`) trong module `pk_hoan_hao` để override template.

> [!WARNING]
> Khi dùng `t-value="request.env['blog.post'].sudo()"` trong template QWeb, đảm bảo bọc trong `sudo()` để tránh lỗi access rights với khách vô danh (public user).

> [!TIP]
> `cover_properties` là JSON string. Để đọc trong template: `t-set="_cp" t-value="json.loads(post.cover_properties)"` — biến `json` đã có sẵn trong QWeb context của Odoo.

> [!NOTE]
> Slug URL của blog/post được sinh tự động từ tên (`name`). Blog tên **"Tin tức Sức khỏe"** sẽ có slug `tin-tuc-suc-khoe-1`. Số `1` là `id`. Không thể tùy chỉnh slug mà không override `ir.http._slug()`.

# Phần 13: Going Live — Deploy Production

> **Tài liệu gốc:** [Going live](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/going_live.html)
> **Mục tiêu:** Publish theme lên môi trường production.

---

## 1. Checklist Trước Khi Deploy

### Performance

- [ ] Tất cả ảnh đã được tối ưu (WebP/compressed JPEG)
- [ ] CSS/JS được bundle (production mode, không cần `--dev=xml`)
- [ ] Không có `console.log` trong code production
- [ ] Lazy loading cho ảnh dưới fold
- [ ] Fonts dùng `font-display: swap`

### SEO

- [ ] Meta title và description cho tất cả trang
- [ ] OG image (1200×630px) cho social sharing
- [ ] Sitemap đã được tạo (Odoo tự tạo tại `/sitemap.xml`)
- [ ] `robots.txt` phù hợp
- [ ] Canonical URLs

### Chức năng

- [ ] Tất cả forms hoạt động và submit đúng
- [ ] Language switcher hoạt động (nếu đa ngôn ngữ)
- [ ] Shopping cart và checkout hoạt động (nếu có shop)
- [ ] Newsletter subscription hoạt động
- [ ] Social media links đúng
- [ ] Contact info đúng

### Kỹ thuật

- [ ] Không có JS errors trong console
- [ ] Mobile responsive hoạt động tốt
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Accessibility cơ bản (alt text, contrast ratio)

---

## 2. Chuẩn Bị Module cho Production

### 2.1 Cập nhật `__manifest__.py`

```python
{
    'name': 'Airproof Theme',
    'description': 'Professional drone company website theme',
    'category': 'Website/Theme',
    'version': '18.0.1.0.0',  # ← Đặt version chính xác
    'author': 'Your Company',
    'website': 'https://yourcompany.com',
    'license': 'LGPL-3',
    'depends': [
        'website',
        'website_sale',
        'website_sale_wishlist',
        'website_blog',
        'website_mass_mailing',
    ],
    'data': [
        # Đảm bảo thứ tự load đúng
        'views/snippets/options.xml',
        'views/snippets/s_airproof_carousel.xml',
        'data/presets.xml',
        'data/website.xml',
        'data/menu.xml',
        'data/gradients.xml',
        'data/shapes.xml',
        'data/pages/home.xml',
        'data/pages/contact.xml',
        'views/new_page_template_templates.xml',
        'views/website_templates.xml',
        'views/website_sale_templates.xml',
        'views/website_sale_wishlist_templates.xml',
        'data/images.xml',
    ],
    'assets': {
        'web._assets_primary_variables': [
            'website_airproof/static/src/scss/primary_variables.scss',
        ],
        'web._assets_frontend_helpers': [
            ('prepend', 'website_airproof/static/src/scss/bootstrap_overridden.scss'),
        ],
        'web.assets_frontend': [
            'website_airproof/static/src/scss/font.scss',
            'website_airproof/static/src/scss/components/animations.scss',
            'website_airproof/static/src/scss/components/mouse_follower.scss',
            'website_airproof/static/src/scss/layout/header.scss',
            'website_airproof/static/src/scss/pages/product_page.scss',
            'website_airproof/static/src/scss/pages/shop.scss',
            'website_airproof/static/src/scss/snippets/caroussel.scss',
            'website_airproof/static/src/scss/snippets/newsletter.scss',
            'website_airproof/static/src/snippets/s_airproof_carousel/000.scss',
            'website_airproof/static/src/js/animations.js',
            'website_airproof/static/src/js/mouse_follower.js',
        ],
    },
    'new_page_templates': {
        'airproof': {
            'services': ['s_parallax', 's_call_to_action', 's_airproof_carousel']
        }
    },
    'application': False,  # Theme không phải application
    'installable': True,
}
```

### 2.2 Tạo Module `description/` cho App Store

```
static/description/
├── icon.png          ← 128×128px (icon module)
├── banner.jpg        ← 1240×620px (App Store banner)
└── index.html        ← Mô tả module (HTML)
```

`static/description/index.html`:
```html
<section class="oe_container oe_mb16">
    <div class="oe_row oe_spaced">
        <h2 class="oe_slogan">Airproof Theme</h2>
        <h3 class="oe_slogan">Professional Website Theme for Drone Companies</h3>
        <p class="oe_mt8 oe_mb16 text-center">
            A premium, modern website theme designed for drone manufacturers
            and aerial photography companies.
        </p>
    </div>
</section>

<section class="oe_container">
    <div class="oe_row oe_spaced">
        <h3>Features</h3>
        <ul>
            <li>Custom Header with Mega Menu</li>
            <li>Newsletter integration</li>
            <li>Shop customization</li>
            <li>Custom animations</li>
            <li>i18n ready</li>
        </ul>
    </div>
</section>
```

---

## 3. Deploy lên Odoo.sh

### 3.1 Push code lên GitHub

```bash
# Thêm module vào git repo
git add tutorials/website_airproof/
git commit -m "feat: add Airproof website theme"
git push origin main
```

### 3.2 Kết nối Odoo.sh với GitHub

1. Vào [odoo.sh](https://www.odoo.sh)
2. **Projects** → **Create a new project** (hoặc chọn project có sẵn)
3. **Repository** → Link với GitHub repo
4. Odoo.sh tự động deploy khi bạn push code

### 3.3 Install Theme

1. Vào Odoo.sh Production branch
2. **Apps** → Tìm "Airproof Theme"
3. Click **Install**

---

## 4. Deploy tự quản (Self-hosted)

### 4.1 Chuẩn bị server

```nginx
# Nginx config
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP → HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Gzip
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;

    # Proxy to Odoo
    location / {
        proxy_pass http://127.0.0.1:8069;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    # Static files (cache lâu hơn)
    location /web/static/ {
        proxy_cache_valid 200 60d;
        proxy_buffering on;
        expires 864000;
        proxy_pass http://127.0.0.1:8069;
    }
}
```

### 4.2 Chạy Odoo trong Production

```bash
# KHÔNG dùng --dev=xml trong production!
./odoo-bin \
    --addons-path=/path/to/enterprise,/path/to/addons,/path/to/tutorials \
    -d production_db \
    --db-filter=production_db \
    --workers=4 \
    --max-cron-threads=2 \
    --without-demo=all \
    --logfile=/var/log/odoo/odoo.log
```

---

## 5. Cấu Hình SSL (HTTPS)

HTTPS là bắt buộc cho website production. Dùng Let's Encrypt miễn phí:

```bash
# Cài certbot
sudo apt install certbot python3-certbot-nginx

# Tạo certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renew
sudo certbot renew --dry-run
```

---

## 6. Odoo System Parameters

Cấu hình production trong Odoo:

**Settings → Technical → Parameters → System Parameters:**

| Key | Value |
|-----|-------|
| `web.base.url` | `https://yourdomain.com` |
| `web.base.url.freeze` | `True` |

---

## 7. Website Published State

Đảm bảo tất cả pages đã được publish:

```python
# Qua shell Odoo
env['website.page'].search([]).write({'website_published': True})
```

Hoặc qua Website Builder: Click nút **Publish** màu xanh trên từng trang.

---

## 8. Cache và Performance

### Bật HTTP Cache:

```bash
# Thêm vào Odoo config
proxy_mode = True
```

### Long-polling cho realtime:

```bash
--gevent-port=8072
```

### CDN (khuyến khích):

1. **Website → Configuration → Settings → CDN**
2. Thêm CDN URL (Cloudflare, AWS CloudFront...)
3. Static assets sẽ được serve qua CDN

---

## 9. Backup Strategy

```bash
# Backup database hàng ngày
pg_dump production_db | gzip > /backup/odoo_$(date +%Y%m%d).sql.gz

# Backup filestore
rsync -av /home/odoo/.local/share/Odoo/filestore/production_db/ /backup/filestore/

# Giữ 30 ngày backup
find /backup/ -name "*.sql.gz" -mtime +30 -delete
```

---

## Tóm Tắt Toàn Bộ Quy Trình

```
1. Setup môi trường (01_setup)
   └── Cài Odoo source, tạo DB, chạy server

2. Theming (02_theming)
   └── primary_variables.scss, bootstrap_overridden.scss, font.scss

3. Layout (03_layout)
   └── Custom header, footer, copyright trong website_templates.xml

4. Navigation (04_navigation)
   └── menu.xml, mega menu template

5. Pages (05_pages)
   └── home.xml, contact.xml, page templates

6. Media (06_media)
   └── images.xml, fonts, favicon

7. Building Blocks (07_building_blocks)
   └── Custom carousel snippet, options

8. Shapes (08_shapes)
   └── SVG shape files, shapes.xml

9. Gradients (09_gradients)
   └── gradients.xml

10. Animations (10_animations)
    └── CSS animations, JS mouse follower

11. Forms (11_forms)
    └── Contact form, CRM lead form, newsletter

12. Translations (12_translations)
    └── i18n/vi.po, ngôn ngữ website

13. Going Live (13_going_live) ← BẠN ĐANG Ở ĐÂY
    └── Deploy production, SSL, performance
```

🎉 **Chúc mừng! Bạn đã hoàn thành Odoo Website Theme development!**

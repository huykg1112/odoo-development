# Phần 1: Setup — Cài Đặt Môi Trường

> **Tài liệu gốc:** [Setup](https://www.odoo.com/documentation/18.0/developer/howtos/website_themes/setup.html)
> **Mục tiêu:** Thiết lập môi trường dev, hiểu cấu trúc DB Odoo, chạy được server.

---

## 1. Kiến Thức Nền — Cấu Trúc Odoo Database

Trước khi code, cần hiểu Odoo hoạt động theo 3 tầng:

### 1.1 Models (Dữ liệu)

Model là nền tảng của Odoo, lưu dữ liệu vào database. Có thể xem tất cả models tại:
**Settings → Technical → Database Structure → Models** (cần bật developer mode).

**Các loại field:**

| Loại | Mô tả | Ví dụ |
|------|--------|-------|
| `Char` | Chuỗi ngắn | Tên sản phẩm |
| `Text` | Đoạn văn | Mô tả |
| `Date` / `Datetime` | Ngày tháng | Ngày tạo |
| `Boolean` | True/False | Đã published? |
| `Many2one` | Chọn 1 record từ model khác | Customer của quotation |
| `One2many` | Danh sách records liên quan | Quotations của một contact |
| `Many2many` | Nhiều-nhiều | Tags của sản phẩm |

### 1.2 Views (Giao diện)

Views định nghĩa cách hiển thị data — viết bằng XML.

**Backend views:** Kanban, List, Form, Calendar, Pivot...
**Frontend view:** QWeb (dùng cho website)

**Phân loại:**

| Loại | Mô tả |
|------|--------|
| **Base view** | View gốc của Odoo. **Không bao giờ sửa trực tiếp!** |
| **Inherited view** | Kế thừa từ base view, có `inherit_id`. Cách chúng ta custom theme |
| **Duplicated view** | Bản copy do Odoo tạo khi user chỉnh sửa qua Website Builder |

**Static vs Dynamic pages:**
- **Static:** Nội dung cố định (homepage, contact page) — có URL tùy chỉnh
- **Dynamic:** Tự động tạo (product page, blog post) — URL động theo record ID

---

## 2. Cài Đặt Môi Trường

### 2.1 Cài đặt Odoo từ source

Odoo theme development yêu cầu chạy từ source code (không phải Docker hay package):

```bash
# Clone Odoo source
git clone https://github.com/odoo/odoo.git -b 18.0 --depth=1
git clone https://github.com/odoo/enterprise.git -b 18.0 --depth=1

# Tạo Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Cài dependencies
pip install -r odoo/requirements.txt

# Cài PostgreSQL (Ubuntu/Debian)
sudo apt install postgresql
sudo -u postgres createuser -s $USER
```

### 2.2 Cấu hình database cho dự án

Tạo database mới với module website:

```bash
# Tạo database
createdb airproof_dev

# Chạy Odoo lần đầu để init database
./odoo-bin \
    --addons-path=enterprise,addons,../tutorials \
    -d airproof_dev \
    --without-demo=all \
    -i website,website_sale \
    --dev=xml
```

### 2.3 Import database hiện có (nếu cần)

Nếu bạn đang customize theme cho client đã có Odoo SaaS/Odoo.sh:

#### Export từ Odoo SaaS:
1. Đăng nhập với account có đủ quyền
2. Truy cập: `<database_url>/saas_worker/dump`
3. Download file `.sql`

#### Export từ Odoo.sh:
1. Vào Odoo.sh → chọn branch
2. Tab **BACKUPS** → **Create Backup**
3. Download → chọn **Testing** + **With filestore**

#### Import vào local:
```bash
# Tạo database trống
createdb <database_name>

# Import SQL
psql <database_name> < dump.sql

# Reset admin password
psql -c "UPDATE res_users SET login='admin', password='admin' WHERE id=2;" <database_name>

# Tắt 2FA nếu cần
psql -c "UPDATE res_users SET totp_secret='' WHERE id=2;" <database_name>
```

#### Di chuyển filestore:
```
# Windows:
C:\Users\<User>\AppData\Roaming\Odoo\filestore\<database_name>\

# Linux:
/home/<User>/.local/share/Odoo/filestore/<database_name>/
```

---

## 3. Script Chạy Server

Tạo file `run.sh` (hoặc `run.bat` trên Windows) để tiện chạy:

```bash
#!/bin/bash
# run.sh

./odoo-bin \
    --addons-path=../enterprise,addons,../tutorials \
    --db-filter=airproof_dev \
    -d airproof_dev \
    --without-demo=all \
    --dev=xml
```

**Giải thích các tham số:**

| Tham số | Mô tả |
|---------|--------|
| `--addons-path` | Danh sách thư mục chứa modules, cách nhau bởi dấu phẩy |
| `-d` / `--database` | Database sử dụng |
| `--db-filter` | Chỉ hiện database match pattern này |
| `-i` / `--init` | Install modules khi khởi động (cần `-d`) |
| `-u` / `--update` | Update modules khi khởi động (cần `-d`) |
| `--without-demo` | Không load demo data (`all` = tất cả modules) |
| `--dev=xml` | **Quan trọng!** Reload XML mà không cần restart |

> **`--dev=xml` là tham số quan trọng nhất khi phát triển theme!** Nó cho phép Odoo reload các file XML/SCSS/JS ngay khi bạn refresh trình duyệt, không cần restart server.

### Chạy trên Windows (PowerShell):

```powershell
# run.ps1
python odoo-bin `
    --addons-path="../enterprise,addons,../tutorials" `
    --db-filter=airproof_dev `
    -d airproof_dev `
    --without-demo=all `
    --dev=xml
```

---

## 4. Tạo Module Theme Từ Đầu

### 4.1 Scaffold module (tạo tự động)

```bash
./odoo-bin scaffold --theme website_mytheme ../tutorials/
```

Lệnh này tạo cấu trúc cơ bản tự động.

### 4.2 Tạo thủ công (khuyến khích để hiểu rõ)

Tạo thư mục và file tối thiểu:

```
tutorials/website_mytheme/
├── __init__.py           ← Để trống
└── __manifest__.py       ← Khai báo module
```

#### `__init__.py`:
```python
# Để trống hoàn toàn
```

#### `__manifest__.py` tối thiểu:
```python
{
    'name': 'My Theme',
    'description': 'My custom Odoo website theme',
    'category': 'Website/Theme',
    'version': '18.0.1.0',
    'author': 'Your Name',
    'license': 'LGPL-3',
    'depends': ['website'],
    'data': [],
    'assets': {},
}
```

### 4.3 Install module

```bash
# Restart server với -i để install
./odoo-bin -d airproof_dev -i website_mytheme --dev=xml

# Hoặc qua UI: Apps → tìm "My Theme" → Install
```

---

## 5. Thiết Lập Website

Sau khi cài xong, cấu hình website cơ bản:

1. Vào **Website** → **Configuration** → **Settings**
2. Đặt tên website, domain
3. Bật các tính năng cần: shop, blog, events...

### Bật Developer Mode:

URL: `Settings → Developer Tools → Activate Developer Mode`
Hoặc thêm `?debug=1` vào URL.

> **Tip:** Dùng `?debug=assets` để xem file CSS/JS gốc thay vì bundled version.

---

## 6. Workflow Phát Triển Theme

```
1. Sửa file (SCSS/XML/Python)
          ↓
2. Refresh trình duyệt (với --dev=xml)
          ↓
3. Kiểm tra trên website
          ↓
4. (Nếu sửa Python/manifest) Restart server với -u <module>
```

### Khi nào cần restart server:

| Thay đổi | Cần restart? |
|----------|-------------|
| SCSS | Không (với `--dev=xml`) |
| XML templates | Không (với `--dev=xml`) |
| `__manifest__.py` | **Có** |
| Python files | **Có** |
| Thêm file mới vào assets | **Có** (cần `-u module_name`) |

---

## Checklist Bước 1

- [ ] Cài đặt Odoo từ source code
- [ ] Tạo database `airproof_dev`  
- [ ] Chạy server với `--dev=xml`
- [ ] Truy cập `http://localhost:8069` thành công
- [ ] Bật Developer Mode
- [ ] Tạo thư mục module `website_airproof` với `__manifest__.py`
- [ ] Install module thành công
- [ ] Truy cập website tại `http://localhost:8069/web#action=website.action_website`

**Bước tiếp theo:** [Phần 2 — Theming](./02_theming.md)

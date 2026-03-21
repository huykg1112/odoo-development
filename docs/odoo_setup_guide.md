# Hướng Dẫn Cài Đặt & Chạy Dự Án Odoo 18 với Module Tutorials

## Tổng Quan Dự Án

| Thông tin | Chi tiết |
|-----------|----------|
| **Odoo Version** | 18.0 (Final) |
| **Python** | 3.12.10 |
| **Đường dẫn gốc** | `F:\BMS\Odoo` |
| **Odoo Source** | `F:\BMS\Odoo\odoo` |
| **Virtual Env** | `F:\BMS\Odoo\odoo-venv` |
| **Tutorial Modules** | `F:\BMS\Odoo\tutorials` (6 modules) |

### Các Module Tutorial

| Module | Mô tả | Dependencies |
|--------|--------|-------------|
| `awesome_owl` | Discover JS framework - Owl Components | `base`, `web` |
| `awesome_dashboard` | Discover JS framework - Build a Dashboard | `base`, `web`, `mail`, `crm` |
| `awesome_clicker` | Master Odoo web framework - Clicker Game | `base`, `web` |
| `awesome_gallery` | Master Odoo web framework - Gallery View | `web`, `contacts` |
| `awesome_kanban` | Master Odoo web framework - Kanban View | `web`, `crm` |
| `website_airproof` | Airproof Theme (Drones, Camera) | `website_sale`, `website_sale_wishlist`, `website_blog`, `website_mass_mailing` |

---

## Yêu Cầu Hệ Thống

> [!IMPORTANT]
> Bắt buộc phải cài đặt **PostgreSQL** trước khi chạy Odoo. Odoo không hỗ trợ MySQL/SQLite.

### Phần mềm cần có

1. **Python 3.12+** — Đã có tại [C:\ServBay\packages\python\3.12\python.exe](file:///ServBay/packages/python/3.12/python.exe)
2. **PostgreSQL 14+** — [Tải tại đây](https://www.postgresql.org/download/windows/)
3. **Git** — Để quản lý source code
4. **Virtual Environment** — Đã tạo sẵn tại `F:\BMS\Odoo\odoo-venv`

---

## Các Bước Cài Đặt

### Bước 1: Cài Đặt PostgreSQL

1. Tải và cài đặt PostgreSQL từ [postgresql.org](https://www.postgresql.org/download/windows/)
2. Trong quá trình cài đặt, **ghi nhớ mật khẩu** cho user `postgres`
3. Sau khi cài xong, mở **pgAdmin** hoặc **psql** và tạo user cho Odoo:

```sql
-- Mở psql với user postgres
-- Tạo user odoo với quyền CREATEDB
CREATE USER odoo WITH PASSWORD 'odoo' CREATEDB;
```

Hoặc dùng lệnh command line:

```powershell
# Chạy lệnh này trong PowerShell (thay đổi path nếu cần)
& "C:\Program Files\PostgreSQL\16\bin\createuser.exe" -U postgres -s -d -P odoo
```

> [!TIP]
> Bạn có thể dùng user `postgres` trực tiếp thay cho tạo user `odoo` riêng, nhưng khuyến khích tạo user riêng cho bảo mật.

---

### Bước 2: Kích Hoạt Virtual Environment & Cài Dependencies

```powershell
# Kích hoạt virtual environment
F:\BMS\Odoo\odoo-venv\Scripts\Activate.ps1

# Cài đặt các dependencies của Odoo
pip install -r F:\BMS\Odoo\odoo\requirements.txt

# Cài thêm pypiwin32 (cần thiết cho Windows)
pip install pypiwin32
```

> [!NOTE]
> Nếu gặp lỗi khi cài `psycopg2`, thử cài `psycopg2-binary` thay thế:
> ```powershell
> pip install psycopg2-binary
> ```

---

### Bước 3: Tạo Database cho Odoo

Có 2 cách:

**Cách 1: Để Odoo tự tạo** (khuyến khích cho lần đầu)

Odoo sẽ tự tạo database khi bạn truy cập giao diện web. Bạn chỉ cần chạy server (Bước 4).

**Cách 2: Tạo trước bằng lệnh**

```powershell
& "C:\Program Files\PostgreSQL\16\bin\createdb.exe" -U odoo odoo_tutorials
```

---

### Bước 4: Chạy Odoo Server

```powershell
# Đảm bảo đã kích hoạt virtual environment
F:\BMS\Odoo\odoo-venv\Scripts\Activate.ps1

# Chạy Odoo với addons path bao gồm thư mục tutorials
python F:\BMS\Odoo\odoo\odoo-bin `
  --addons-path=F:\BMS\Odoo\odoo\addons,F:\BMS\Odoo\tutorials `
  --db_user=odoo `
  --db_password=odoo `
  -d odoo_tutorials
```

> [!IMPORTANT]
> **Giải thích các tham số:**
> - `--addons-path` — Đường dẫn tới các thư mục chứa module (bao gồm cả `tutorials`)
> - `--db_user` / `--db_password` — Thông tin đăng nhập PostgreSQL
> - `-d odoo_tutorials` — Tên database (sẽ tự tạo nếu chưa có)

---

### Bước 5: Truy Cập Odoo

1. Mở trình duyệt tại: **http://localhost:8069**
2. Nếu database chưa được tạo, bạn sẽ thấy trang **Database Manager**:
   - **Master Password**: `admin` (mặc định)
   - **Database Name**: `odoo_tutorials`
   - **Email**: nhập email admin
   - **Password**: nhập mật khẩu admin
   - Nhấn **Create Database**
3. Sau khi tạo xong, đăng nhập với email/password vừa tạo

---

### Bước 6: Cài Đặt Tutorial Modules

1. Đăng nhập vào Odoo → Vào menu **Apps**
2. Bấm **Update Apps List** (có thể cần bật **Developer Mode** trước)
3. Tìm kiếm module tutorial bạn muốn cài (ví dụ: `Awesome Owl`)
4. Nhấn **Install**

**Bật Developer Mode:**
- Vào **Settings** → cuộn xuống → nhấn **Activate the developer mode**
- Hoặc truy cập: `http://localhost:8069/web?debug=1`

---

## Cấu Hình Nâng Cao (Tuỳ Chọn)

### Sử dụng File Config

Tạo file `odoo.conf` tại `F:\BMS\Odoo\odoo.conf`:

```ini
[options]
; Đường dẫn addons
addons_path = F:\BMS\Odoo\odoo\addons,F:\BMS\Odoo\tutorials

; Database
db_host = localhost
db_port = 5432
db_user = odoo
db_password = odoo
db_name = odoo_tutorials

; Server
http_port = 8069

; Admin
admin_passwd = admin

; Logging
log_level = info
```

Chạy Odoo với file config:

```powershell
python F:\BMS\Odoo\odoo\odoo-bin -c F:\BMS\Odoo\odoo.conf
```

### Dev Mode với Auto-Reload

Khi phát triển, dùng `--dev` để tự động reload khi thay đổi code:

```powershell
python F:\BMS\Odoo\odoo\odoo-bin `
  --addons-path=F:\BMS\Odoo\odoo\addons,F:\BMS\Odoo\tutorials `
  --db_user=odoo `
  --db_password=odoo `
  -d odoo_tutorials `
  --dev=reload,xml
```

> [!TIP]
> `--dev=reload,xml` sẽ:
> - **reload**: Tự restart server khi thay đổi file Python
> - **xml**: Tự cập nhật views XML mà không cần restart

---

## Xử Lý Lỗi Thường Gặp

### 1. `psycopg2` không cài được

```powershell
pip install psycopg2-binary
```

### 2. PostgreSQL connection refused

- Kiểm tra PostgreSQL service đang chạy: **Services** → tìm `postgresql` → **Start**
- Kiểm tra port 5432 không bị block bởi firewall

### 3. Module không hiển thị trong Apps

- Kiểm tra `--addons-path` đã bao gồm `F:\BMS\Odoo\tutorials`
- Vào **Settings** → bật **Developer Mode** → **Apps** → **Update Apps List**

### 4. Permission denied khi tạo database

- Đảm bảo user PostgreSQL có quyền `CREATEDB`:
  ```sql
  ALTER USER odoo CREATEDB;
  ```

### 5. Lỗi `wkhtmltopdf` khi in báo cáo PDF

- Tải và cài đặt [wkhtmltopdf](https://wkhtmltopdf.org/downloads.html) phiên bản 0.12.6 (with patched qt)
- Thêm vào PATH hoặc cấu hình trong `odoo.conf`

---

## Cấu Trúc Thư Mục Dự Án

```
F:\BMS\Odoo\
├── odoo/                          # Odoo 18.0 source code
│   ├── addons/                    # Built-in addons (sale, purchase, ...)
│   ├── odoo/                      # Core framework
│   ├── odoo-bin                   # Entry point để chạy server
│   ├── requirements.txt           # Python dependencies
│   └── setup.py
├── odoo-venv/                     # Python 3.12.10 virtual environment
│   ├── Lib/
│   ├── Scripts/                   # activate, pip, python...
│   └── pyvenv.cfg
├── tutorials/                     # Tutorial modules (addons)
│   ├── awesome_owl/               # Owl Components tutorial
│   ├── awesome_dashboard/         # Dashboard tutorial
│   ├── awesome_clicker/           # Clicker Game tutorial
│   ├── awesome_gallery/           # Gallery View tutorial
│   ├── awesome_kanban/            # Kanban View tutorial
│   └── website_airproof/          # Airproof Theme
└── skills-lock.json               # Skill lock config
```

---

## Lệnh Nhanh (Quick Reference)

```powershell
# 1. Kích hoạt venv
F:\BMS\Odoo\odoo-venv\Scripts\Activate.ps1

# 2. Cài dependencies
pip install -r F:\BMS\Odoo\odoo\requirements.txt

# 3. Chạy Odoo (lần đầu)
python F:\BMS\Odoo\odoo\odoo-bin --addons-path=F:\BMS\Odoo\odoo\addons,F:\BMS\Odoo\tutorials --db_user=odoo --db_password=odoo -d odoo_tutorials

# 4. Chạy Odoo (dev mode)
python F:\BMS\Odoo\odoo\odoo-bin --addons-path=F:\BMS\Odoo\odoo\addons,F:\BMS\Odoo\tutorials --db_user=odoo --db_password=odoo -d odoo_tutorials --dev=reload,xml

# 5. Cập nhật module cụ thể
python F:\BMS\Odoo\odoo\odoo-bin --addons-path=F:\BMS\Odoo\odoo\addons,F:\BMS\Odoo\tutorials --db_user=odoo --db_password=odoo -d odoo_tutorials -u awesome_owl

# 6. Cài module từ command line
python F:\BMS\Odoo\odoo\odoo-bin --addons-path=F:\BMS\Odoo\odoo\addons,F:\BMS\Odoo\tutorials --db_user=odoo --db_password=odoo -d odoo_tutorials -i awesome_owl
```

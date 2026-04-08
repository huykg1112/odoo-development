# Windows PowerShell

New-Item -ItemType Directory -Force -Path controllers, data, models, reports, security, static\description, static\fonts, static\shapes, static\src\css, static\src\img, static\src\js, static\src\scss, static\src\snippets, tests, views, wizards

New-Item -ItemType File -Force -Path __init__.py, __manifest__.py, controllers\__init__.py, models\__init__.py, security\ir.model.access.csv, tests\__init__.py, wizards\__init__.py

# Windows Command Prompt (CMD)

mkdir controllers data models reports security static\description static\fonts static\shapes static\src\css static\src\img static\src\js static\src\scss static\src\snippets tests views wizards

type nul > __init__.py
type nul > __manifest__.py
type nul > controllers\__init__.py
type nul > models\__init__.py
type nul > security\ir.model.access.csv
type nul > tests\__init__.py
type nul > wizards\__init__.py


Phân tích câu lệnh của bạn: python odoo\odoo-bin -c odoo\odoo.conf --dev=all
python odoo\odoo-bin: Đây là lệnh cốt lõi để khởi chạy máy chủ Odoo.

-c odoo\odoo.conf (hoặc --config):

Ý nghĩa: Yêu cầu Odoo khởi chạy dựa trên các thiết lập đã được lưu sẵn trong tệp cấu hình (odoo.conf).

Khi nào dùng: Tệp cấu hình thường chứa sẵn các thông tin bảo mật và dài dòng như mật khẩu database, cổng (port), đường dẫn thư mục addons (addons_path). Việc dùng -c giúp bạn không phải gõ lại một chuỗi tham số dài mỗi lần khởi động lại server.

--dev=all:

Ý nghĩa: Kích hoạt chế độ lập trình viên toàn diện. Giá trị all thực chất là tổ hợp của các tính năng: xml,reload,qweb,access. Tính năng mạnh mẽ nhất của nó là buộc Odoo đọc trực tiếp giao diện (tệp XML, QWeb templates) từ các tệp mã nguồn thay vì đọc từ trong cơ sở dữ liệu. Nó cũng tự động tải lại (auto-reload) server khi bạn chỉnh sửa mã Python.

Khi nào dùng: Rất hữu ích và được khuyên dùng chỉ trong môi trường phát triển (Local/Dev). Nó giúp bạn thiết kế giao diện (như Website Snippets) và thấy ngay sự thay đổi trên trình duyệt khi F5 mà không cần phải gõ lệnh cập nhật (-u) module liên tục. Tuyệt đối không dùng cờ này trên môi trường Production vì nó làm giảm hiệu suất hệ thống.

Danh sách các lệnh và tham số Terminal phổ biến khác trong Odoo
Dưới đây là các nhóm lệnh Odoo CLI thường dùng nhất để quản lý module và cơ sở dữ liệu:

1. Nhóm lệnh Quản lý Module và Cơ sở dữ liệu
-d <tên_database> (hoặc --database):

Ý nghĩa: Chỉ định cơ sở dữ liệu (database) cụ thể mà Odoo sẽ làm việc.

Khi nào dùng: Bắt buộc phải có khi bạn muốn cài đặt (-i) hoặc cập nhật (-u) module bằng lệnh.

-u <tên_module> (hoặc --update):

Ý nghĩa: Cập nhật (Upgrade) một hoặc nhiều module (phân cách bằng dấu phẩy).

Khi nào dùng: Bất cứ khi nào bạn thay đổi cấu trúc bảng dữ liệu (Models/Python), quyền truy cập (Security), hoặc bạn thay đổi giao diện (XML) nhưng không bật cờ --dev=all. Ví dụ: python odoo-bin -c odoo.conf -d my_db -u website,sale.

-i <tên_module> (hoặc --init):

Ý nghĩa: Cài đặt mới một module vào database.

Khi nào dùng: Khi bạn vừa viết xong một module mới và muốn cài nó vào hệ thống thông qua terminal thay vì bấm nút "Install" trên giao diện web.

--addons-path <đường_dẫn>:

Ý nghĩa: Chỉ định các thư mục chứa mã nguồn module (phân tách bằng dấu phẩy).

Khi nào dùng: Khi bạn có các custom addons lưu ở một thư mục riêng bên ngoài mã nguồn mặc định của Odoo.

2. Nhóm lệnh Mạng và Máy chủ
-p <cổng> (hoặc --http-port):

Ý nghĩa: Đổi cổng HTTP mà Odoo sẽ lắng nghe (Mặc định là 8069).

Khi nào dùng: Khi bạn muốn chạy song song 2 phiên bản Odoo trên cùng một máy tính, bạn cần đổi cổng (ví dụ: -p 8070) để tránh xung đột.

3. Nhóm công cụ hỗ trợ Lập trình (Sub-commands)
Bên cạnh việc khởi chạy server thông thường, odoo-bin có tích hợp sẵn một số lệnh công cụ:

scaffold <tên_module> <thư_mục_đích>:

Ý nghĩa: Tự động sinh ra cấu trúc thư mục tiêu chuẩn (boilerplate/skeleton) cho một module Odoo mới.

Khi nào dùng: Khi bạn cần tạo nhanh một ứng dụng mới, lệnh này sẽ tạo sẵn các thư mục models, views, controllers cùng các tệp __manifest__.py cơ bản, giúp tiết kiệm thời gian thay vì tạo thủ công. Ví dụ: python odoo-bin scaffold my_custom_theme custom_addons/.

shell:

Ý nghĩa: Mở môi trường dòng lệnh tương tác Python (REPL) đã được nạp sẵn toàn bộ môi trường (Environment) của Odoo.

Khi nào dùng: Cực kỳ hữu ích để gỡ lỗi (debug), kiểm tra thử các câu truy vấn cơ sở dữ liệu (ORM) hoặc thao tác thay đổi dữ liệu nhanh mà không cần phải viết code vào module hay click trên giao diện web. Ví dụ: python odoo-bin shell -c odoo.conf -d my_db.
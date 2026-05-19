Tài liệu: Nhóm phương thức ORM trong Odoo (chi tiết từng tham số)

Mục tiêu
- Trình bày đầy đủ các method ORM cốt lõi trong Odoo.
- Giải thích lý thuyết, khi nào dùng, tại sao dùng.
- Phân tích chi tiết từng tham số và ví dụ cụ thể.
- Tài liệu có dấu tiếng Việt.

Phạm vi
- Nhóm ORM phổ biến nhất: search, search_count, search_read, browse, read, create, write, unlink,
  copy, copy_data, name_get, name_search, read_group, fields_get, default_get, exists,
  ensure_one, mapped, filtered, sorted.
- Các method nâng cao khác sẽ có ở phần kế tiếp khi bạn yêu cầu.

-------------------------------------------------------------------------------
1) Tổng quan về ORM method

Lý thuyết
- ORM method là các hàm thao tác recordset trong Odoo: truy vấn, tạo, cập nhật, xóa.
- Tất cả method đều chạy qua ORM, giúp kiểm soát quyền, tính nhất quán, và tự động hóa.

Tại sao cần hiểu ORM method
- Tránh lỗi dữ liệu do dùng SQL trực tiếp sai cách.
- Tận dụng cơ chế cache/prefetch giúp hiệu năng tốt hơn.
- Gắn với business logic, constraints, access rules.

-------------------------------------------------------------------------------
2) `search(domain, offset=0, limit=None, order=None, count=False)`

Lý thuyết
- Truy vấn recordset dựa trên domain.

Khi nào dùng
- Khi cần lấy danh sách bản ghi thỏa điều kiện.

Tại sao dùng
- Cách chuẩn để truy vấn dữ liệu trong ORM.

Tham số
- `domain`: danh sách điều kiện. Ví dụ: [('state', '=', 'draft'), ('price', '>', 0)].
- `offset`: bỏ qua n bản ghi đầu.
- `limit`: giới hạn số bản ghi trả về (None = không giới hạn).
- `order`: chuỗi sắp xếp, ví dụ 'create_date desc, name asc'.
- `count`: nếu True, trả về số lượng (int) thay vì recordset.

Ví dụ
```python
pets = self.env['product.pet'].search([('state', '=', 'available')], limit=10, order='create_date desc')
count = self.env['product.pet'].search([('state', '=', 'available')], count=True)
```

Lưu ý
- Dùng `search_count` khi chỉ cần số lượng.
- Không nên dùng `count=True` trong `search` nếu đã có `search_count`.

-------------------------------------------------------------------------------
3) `search_count(domain)`

Lý thuyết
- Trả về số lượng bản ghi thỏa domain.

Khi nào dùng
- Khi cần thống kê nhanh số lượng.

Tại sao dùng
- Tối ưu hơn `search(..., count=True)` trong nhiều trường hợp.

Tham số
- `domain`: điều kiện tìm kiếm.

Ví dụ
```python
total = self.env['product.pet'].search_count([('state', '=', 'available')])
```

-------------------------------------------------------------------------------
4) `search_read(domain, fields=None, offset=0, limit=None, order=None)`

Lý thuyết
- Kết hợp search và read, trả về list of dict.

Khi nào dùng
- Khi cần dữ liệu nhẹ để trả ra API, controller, hoặc báo cáo đơn giản.

Tại sao dùng
- Nhanh hơn gọi search rồi read riêng.

Tham số
- `domain`: điều kiện.
- `fields`: danh sách field cần đọc. None = đọc field mặc định.
- `offset`, `limit`, `order`: như `search`.

Ví dụ
```python
data = self.env['product.pet'].search_read(
    [('state', '=', 'available')],
    fields=['name', 'basic_price'],
    limit=5,
    order='name asc'
)
```

Lưu ý
- Không trả về recordset, nên không gọi method ORM trực tiếp trên kết quả.

-------------------------------------------------------------------------------
5) `browse(ids)`

Lý thuyết
- Tạo recordset từ id hoặc list id.
- Không truy vấn DB ngay, chỉ tạo “bộ đại diện”. DB được truy khi cần.

Khi nào dùng
- Khi bạn đã có id và muốn thao tác ORM tiếp theo.

Tại sao dùng
- Hiệu năng tốt do lazy loading.

Tham số
- `ids`: int hoặc list[int].

Ví dụ
```python
pet = self.env['product.pet'].browse(10)
# Chỉ khi truy cập field mới đọc DB
name = pet.name
```

Lưu ý
- `browse([])` trả recordset rỗng.
- Id không tồn tại -> recordset rỗng hoặc recordset “ma” (không raise ngay).

-------------------------------------------------------------------------------
6) `read(fields=None, load='_classic_read')`

Lý thuyết
- Đọc dữ liệu của recordset, trả về list of dict.

Khi nào dùng
- Khi đã có recordset, muốn lấy dữ liệu dạng dict.

Tại sao dùng
- Cần dữ liệu thô để xuất ra ngoài hoặc xử lý nhanh.

Tham số
- `fields`: list field cần đọc. None = đọc field mặc định.
- `load`: cách load dữ liệu. Mặc định `_classic_read`.

Ví dụ
```python
pets = self.env['product.pet'].search([('state', '=', 'available')], limit=3)
rows = pets.read(['name', 'basic_price'])
```

Lưu ý
- `read()` không trả recordset, không gọi method ORM trực tiếp trên kết quả.

-------------------------------------------------------------------------------
7) `create(vals)`

Lý thuyết
- Tạo một hoặc nhiều bản ghi.
- Thường override với `@api.model_create_multi`.

Khi nào dùng
- Khi cần tạo record mới.

Tại sao dùng
- ORM tự xử lý defaults, constraints, access rules.

Tham số
- `vals`: dict hoặc list[dict].
  - Key là tên field.
  - Value là giá trị tương ứng.

Ví dụ
```python
pet = self.env['product.pet'].create({
    'name': 'Tom',
    'state': 'available',
    'basic_price': 500.0,
})
```

Lưu ý
- Nên hỗ trợ batch create bằng `@api.model_create_multi`.

-------------------------------------------------------------------------------
8) `write(vals)`

Lý thuyết
- Cập nhật recordset.

Khi nào dùng
- Khi cần cập nhật field cho nhiều record.

Tại sao dùng
- ORM đảm bảo quyền, recompute, onchange server-side nếu cần.

Tham số
- `vals`: dict field -> value.

Ví dụ
```python
pets = self.env['product.pet'].search([('state', '=', 'draft')])
pets.write({'state': 'available'})
```

Lưu ý
- `write` trả True/False.
- Có thể override để enforce business rule.

-------------------------------------------------------------------------------
9) `unlink()`

Lý thuyết
- Xóa recordset khỏi DB.

Khi nào dùng
- Khi cần xóa dữ liệu (phải cân nhắc nghiệp vụ).

Tại sao dùng
- ORM kiểm soát quyền và các ràng buộc.

Tham số
- Không có.

Ví dụ
```python
pets = self.env['product.pet'].search([('state', '=', 'cancel')])
pets.unlink()
```

Lưu ý
- Có thể bị chặn bởi `@api.ondelete` hoặc constraints.

-------------------------------------------------------------------------------
10) `copy(default=None)`

Lý thuyết
- Sao chép bản ghi hiện tại.

Khi nào dùng
- Khi cần duplicate record làm bản nháp.

Tại sao dùng
- Tự xử lý copy theo cơ chế ORM.

Tham số
- `default`: dict giá trị override trong bản sao.

Ví dụ
```python
pet = self.env['product.pet'].browse(10)
pet_copy = pet.copy({'name': 'Tom (copy)'})
```

-------------------------------------------------------------------------------
11) `copy_data(default=None)`

Lý thuyết
- Trả về dữ liệu dict dùng để tạo bản sao.
- Không tạo record mới.

Khi nào dùng
- Khi cần tùy biến dữ liệu trước khi create.

Tham số
- `default`: dict override.

Ví dụ
```python
pet = self.env['product.pet'].browse(10)
vals = pet.copy_data({'name': 'Tom (draft)'})
new_pet = self.env['product.pet'].create(vals[0])
```

-------------------------------------------------------------------------------
12) `name_get()`

Lý thuyết
- Trả về danh sách tuple (id, display_name).

Khi nào dùng
- Khi hiển thị record trong selection/dropdown.

Tham số
- Không có.

Ví dụ
```python
pairs = self.env['product.pet'].search([]).name_get()
```

-------------------------------------------------------------------------------
13) `name_search(name='', args=None, operator='ilike', limit=100)`

Lý thuyết
- Tìm record theo tên hiển thị.

Khi nào dùng
- Dùng trong many2one search.

Tham số
- `name`: chuỗi tìm kiếm.
- `args`: domain bổ sung.
- `operator`: toán tử so sánh, mặc định `ilike`.
- `limit`: giới hạn kết quả.

Ví dụ
```python
partners = self.env['res.partner'].name_search(name='nguyen', operator='ilike', limit=20)
```

-------------------------------------------------------------------------------
14) `read_group(domain, fields, groupby, offset=0, limit=None, orderby=False, lazy=True)`

Lý thuyết
- Group by và aggregate dữ liệu.

Khi nào dùng
- Khi cần báo cáo nhóm theo field, tổng hợp (sum, count).

Tại sao dùng
- Hiệu năng cao hơn xử lý thủ công.

Tham số
- `domain`: điều kiện.
- `fields`: list field hoặc aggregate (vd 'price:sum').
- `groupby`: list field để group.
- `offset`, `limit`: phân trang.
- `orderby`: sắp xếp.
- `lazy`: True để phân cấp group, False để lấy full group.

Ví dụ
```python
res = self.env['product.pet.offer'].read_group(
    [('state', '=', 'open')],
    ['price:sum', 'id:count'],
    ['product_pet_id'],
    lazy=False
)
```

-------------------------------------------------------------------------------
15) `fields_get(allfields=None, attributes=None)`

Lý thuyết
- Lấy metadata của field.

Khi nào dùng
- Khi cần biết type, string, required, readonly...

Tham số
- `allfields`: list field cần lấy. None = tất cả.
- `attributes`: list thuộc tính cần lấy.

Ví dụ
```python
meta = self.env['product.pet'].fields_get(['name', 'state'], ['string', 'type', 'required'])
```

-------------------------------------------------------------------------------
16) `default_get(fields_list)`

Lý thuyết
- Lấy giá trị mặc định cho các field.

Khi nào dùng
- Khi cần chuẩn bị dữ liệu create hoặc form.

Tham số
- `fields_list`: list field.

Ví dụ
```python
defs = self.env['product.pet'].default_get(['state', 'basic_price'])
```

-------------------------------------------------------------------------------
17) `exists()`

Lý thuyết
- Lọc recordset chỉ giữ record còn tồn tại trong DB.

Khi nào dùng
- Khi nghi ngờ record đã bị xóa bởi process khác.

Ví dụ
```python
pets = self.env['product.pet'].browse([1, 2, 999])
valid = pets.exists()
```

-------------------------------------------------------------------------------
18) `ensure_one()`

Lý thuyết
- Đảm bảo recordset chỉ có 1 record, nếu không sẽ raise.

Khi nào dùng
- Khi method logic yêu cầu 1 record.

Ví dụ
```python
def action_confirm(self):
    self.ensure_one()
    self.state = 'confirmed'
```

-------------------------------------------------------------------------------
19) `mapped(expression)`

Lý thuyết
- Trích xuất field hoặc chain relation.

Khi nào dùng
- Lấy danh sách giá trị nhanh.

Tham số
- `expression`: tên field hoặc chuỗi chain (vd 'partner_id.name').

Ví dụ
```python
names = self.env['product.pet'].search([]).mapped('name')
```

-------------------------------------------------------------------------------
20) `filtered(func)`

Lý thuyết
- Lọc recordset bằng hàm Python.

Khi nào dùng
- Khi cần điều kiện phức tạp không dễ viết domain.

Tham số
- `func`: lambda nhận record, trả True/False.

Ví dụ
```python
pets = self.env['product.pet'].search([])
vip = pets.filtered(lambda r: r.basic_price > 1000)
```

-------------------------------------------------------------------------------
21) `sorted(key=None, reverse=False)`

Lý thuyết
- Sắp xếp recordset tại Python.

Khi nào dùng
- Khi sort theo logic phức tạp.

Tham số
- `key`: function tính key sort.
- `reverse`: đảo ngược.

Ví dụ
```python
pets = self.env['product.pet'].search([])
by_price = pets.sorted(key=lambda r: r.basic_price, reverse=True)
```

-------------------------------------------------------------------------------
Checklist nhanh
- Cần recordset? dùng `search`/`browse`.
- Cần list dict? dùng `search_read`/`read`.
- Cần số lượng? dùng `search_count`.
- Cần group/aggregate? dùng `read_group`.
- Cần validate 1 record? dùng `ensure_one`.

-------------------------------------------------------------------------------
Muốn thêm
- Nếu bạn muốn, mình sẽ viết tiếp nhóm method nâng cao: `with_context`, `sudo`, `with_company`,
  `check_access_rights`, `check_access_rule`, `message_post`, `message_subscribe`, ...

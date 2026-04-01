Tài liệu: Các decorator `@api` thường dùng trong Odoo

Mục đích
- Giải thích các decorator API phổ biến trong Odoo, khi nào dùng, ví dụ minh họa và best-practices.

Tổng quan ngắn
- `@api` là tập hợp decorator do Odoo cung cấp để định nghĩa hành vi phương thức (model-level, onchange, depends, constrains, ...).
- Decorator không chỉ giúp cú pháp nhất quán mà còn điều chỉnh cách ORM gọi và chuyển đổi tham số/kết quả.

Danh sách decorator thường dùng

1) `@api.model`
- Mô tả: Phương thức ở cấp model (không phụ thuộc record cụ thể). `self` là recordset trống mang kiểu model.
- Khi dùng: các hàm tiện ích, factory, tìm kiếm chung, hoặc method không cần id cụ thể.
- Ví dụ:
```python
@api.model
def find_by_name(self, name):
    return self.search([('name', '=', name)])
```

2) `@api.model_create_multi` (và cơ chế `model_create_single`)
- Mô tả: Dùng để override `create()` nhận danh sách `vals` (batch). Thích hợp cho import/batch create.
- Khi dùng: khi override `create()` cần xử lý nhiều bản ghi ở cùng lúc.
- Ví dụ (đã dùng trong module):
```python
@api.model_create_multi
def create(self, vals_list):
    # vals_list: list[dict]
    # kiểm tra server-side trước khi super()
    return super().create(vals_list)
```

3) `@api.depends(...)`
- Mô tả: Đánh dấu method compute (computed fields); liệt kê các field phụ thuộc.
- Khi dùng: khi khai báo `compute='_compute_x'` cho field.
- Lưu ý: không cập nhật field khác trong compute (vi phạm nguyên tắc ORM).
- Ví dụ:
```python
@api.depends('basic_price','bonus_price')
def _compute_final_price(self):
    for r in self:
        r.final_price = r.basic_price - r.bonus_price
```

4) `@api.constrains(...)`
- Mô tả: Thực thi kiểm tra nghiệp vụ khi `create()`/`write()`; raise `ValidationError` để rollback.
- Khi dùng: ràng buộc phức tạp không thể/không muốn diễn đạt bằng SQL.
- Lưu ý: chỉ kích hoạt nếu các field khai báo xuất hiện trong call; để đảm bảo trigger mọi trường hợp, có thể cần override `create()`/`write()` để buộc kiểm tra.
- Ví dụ:
```python
@api.constrains('price')
def _check_price(self):
    for r in self:
        if r.price <= 0:
            raise ValidationError("Price must be > 0")
```

5) `@api.onchange(...)`
- Mô tả: Chạy trên client khi user thay đổi field trên form (pseudo-record).
- Khi dùng: cập nhật UI tạm (set field, warning) trước khi lưu.
- Lưu ý: không đảm bảo server-side — phải luôn có kiểm tra server (create/write/constraints) cho rules quan trọng.
- Ví dụ:
```python
@api.onchange('pet_type')
def _onchange_pet_type(self):
    if self.pet_type == 'vip':
        self.basic_price = 1000.0
        return {'warning': {'title': 'Info','message': 'VIP price set'}}
```

6) `@api.depends_context(...)`
- Mô tả: Tương tự `@api.depends`, nhưng liệt kê các key trong `env.context` mà compute phụ thuộc vào. Khi giá trị context thay đổi, trường compute sẽ được tái tính.
- Khi dùng: khi giá trị compute thay đổi dựa trên context (ví dụ `pricelist`, `company`, `lang`), không phải trên các field của record.
- Ví dụ: tính giá hiển thị dựa trên pricelist id được chuyền trong context
```python
class Product(models.Model):
    _name = 'my.product'
    list_price = fields.Float()
    display_price = fields.Float(compute='_compute_display_price')

    @api.depends_context('pricelist')
    def _compute_display_price(self):
        for prod in self:
            pricelist_id = self.env.context.get('pricelist')
            if pricelist_id:
                pricelist = self.env['product.pricelist'].browse(pricelist_id)
                prod.display_price = pricelist._get_products_price(prod).get(prod.id, prod.list_price)
            else:
                prod.display_price = prod.list_price
```

7) `@api.ondelete(at_uninstall=...)`
- Mô tả: Đánh dấu một phương thức để chạy như một kiểm tra trước khi `unlink` (xóa). Thường đặt tên theo quy ước `_unlink_if_<cond>` hoặc `_unlink_except_<cond>`.
- `at_uninstall`: nếu `False` (mặc định) thì khi gỡ module, kiểm tra này sẽ bị bỏ qua (để không chặn uninstall). Nếu `True`, kiểm tra vẫn chạy khi uninstall.
- Khi dùng: ngăn chặn xóa bản ghi theo điều kiện nghiệp vụ (ví dụ không xóa đơn bán đã xác nhận).
- Ví dụ:
```python
class SaleOrder(models.Model):
    _inherit = 'sale.order'

    @api.ondelete(at_uninstall=False)
    def _unlink_if_not_draft(self):
        if any(order.state != 'draft' for order in self):
            raise UserError('Cannot delete confirmed orders.')
```

8) `@api.returns`, `@api.readonly`, `@api.private`, `@api.autovacuum`
- `@api.returns(model, downgrade=None, upgrade=None)`:
  - Mô tả: thông báo kiểu trả về cho method khi viết method tương thích cả hai kiểu API (record-style và traditional RPC-style). Hữu ích nếu bạn muốn hỗ trợ cả hai cách gọi.
  - Ví dụ ngắn: trả về `res.partner` recordset
  ```python
  @api.model
  @api.returns('res.partner')
  def find_partner(self, name):
      return self.search([('name','=',name)], limit=1)
  ```

- `@api.readonly`:
  - Mô tả: đánh dấu method có thể được gọi khi cursor ở chế độ readonly (ví dụ trong một số RPC đặc thù). Dùng cho các phương thức chỉ đọc.
  - Ví dụ:
  ```python
  @api.readonly
  def compute_stats(self):
      # có thể chạy trong ngữ cảnh readonly
      return {'count': len(self)}
  ```

- `@api.private`:
  - Mô tả: ngăn method bị gọi bởi RPC từ client; chỉ dùng nội bộ server. Thường dùng cho hàm helper nội bộ.
  - Ví dụ:
  ```python
  @api.private
  def _internal_calculation(self):
      return sum(self.mapped('value'))
  ```

- `@api.autovacuum`:
  - Mô tả: đánh dấu method private (bắt đầu bằng `_`) để được gọi định kỳ bởi cron autovacuum (model `ir.autovacuum`). Dùng cho công việc dọn dẹp/gc nhẹ.
  - Lưu ý: method phải bắt đầu bằng dấu gạch dưới (`_`) theo yêu cầu của decorator.
  - Ví dụ:
  ```python
  @api.autovacuum
  def _autovacuum_cleanup(self):
      # chạy theo lịch do ir.autovacuum điều hành
      old = self.search([('state','=','draft'), ('create_date','<', fields.Date.today() - relativedelta(months=6))])
      old.unlink()
  ```

Gợi ý chung cho các decorator nhỏ này
- `@api.returns`: dùng khi bạn cần tương thích cả call truyền thống và record-style; ít cần thiết trong code thuần record-style.
- `@api.readonly`/`@api.private`: dùng để bảo vệ API (hiệu ứng bảo mật/hiệu năng).
- `@api.autovacuum`: chỉ cho các task dọn dẹp nhẹ; không dùng cho tác vụ nặng hoặc phụ thuộc vào user permissions.

Server-side vs DB-level constraints
- `_sql_constraints` (định nghĩa trong class model) chạy ở DB (ví dụ UNIQUE, CHECK). An toàn khi bypass ORM (import trực tiếp SQL).
- `@api.constrains` chạy trong ORM (Python), linh hoạt cho các business rules phức tạp.
- Best practice: ưu tiên `_sql_constraints` cho những ràng buộc đơn giản (hiệu năng, tính toàn vẹn), dùng `@api.constrains` cho logic phức tạp hoặc khi cần message lỗi thân thiện.

Best practices tóm tắt
- Luôn bảo vệ business rules ở server-side (override `create`/`write`/`@api.constrains`) — `@api.onchange` chỉ để UX.
- Tránh `write()` trong compute methods.
- Dùng `@api.model_create_multi` cho batch create.
- Khi muốn ràng buộc toàn cục (unique/check), dùng `_sql_constraints`.
- Thông báo lỗi rõ ràng (UserError/ValidationError) để client hiện popup.

Ví dụ cụ thể với `product.pet.offer` (tóm tắt)
- Override `create()` với `@api.model_create_multi` để chặn tạo offer khi pet đang `sold`/`cancel`.
- Dùng `@api.constrains('price')` để đảm bảo price > 0 và không thấp hơn 1/2 giá gốc (nếu có).
- Dùng `write()` override để khóa chỉnh sửa price khi pet không ở `available`.

Mã ví dụ (rút gọn):
```python
class ProductPetOffer(models.Model):
    _name = 'product.pet.offer'

    product_pet_id = fields.Many2one('product.pet', required=True)
    price = fields.Float(required=True)

    @api.model_create_multi
    def create(self, vals_list):
        pets = self.env['product.pet'].browse([v['product_pet_id'] for v in vals_list if v.get('product_pet_id')])
        blocked = pets.filtered(lambda p: p.state in ('sold','cancel'))
        if blocked:
            raise UserError('Cannot create offer for sold/cancelled pet')
        return super().create(vals_list)

    @api.constrains('price')
    def _check_price(self):
        for r in self:
            if r.price <= 0:
                raise ValidationError('Price must be > 0')

    def write(self, vals):
        # ví dụ: chỉ cho edit price khi pet.available
        if 'price' in vals:
            non_av = self.mapped('product_pet_id').filtered(lambda p: p.state != 'available')
            if non_av:
                raise UserError('You can only edit price when pet is available')
        return super().write(vals)
```

Tham khảo nhanh
- `odoo.api` trong core: cung cấp decorator `model`, `constrains`, `depends`, `onchange`, `model_create_multi`, ...
- `odoo.models`: cơ chế `_sql_constraints` và cách ORM tìm/đăng ký các phương thức check.

Muốn mình cập nhật thêm:
- Bảng so sánh ngắn giữa các decorator (table),
- Thêm ví dụ unit-test cho các rule,
- Chèn đoạn doc vào README module (ví dụ `tutorials/my_pet_plus/README.md`)?

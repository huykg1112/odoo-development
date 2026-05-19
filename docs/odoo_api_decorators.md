Tài liệu: Hướng dẫn chi tiết các decorator `@api` trong Odoo

Mục tiêu
- Giải thích nền tảng lý thuyết về `@api` trong Odoo ORM.
- Trình bày rõ: khi nào dùng, tại sao dùng, và dùng thế nào với ví dụ cụ thể.
- Nêu lỗi thường gặp và best practices để tránh bug.

Nội dung chính
1) Tổng quan về `@api` và cơ chế gọi ORM
2) Nhóm decorator phổ biến (model, create, compute, constrain, onchange)
3) Nhóm decorator bổ trợ (depends_context, ondelete, returns, readonly, private, autovacuum)
4) So sánh server-side vs DB-level constraints
5) Mẫu thiết kế và ví dụ tổng hợp
6) Checklist khi sử dụng

-------------------------------------------------------------------------------
1) Tổng quan về `@api` và cơ chế gọi ORM

Lý thuyết
- Odoo ORM cung cấp các decorator `@api` để xác định ý nghĩa và hành vi của method.
- Decorator không chỉ là cú pháp đẹp, mà còn thay đổi cách ORM:
  - truyền tham số
  - lặp qua recordset
  - theo dõi phụ thuộc tính toán
  - kích hoạt ràng buộc nghiệp vụ

Tại sao cần `@api`
- Giảm sai sót khi viết method sai ngữ cảnh (model-level vs record-level).
- Bảo toàn ORM behavior (prefetch, batch create, recompute).
- Cung cấp cơ chế tự động: compute, onchange, constrains, autovacuum.

Khi nào cần quan tâm
- Bất kỳ khi bạn viết logic Python trong model: create/write, compute, onchange.
- Khi bạn muốn định nghĩa business rule hoặc UI behavior.

-------------------------------------------------------------------------------
2) Nhóm decorator phổ biến

2.1) `@api.model`

Lý thuyết
- Method cấp model, không gắn với record cụ thể.
- `self` là recordset rỗng, chỉ có env và model.

Khi nào dùng
- Hàm tiện ích (helper), tìm kiếm chung, factory, service method.
- Khi không cần `self.id` hoặc dữ liệu record cụ thể.

Tại sao dùng
- Tránh nhầm lẫn giữa logic level model và record.
- Báo cho Odoo biết method không cần record.

Ví dụ cụ thể
```python
from odoo import api, models

class ProductPet(models.Model):
    _name = 'product.pet'

    @api.model
    def find_by_name(self, name):
        # Tìm record theo tên, dùng trong nhiều nơi
        return self.search([('name', '=', name)], limit=1)
```

Lưu ý
- Không nên dùng `ensure_one()` trong `@api.model`.
- Nếu cần logic theo record, đổi qua method record-level (không decorator hoặc `@api.depends`).

2.2) `@api.model_create_multi`

Lý thuyết
- Dùng khi override `create()` để nhận list `vals` (batch create).
- Từ Odoo 13+, create có thể được gọi theo batch, vì vậy Odoo khuyên dùng decorator này.

Khi nào dùng
- Bất kỳ khi override `create()`.
- Đặc biệt quan trọng cho import và tạo hàng loạt.

Tại sao dùng
- Hiệu năng: giảm số lần gọi DB.
- Tránh bug khi ORM gọi `create()` với list.

Ví dụ cụ thể
```python
from odoo import api, models
from odoo.exceptions import UserError

class ProductPetOffer(models.Model):
    _name = 'product.pet.offer'

    @api.model_create_multi
    def create(self, vals_list):
        pet_ids = [vals.get('product_pet_id') for vals in vals_list if vals.get('product_pet_id')]
        pets = self.env['product.pet'].browse(pet_ids)
        blocked = pets.filtered(lambda p: p.state in ('sold', 'cancel'))
        if blocked:
            raise UserError('Cannot create offer for sold/cancelled pet.')
        return super().create(vals_list)
```

Lưu ý
- Không dùng `@api.model` cho `create()` nếu bạn cần batch.
- Khi cần log chi tiết, có thể lặp qua `vals_list`.

2.3) `@api.depends(...)`

Lý thuyết
- Dùng cho compute field: khai báo các field phụ thuộc.
- Khi field phụ thuộc thay đổi, Odoo tự động recompute.

Khi nào dùng
- Bất kỳ field compute nào cần phụ thuộc vào field khác.

Tại sao dùng
- Odoo biết khi nào cần tính lại.
- Giảm recompute không cần thiết.

Ví dụ cụ thể
```python
from odoo import api, fields, models

class ProductPet(models.Model):
    _name = 'product.pet'

    basic_price = fields.Float()
    bonus_price = fields.Float()
    final_price = fields.Float(compute='_compute_final_price', store=True)

    @api.depends('basic_price', 'bonus_price')
    def _compute_final_price(self):
        for rec in self:
            rec.final_price = rec.basic_price - rec.bonus_price
```

Lưu ý
- Không `write()` field khác trong compute (có thể gây loop).
- Nếu cần store, đặt `store=True` và khai báo depends rõ ràng.

2.4) `@api.constrains(...)`

Lý thuyết
- Kiểm tra nghiệp vụ sau `create()`/`write()`.
- Nếu sai, raise `ValidationError` để rollback.

Khi nào dùng
- Rule nghiệp vụ phức tạp không thể biểu diễn bằng SQL constraint.

Tại sao dùng
- Bảo vệ dữ liệu ở server-side.
- Có thể trả về message thân thiện.

Ví dụ cụ thể
```python
from odoo import api, fields, models
from odoo.exceptions import ValidationError

class ProductPetOffer(models.Model):
    _name = 'product.pet.offer'

    price = fields.Float(required=True)

    @api.constrains('price')
    def _check_price(self):
        for rec in self:
            if rec.price <= 0:
                raise ValidationError('Price must be > 0.')
```

Lưu ý
- Constraint chỉ kích hoạt nếu field trong decorator có trong `vals`.
- Nếu cần bắt buộc check mọi lần, có thể override `create()`/`write()` để gọi check bổ sung.

2.5) `@api.onchange(...)`

Lý thuyết
- Chạy ở client (UI) khi user thay đổi field trong form.
- Tác động trên pseudo-record (chưa lưu DB).

Khi nào dùng
- Tự động điền field, hiện warning, đổi domain trên form.

Tại sao dùng
- UX tốt: user thấy kết quả ngay trước khi lưu.

Ví dụ cụ thể
```python
from odoo import api, fields, models

class ProductPet(models.Model):
    _name = 'product.pet'

    pet_type = fields.Selection([('normal', 'Normal'), ('vip', 'VIP')])
    basic_price = fields.Float()

    @api.onchange('pet_type')
    def _onchange_pet_type(self):
        if self.pet_type == 'vip':
            self.basic_price = 1000.0
            return {
                'warning': {
                    'title': 'Info',
                    'message': 'VIP price set.'
                }
            }
```

Lưu ý
- `@api.onchange` không phải rule server-side.
- Bất kỳ rule quan trọng đều phải có `@api.constrains` hoặc override `create/write`.

-------------------------------------------------------------------------------
3) Nhóm decorator bổ trợ

3.1) `@api.depends_context(...)`

Lý thuyết
- Giống `@api.depends` nhưng theo dõi `env.context` thay vì field.
- Khi context thay đổi (ví dụ `pricelist`, `company`), compute sẽ chạy lại.

Khi nào dùng
- Giá hiển thị phụ thuộc vào pricelist, company, lang.

Ví dụ cụ thể
```python
from odoo import api, fields, models

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

Lưu ý
- Khai báo rõ các key context cần thiết.
- Tránh dùng context thay đổi lung tung trong UI, để compute ổn định.

3.2) `@api.ondelete(at_uninstall=...)`

Lý thuyết
- Kiểm tra trước khi `unlink`.
- `at_uninstall=False` (mặc định): khi uninstall module, bỏ qua check.

Khi nào dùng
- Chọn lọc việc cho xóa record theo nghiệp vụ.

Ví dụ cụ thể
```python
from odoo import api, models
from odoo.exceptions import UserError

class SaleOrder(models.Model):
    _inherit = 'sale.order'

    @api.ondelete(at_uninstall=False)
    def _unlink_if_not_draft(self):
        if any(order.state != 'draft' for order in self):
            raise UserError('Cannot delete confirmed orders.')
```

3.3) `@api.returns(model, downgrade=None, upgrade=None)`

Lý thuyết
- Thông báo kiểu trả về khi cần hỗ trợ cả record-style và RPC-style.

Khi nào dùng
- Cần tương thích một method cũ có kiểu trả về là id hoặc dict.

Ví dụ cụ thể
```python
from odoo import api, models

class ResPartner(models.Model):
    _inherit = 'res.partner'

    @api.model
    @api.returns('res.partner')
    def find_partner(self, name):
        return self.search([('name', '=', name)], limit=1)
```

3.4) `@api.readonly`

Lý thuyết
- Cho phép method chạy khi cursor readonly.

Khi nào dùng
- Method chỉ đọc (report, thống kê).

Ví dụ cụ thể
```python
from odoo import api, models

class ProductPet(models.Model):
    _name = 'product.pet'

    @api.readonly
    def compute_stats(self):
        return {'count': len(self)}
```

3.5) `@api.private`

Lý thuyết
- Không cho RPC từ client gọi method.
- Chỉ dùng nội bộ server.

Khi nào dùng
- Helper method không muốn public.

Ví dụ cụ thể
```python
from odoo import api, models

class ProductPet(models.Model):
    _name = 'product.pet'

    @api.private
    def _internal_calculation(self):
        return sum(self.mapped('value'))
```

3.6) `@api.autovacuum`

Lý thuyết
- Đăng ký method chạy định kỳ từ `ir.autovacuum`.
- Method bắt buộc bắt đầu bằng `_`.

Khi nào dùng
- Công việc dọn dẹp nhẹ: xóa data tạm, vacuum record cũ.

Ví dụ cụ thể
```python
from datetime import date
from dateutil.relativedelta import relativedelta
from odoo import api, fields, models

class ProductPet(models.Model):
    _name = 'product.pet'

    @api.autovacuum
    def _autovacuum_cleanup(self):
        limit_date = fields.Date.to_string(date.today() - relativedelta(months=6))
        old = self.search([('state', '=', 'draft'), ('create_date', '<', limit_date)])
        old.unlink()
```

Lưu ý
- Không dùng cho task nặng, tránh thời gian chạy dài.
- Cần đảm bảo access rights (chạy với superuser).

-------------------------------------------------------------------------------
4) Server-side vs DB-level constraints

Lý thuyết
- `_sql_constraints`: chạy tại DB (UNIQUE, CHECK).
- `@api.constrains`: chạy trong ORM (Python).

Khi nào dùng `_sql_constraints`
- Ràng buộc đơn giản, có thể biểu diễn bằng SQL.
- Cần đảm bảo data an toàn khi bypass ORM.

Khi nào dùng `@api.constrains`
- Logic phức tạp, cần message thân thiện.
- Cần kiểm tra liên quan giữa nhiều field, nhiều record.

Ví dụ
```python
class ProductPet(models.Model):
    _name = 'product.pet'

    _sql_constraints = [
        ('unique_code', 'unique(code)', 'Code must be unique.')
    ]
```

-------------------------------------------------------------------------------
5) Mẫu thiết kế và ví dụ tổng hợp

Scenario: quản lý offer cho pet

Yêu cầu
- Không tạo offer nếu pet đã bán hoặc bị hủy.
- Giá offer phải > 0.
- Chỉ cho phép sửa giá khi pet đang available.

Giải pháp
- `@api.model_create_multi` cho `create()`.
- `@api.constrains` cho rule price.
- Override `write()` cho rule edit.

Ví dụ (rút gọn)
```python
from odoo import api, fields, models
from odoo.exceptions import UserError, ValidationError

class ProductPetOffer(models.Model):
    _name = 'product.pet.offer'

    product_pet_id = fields.Many2one('product.pet', required=True)
    price = fields.Float(required=True)

    @api.model_create_multi
    def create(self, vals_list):
        pet_ids = [v.get('product_pet_id') for v in vals_list if v.get('product_pet_id')]
        pets = self.env['product.pet'].browse(pet_ids)
        blocked = pets.filtered(lambda p: p.state in ('sold', 'cancel'))
        if blocked:
            raise UserError('Cannot create offer for sold/cancelled pet.')
        return super().create(vals_list)

    @api.constrains('price')
    def _check_price(self):
        for rec in self:
            if rec.price <= 0:
                raise ValidationError('Price must be > 0.')

    def write(self, vals):
        if 'price' in vals:
            non_av = self.mapped('product_pet_id').filtered(lambda p: p.state != 'available')
            if non_av:
                raise UserError('You can only edit price when pet is available.')
        return super().write(vals)
```

-------------------------------------------------------------------------------
6) Checklist khi sử dụng decorator

- Khi override `create()`: dùng `@api.model_create_multi`.
- Khi compute field: dùng `@api.depends` và không `write()` field khác.
- Khi cần rule nghiệp vụ: dùng `@api.constrains` (không chỉ `@api.onchange`).
- Khi muốn UX tốt: dùng `@api.onchange` để set field/warning.
- Khi logic phụ thuộc context: dùng `@api.depends_context`.
- Khi ngăn xóa record: dùng `@api.ondelete`.
- Khi method chỉ nội bộ: dùng `@api.private`.
- Khi method chỉ đọc: dùng `@api.readonly`.
- Khi dọn dẹp định kỳ: dùng `@api.autovacuum`.

-------------------------------------------------------------------------------
Muốn thêm
- Nếu bạn muốn, mình có thể bổ sung: bảng so sánh tổng hợp các decorator, unit tests, hoặc chèn vào README module.
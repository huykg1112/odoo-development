# -*- coding: utf-8 -*-
from odoo import api, fields, models, tools, _
from odoo.exceptions import UserError, ValidationError

#Delegation Inheritance: kế thừa từ model my.pet, tạo ra một model mới có tên là product.pet. Model product.pet sẽ kế thừa tất cả các trường và tính năng của model my.pet, đồng thời có thể thêm các trường mới hoặc thay đổi các trường đã có để mở rộng chức năng quản lý thú cưng trong module My Pet Plus của bạn. Điều này giúp bạn tận dụng lại mã đã viết trong model my.pet và dễ dàng bảo trì cũng như phát triển thêm các tính năng mới cho module của mình.
class ProductPet(models.Model):
    _name = 'product.pet'
    _description = 'Product Pet'
    # Delegation inheritance (kế thừa ủy quyền) phải dùng `_inherits`.
    # Khi khai báo như dưới, product.pet sẽ "mượn" toàn bộ field của my.pet
    # thông qua khóa ngoại `my_pet_id`.
    _inherits = {'my.pet': 'my_pet_id'}

    # CHAPTER 11 - List Order (model-level)
    # Sắp xếp mặc định cho mọi list view của product.pet.
    # (Tương đương estate.property: id desc)
    _order = 'id desc'

    my_pet_id = fields.Many2one('my.pet', string='My Pet') # Trường Many2one để liên kết với model my.pet, cho phép mỗi bản ghi product.pet liên kết với một bản ghi my.pet tương ứng.

    pet_type = fields.Selection([
        ('basic', 'Basic'),
        ('intermediate', 'Intermediate'),
        ('vip', 'VIP'),
        ('cute', 'Cute'),
    ], string='Pet Type', default='basic')

    # CHAPTER 11 - "Property Type" tương tự
    # Tạo liên kết Many2one tới model type (product.pet.type)
    # Lưu ý: mình giữ lại field selection `pet_type` ở trên vì bạn đang dùng nó
    # để demo @api.onchange. Field `pet_type_id` này dùng cho bài 11 (inline views,
    # manual ordering, stat button...).
    pet_type_id = fields.Many2one(
        comodel_name='product.pet.type',
        string='Pet Type (Model)',
        ondelete='set null',
    )

    state = fields.Selection(
        [
            ('available', 'Available'),
            ('reserved', 'Reserved'),
            ('sold', 'Sold'),
            ('cancel', 'Cancelled'),
        ],
        string='State',
        default='available',
        readonly=True,
        copy=False,
    )

    pet_color = fields.Char(string='Pet Color') # Trường mới để lưu màu sắc của thú cưng, mở rộng chức năng quản lý thú cưng trong module My Pet Plus.
    bonus_price = fields.Float(string='Bonus Price', default=0.0) # Trường mới để lưu giá bonus, giúp mở rộng chức năng quản lý thú cưng trong module My Pet Plus.

    # =============== OFFERS (Chapter 9 - Actions) ===============
    offer_ids = fields.One2many(
        comodel_name='product.pet.offer',
        inverse_name='product_pet_id',
        string='Offers',
    )
    buyer_id = fields.Many2one('res.partner', string='Buyer', readonly=True, copy=False)
    selling_price = fields.Float(string='Selling Price', readonly=True, copy=False)
    
    # =============== FIELD ĐỂ DEMO CUSTOM WIDGET (RATING WIDGET) ===============
    # Field này sử dụng custom widget để hiển thị đánh giá sao (0-5)
    pet_rating = fields.Integer(
        string='Pet Rating',
        default=0,
        help='Đánh giá thú cưng từ 0-5 sao, sử dụng custom rating widget'
    )
    
    # Override product_ids with different relation table to avoid conflict with inherited field
    product_ids = fields.Many2many(
        comodel_name='product.product',
        relation='product_pet_product_rel',
        column1='product_pet_id',
        column2='product_id',
    )
    
    # =============== THÊM CÁC FIELDS ĐỂ DEMO @api.onchange & @api.depends ===============
    
    # Fields cơ bản
    basic_price = fields.Float(string='Basic Price', default=0.0)
    quantity = fields.Integer(string='Quantity', default=1)
    discount_percent = fields.Float(string='Discount %', default=0.0)
    
    # =============== COMPUTED FIELDS (Dùng @api.depends) ===============
    # Những field này tự động tính toán khi field phụ thuộc thay đổi
    # READONLY - Không thể thay đổi trực tiếp
    
    final_price = fields.Float("Final Price", compute='_compute_final_price')

    total_amount = fields.Float(
        "Total Amount", 
        compute='_compute_total_amount',
        help="Tính tự động = Final Price × Quantity (dùng @api.depends)"
    )

    discounted_amount = fields.Float(
        "Discounted Amount",
        compute='_compute_discounted_amount',
        help="Tính tự động = Total Amount × (1 - Discount%) (dùng @api.depends)"
    )


    # =============== Actions (Thay đổi state) ===============
    def action_change_state(self):
        """Single public action to change `state`.

        More realistic rules:
        - available -> reserved OR cancel
        - reserved  -> sold OR available OR cancel
        - sold      -> (locked)
        - cancel    -> available (reset)

        For the branching transitions, the desired state is passed through context key `next_state`.
        """
        next_state = (self.env.context or {}).get('next_state')
        for record in self:
            if record.state == 'available':
                if next_state not in ('reserved', 'cancel'):
                    raise UserError(_("Invalid transition from available. Allowed: reserved, cancel."))
                vals = {'state': next_state}
                if next_state == 'cancel':
                    vals.update({'buyer_id': False, 'selling_price': 0.0})
                record.write(vals)

            elif record.state == 'reserved':
                if next_state not in ('sold', 'available', 'cancel'):
                    raise UserError(_("Invalid transition from reserved. Allowed: sold, available, cancel."))
                if next_state == 'sold' and (not record.buyer_id or not record.selling_price):
                    raise UserError(_("To mark as sold, you must have an accepted offer (Buyer and Selling Price)."))
                vals = {'state': next_state}
                if next_state in ('available', 'cancel'):
                    vals.update({'buyer_id': False, 'selling_price': 0.0})
                record.write(vals)

            elif record.state == 'sold':
                raise UserError(_("A sold pet is locked and cannot change state."))

            elif record.state == 'cancel':
                if next_state != 'available':
                    raise UserError(_("Invalid transition from cancel. Allowed: available."))
                record.write({'state': 'available', 'buyer_id': False, 'selling_price': 0.0})
            else:
                raise UserError(_("Unknown state: %s") % (record.state,))
        return True

    # =============== METHODS VỚI @api.depends (COMPUTED FIELDS) ===============
    # Những phương thức này chỉ TÍNH TOÁN, không thể thay đổi field khác
    # Tự động chạy khi field phụ thuộc thay đổi
    # Lưu ý: KHÔNG THỂ update field khác trong hàm compute
    
    @api.depends('basic_price', 'bonus_price') 
    def _compute_final_price(self):
        """
        ✅ @api.depends: Tính final_price tự động
        - Chạy tự động khi basic_price hoặc bonus_price thay đổi
        - Không cần user save
        - Tính toán đơn giản với các field số
        """
        for record in self:
            record.final_price = record.basic_price - record.bonus_price

    @api.depends('final_price', 'quantity')
    def _compute_total_amount(self):
        """
        ✅ @api.depends: Tính tổng tiền tự động
        - Phụ thuộc vào final_price (computed field khác) và quantity
        - Odoo sẽ tính theo thứ tự: final_price trước, rồi mới tính total_amount
        - Tự động cập nhật trên form không cần refresh
        """
        for record in self:
            record.total_amount = record.final_price * record.quantity

    @api.depends('total_amount', 'discount_percent')
    def _compute_discounted_amount(self):
        """
        ✅ @api.depends: Tính giá sau giảm tự động
        - Phụ thuộc vào total_amount và discount_percent
        - Luôn đồng bộ với dữ liệu mới nhất
        """
        for record in self:
            discount_factor = 1 - (record.discount_percent / 100.0)
            record.discounted_amount = record.total_amount * discount_factor

    # =============== METHODS VỚI @api.onchange (EVENT HANDLERS) ===============
    # Những phương thức này XỬ LÝ SỰ KIỆN khi user thay đổi field trên form
    # Có thể update NHIỀU field khác
    # Chỉ chạy khi user thay đổi, không chạy khi load dữ liệu từ DB
    
    @api.onchange('pet_type')
    def _onchange_pet_type(self):
        """
        ✅ @api.onchange('pet_type'): Xử lý sự kiện khi user chọn loại thú
        - Tự động cập nhật basic_price, discount_percent dựa trên pet_type
        - Có thể update NHIỀU field khác (basic_price, discount_percent)
        - Có thể hiển thị warning/notification cho user
        - Chỉ chạy khi user bấm chọn trong dropdown
        """
        if self.pet_type == 'vip':
            # Cập nhật nhiều field
            self.basic_price = 1000.0      # ✅ Có thể thay đổi field khác
            self.discount_percent = 15.0   # ✅ Có thể thay đổi field khác
            # Trả về warning để hiển thị cho user
            return {
                'warning': {
                    'title': '🌟 Premium Package',
                    'message': 'VIP pets - Price 1000, 15% discount applied!'
                }
            }
        elif self.pet_type == 'intermediate':
            self.basic_price = 500.0
            self.discount_percent = 8.0
        elif self.pet_type == 'cute':
            self.basic_price = 350.0
            self.discount_percent = 5.0
        else:  # basic
            self.basic_price = 100.0
            self.discount_percent = 0.0

    @api.onchange('quantity')
    def _onchange_quantity(self):
        """
        ✅ @api.onchange('quantity'): Xử lý sự kiện khi user thay đổi số lượng
        - Validate input (số lượng phải > 0)
        - Tự động tính discount nếu mua nhiều
        - Có thể show warning/alert cho user
        """
        if self.quantity <= 0:
            # Cảnh báo lỗi
            return {
                'warning': {
                    'title': '⚠️ Invalid Quantity',
                    'message': 'Quantity must be greater than 0!'
                }
            }
        
        # Tặng thêm discount khi mua nhiều
        if self.quantity > 10:
            self.discount_percent = 5.0
            return {
                'warning': {
                    'title': '🎁 Bulk Discount',
                    'message': f'Buy {self.quantity} items, 5% discount applied automatically!'
                }
            }

    @api.onchange('basic_price')
    def _onchange_basic_price(self):
        """
        ✅ @api.onchange('basic_price'): Xử lý sự kiện khi user thay đổi giá cơ bản
        - Cảnh báo nếu giá quá cao
        - Có thể validate input
        """
        if self.basic_price > 5000:
            return {
                'warning': {
                    'title': '⚠️ High Price Alert',
                    'message': f'Price {self.basic_price} is very high. Please double check!'
                }
            }
        
        if self.basic_price < 0:
            return {
                'warning': {
                    'title': '⚠️ Invalid Price',
                    'message': 'Price cannot be negative!'
                }
            }


# -*- coding: utf-8 -*-

from odoo import api, fields, models, _
from odoo.exceptions import UserError, ValidationError


class ProductPetOffer(models.Model):
    _name = 'product.pet.offer'
    _description = 'Product Pet Offer'
    _order = 'price desc, id desc'

    product_pet_id = fields.Many2one(
        comodel_name='product.pet',
        string='Pet',
        required=True,
        ondelete='cascade',
    )
    partner_id = fields.Many2one(
        comodel_name='res.partner',
        string='Buyer',
        required=True,
    )
    price = fields.Float(string='Offer Price', required=True, digits='Product Price',)
    status = fields.Selection(
        [
            ('pending', 'Pending'),
            ('accepted', 'Accepted'),
            ('refused', 'Refused'),
        ],
        string='Status',
        default='pending',
        readonly=True,
        copy=False,
    )
    date = fields.Datetime(string='Offer Date', default=fields.Datetime.now, readonly=True)


    def is_blocked_by_pet_state(self):
        # Helper method để check nếu pet đang sold/cancel
        return self.product_pet_id.state in ('sold', 'cancel')
    # ==========================================================
    # STEP 1 (Bài 9 - rule thực tế): CHẶN TẠO OFFER SAI NGAY TỪ ĐẦU
    # ==========================================================
    # Vì sao cần override create()?
    # - `@api.onchange` chỉ chạy trên form UI, import/RPC vẫn bypass được.
    # - `@api.constrains` cũng chặn được, nhưng create() giúp:
    #   + chặn sớm (trước khi insert vào DB)
    #   + dễ đọc luồng nghiệp vụ “không cho tạo offer khi pet sold/cancel”.
    #
    # Dùng @api.model_create_multi vì Odoo có thể tạo nhiều record 1 lần
    # (ví dụ import). Khi đó `vals_list` là list[dict].
    @api.model_create_multi
    def create(self, vals_list):
        # 1) Lấy tất cả product_pet_id từ vals_list (bỏ qua dict nào không có key)
        pet_ids = [vals.get('product_pet_id') for vals in vals_list if vals.get('product_pet_id')]

        # 2) Browse một lần để tránh query lặp. browse([]) là recordset rỗng, an toàn.
        pets = self.env['product.pet'].browse(pet_ids)

        # 3) Filter ra các pet bị chặn theo nghiệp vụ
        blocked_pets = pets.filtered(lambda p: p.state in ('sold', 'cancel'))
        if blocked_pets:
            # 4) Raise UserError để UI hiện popup lỗi, và transaction sẽ rollback.
            #    (Không tạo record nào hết.)
            raise UserError(_("Cannot create offers for pets that are sold or cancelled."))

        # 5) Nếu hợp lệ -> gọi super() để Odoo tạo record thật sự.
        return super().create(vals_list)

    @api.constrains('price') 
    def _check_price_positive(self):
        for record in self:
            if record.price <= 0:
                raise ValidationError(_("Offer price must be greater than 0."))

    def action_accept(self):
        for offer in self:
            if offer.status == 'accepted':
                continue
            if offer.status != 'pending':
                raise UserError(_("Only pending offers can be accepted."))

            pet = offer.product_pet_id
            if pet.state in ('sold', 'cancel'):
                raise UserError(_("You cannot accept an offer for a pet that is sold or cancelled."))

            other_accepted = self.search([
                ('product_pet_id', '=', pet.id),
                ('status', '=', 'accepted'),
                ('id', '!=', offer.id),
            ], limit=1)
            if other_accepted:
                raise UserError(_("Only one offer can be accepted per pet."))

            # Refuse other pending offers for the same pet
            other_pending = self.search([
                ('product_pet_id', '=', pet.id),
                ('status', '=', 'pending'),
                ('id', '!=', offer.id),
            ])
            if other_pending:
                other_pending.write({'status': 'refused'})

            offer.write({'status': 'accepted'})

            # Apply business side-effects on the pet
            values = {
                'buyer_id': offer.partner_id.id,
                'selling_price': offer.price,
            }
            # RULE (per your requirement): accepting an offer sells the pet immediately
            values['state'] = 'sold'
            pet.write(values)

        return True

    def action_refuse(self):
        for offer in self:
            if offer.status == 'pending':
                offer.status = 'refused'
        return True

    def write(self, vals):
        # ==========================================================
        # STEP 2 (Bài 9 - rule thực tế): KHÓA SỬA OFFER SAU KHI XỬ LÝ
        # ==========================================================
        # Mục tiêu:
        # - Khi offer đã `accepted` hoặc `refused` (tức status != pending)
        #   thì không cho sửa các field quan trọng nữa.
        #
        # Vì sao làm ở write()?
        # - write() chạy cho mọi nguồn cập nhật: UI, import, RPC, code.
        # - View readonly chỉ chặn UI, không chặn import/RPC.

        # 0) RULE mới: Chỉ khi pet đang `available` thì mới cho sửa giá offer.
        #    (Offer vẫn có thể được tạo khi pet `available` hoặc `reserved`.)
        if 'price' in vals:
            # Nếu có bất kỳ offer nào thuộc pet không phải available -> chặn
            # Lưu ý: product_pet_id là required, nên record nào cũng có pet.
            non_available_pets = self.mapped('product_pet_id').filtered(lambda p: p.state != 'available')
            if non_available_pets:
                raise UserError(_("You can only edit offer price when the pet is in Available state."))

        # 1) Danh sách field cần khóa sau khi offer không còn pending
        locked_fields = {'price', 'partner_id', 'product_pet_id'}

        # 2) Nếu user đang muốn sửa bất kỳ field nào trong locked_fields...
        is_editing_locked_field = bool(locked_fields.intersection(vals.keys()))
        if is_editing_locked_field:
            # 3) ...và trong recordset self có record nào không còn pending...
            non_pending_offers = self.filtered(lambda o: o.status != 'pending')
            if non_pending_offers:
                # 4) ...thì chặn và rollback.
                raise UserError(_("You cannot edit price/buyer/pet on an offer that is already accepted/refused."))

        # 5) Nếu hợp lệ -> gọi super() để thực hiện cập nhật DB.
        return super().write(vals)


    # Giá offer phải > 0, và ko được thấp hơn 1/2 giá gốc của pet (nếu pet có giá gốc).
    @api.constrains('price')
    def _check_min_price(self):
        for record in self:
            if record.price <= 0:
                raise ValidationError(_("Offer price must be greater than 0."))
            # product.pet không có field `price` mặc định.
            # Trong module của bạn, giá gốc demo nằm ở `basic_price`.
            pet_price = record.product_pet_id.basic_price
            if pet_price and record.price < pet_price / 2:
                raise ValidationError(_("Offer price cannot be less than half of the pet's original price."))

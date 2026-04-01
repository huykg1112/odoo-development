# -*- coding: utf-8 -*-

from odoo import api, fields, models, _


class ProductPetType(models.Model):
	# ==========================================================
	# CHAPTER 11 (Add the Sprinkles) - "Property Type" tương tự
	# ==========================================================
	# Trong tutorial gốc: estate.property.type
	# Trong module mình: product.pet.type
	#
	# Mục tiêu:
	# - Tạo một "loại thú cưng" (Type) để:
	#   + có danh sách pets (One2many) hiển thị inline trên form type
	#   + có sắp xếp thủ công bằng sequence + handle
	#   + có stat button đếm offers liên quan

	_name = 'product.pet.type'
	_description = 'Product Pet Type'

	# Manual ordering:
	# - Sequence phải đứng đầu `_order` để widget handle hoạt động đúng.
	# - Sau đó sắp theo name để ổn định thứ tự.
	_order = 'sequence, name'

	name = fields.Char(string='Type Name', required=True)

	# Dùng cho "manual sorting" (kéo-thả) ở list/tree view
	sequence = fields.Integer(string='Sequence', default=10)

	# Inline view: list các pet thuộc loại này
	pet_ids = fields.One2many(
		comodel_name='product.pet',
		inverse_name='pet_type_id',
		string='Pets',
	)

	# "Stat button" demo: đếm tổng số offers của tất cả pets thuộc type
	offer_count = fields.Integer(string='Offer Count', compute='_compute_offer_count')

	@api.depends('pet_ids.offer_ids')
	def _compute_offer_count(self):
		# NOTE: Đây là compute field. Chỉ tính, không write sang field khác.
		for rec in self:
			rec.offer_count = sum(len(pet.offer_ids) for pet in rec.pet_ids)

	def action_open_offers(self):
		# Helper để dùng cho stat button.
		# Trả về action mở danh sách offers, được filter theo active type.
		self.ensure_one()
		return {
			'type': 'ir.actions.act_window',
			'name': _('Pet Offers'),
			'res_model': 'product.pet.offer',
			'view_mode': 'list,form',
			# Domain: offer thuộc pet nào có pet_type_id = type hiện tại
			'domain': [('product_pet_id.pet_type_id', '=', self.id)],
			'context': dict(self.env.context),
		}


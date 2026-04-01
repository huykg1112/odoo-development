# *-*- coding: utf-8 -*-

from odoo import models, fields, api, tools, _
from odoo.exceptions import ValidationError


class MyPet(models.Model):
    _name = 'my.pet'
    _description = 'My Pet'

    name = fields.Char(string='Pet Name', required=True)
    nickname = fields.Char(string='Nickname')
    description = fields.Text(string='Description')
    age = fields.Integer(string='Pet Age')
    weight = fields.Float(string='Pet Weight (kg)')
    dob = fields.Date(string='Date of Birth', required=False)
    gender = fields.Selection([
        ('male', 'Male'),
        ('female', 'Female'),
    ], string='Gender', default='male')
    pet_image = fields.Binary(string='Pet Image', attachment=True, help='Upload an image of your pet.') # attachment=True là để lưu ảnh dưới dạng attachment trong Odoo, giúp quản lý và tối ưu hóa lưu trữ ảnh.
    owner_id = fields.Many2one('res.partner', string='Owner')
    product_ids = fields.Many2many(
        comodel_name='product.product', # Liên kết với model product.product của Odoo
        relation='pet_product_rel', # Tên bảng trung gian cho mối quan hệ Many2many
        column1='col_pet_id', # Tên cột liên kết với model my.pet
        column2='col_product_id', # Tên cột liên kết với model product.product
    )
    basic_price = fields.Float('Basic Price', default=0)


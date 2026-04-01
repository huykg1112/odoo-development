# *-*- coding: utf-8 -*-

from odoo import models, fields, api, tools, _
from odoo.exceptions import ValidationError

#Prototype Inheritance: kế thừa từ model my.pet, tạo ra một model mới có tên là super.pet. Model super.pet sẽ kế thừa tất cả các trường và tính năng của model my.pet, đồng thời có thể thêm các trường mới hoặc thay đổi các trường đã có để mở rộng chức năng quản lý thú cưng trong module My Pet Plus của bạn. Điều này giúp bạn tận dụng lại mã đã viết trong model my.pet và dễ dàng bảo trì cũng như phát triển thêm các tính năng mới cho module của mình.
class SuperPet(models.Model):
    _name = 'super.pet'
    _inherit = 'my.pet'  # Kế thừa từ model my.pet
    _description = 'Super Pet'

    # add new field
    is_super_strength = fields.Boolean("Is Super Strength", default=False) # xác định pet có tài năng khác lạ không
    is_fly = fields.Boolean("Is Fly", default=False) # xác định pet có khả năng bay không
    planet = fields.Char("Planet") # lưu thông tin về hành tinh mà pet đến từ đó, giúp bạn quản lý và phân loại các loại pet khác nhau dựa trên nguồn gốc của chúng.

    #modify field cũ
    product_ids = fields.Many2many(
        comodel_name='product.product', # Liên kết với model product.product của Odoo
        relation='super_pet_product_rel', # Tên bảng trung gian cho mối quan hệ Many2many, tránh xung đột với bảng trung gian của model my.pet
        column1='col_pet_id', # Tên cột liên kết với model super
        column2='col_product_id', # Tên cột liên kết với model product.product
    )
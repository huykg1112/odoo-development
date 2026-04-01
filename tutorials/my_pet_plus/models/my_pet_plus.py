# *-*- coding: utf-8 -*-

from odoo import models, fields, api, tools, _
from odoo.exceptions import ValidationError

# Class Inheritance: dùng chung model my.pet, kế thừa tất cả các trường và tính năng của model my.pet, đồng thời có thể thêm các trường mới hoặc thay đổi các trường đã có để mở rộng chức năng quản lý thú cưng trong module My Pet Plus của bạn. Điều này giúp bạn tận dụng lại mã đã viết trong model my.pet và dễ dàng bảo trì cũng như phát triển thêm các tính năng mới cho module của mình.
class MyPetPlus(models.Model):
    _name = 'my.pet'
    _inherit = 'my.pet'  # Kế thừa từ model my.pet
    _description = 'My Pet Plus'

# Thêm trường toy vào model my.petplus, toy là một trường Char để lưu thông tin về đồ chơi của thú cưng. Trường này sẽ được kế thừa cùng với các trường khác từ model my.pet, giúp bạn mở rộng tính năng quản lý thú cưng một cách dễ dàng.
    toy = fields.Char(string='Pet Toy')  

#modify field cũ
    age = fields.Integer(string='Pet Age', default=2)  # Thay đổi giá trị mặc định của trường age thành 1
    gender = fields.Selection(selection_add=[('sterilization', 'Sterilization')]) # Thêm lựa chọn 'sterilization' vào trường
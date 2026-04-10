# -*- coding: utf-8 -*-
from odoo import fields, models


class ActWindowView(models.Model):
    _inherit = 'ir.actions.act_window.view' # kế thừa từ model ir.actions.act_window.view, để thêm một lựa chọn mới vào trường view_mode

    view_mode = fields.Selection(selection_add=[  # thêm lựa chọn mới vào trường view_mode
        ('gallery', "Awesome Gallery") # thêm lựa chọn 'gallery' vào trường view_mode, với nhãn hiển thị là "Awesome Gallery"
    ],  ondelete={'gallery': 'cascade'}) # thiết lập hành động khi xóa lựa chọn 'gallery', ở đây là 'cascade' có nghĩa là khi xóa lựa chọn 'gallery' thì sẽ xóa tất cả các bản ghi liên quan đến nó trong bảng ir.actions.act_window.view

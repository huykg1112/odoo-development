# *-*- coding: utf-8 -*-
from odoo import api, fields, models, tools, _
from odoo.exceptions import UserError, ValidationError
import logging

_logger = logging.getLogger(__name__)

class BatchUpdate(models.TransientModel):
    _name = 'my.pet.batch.update.wizard'
    _description = 'Batch Update My Pet'

    dob = fields.Date( 'DOB', required=True, default=False) # có nghĩa là trường này là bắt buộc phải có giá trị khi tạo hoặc cập nhật bản ghi, và giá trị mặc định của trường này là False, tức là không có ngày sinh nào được đặt sẵn khi tạo mới bản ghi. Người dùng sẽ cần phải nhập một ngày sinh hợp lệ để hoàn thành quá trình tạo hoặc cập nhật bản ghi trong mô hình my.pet.batch.update.
    gender = fields.Selection([
        ('male', 'Male'),
        ('female', 'Female')
    ], string='Gender', default=False)
    owner_id = fields.Many2one('res.partner', string='Owner', default=False)
    basic_price = fields.Float('Basic Price', default=0)
    age = fields.Integer(string='Pet Age', default=2)  # Thay đổi giá trị mặc định của trường age thành 1

    def action_batch_update(self):
        active_ids = self.env.context.get('active_ids', [])
        pets = self.env['my.pet'].browse(active_ids)
        new_data = {}
        if self.dob:
            new_data['dob'] = self.dob
        if self.gender:
            new_data['gender'] = self.gender
        if self.owner_id:
            new_data['owner_id'] = self.owner_id.id
        if self.basic_price:
            new_data['basic_price'] = self.basic_price
        
        if new_data:
            pets.write(new_data)

        return {'type': 'ir.actions.act_window_close'}

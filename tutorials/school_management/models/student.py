# *-*- coding: utf-8 -*-

from odoo import models, fields, api, tools, _
from odoo.exceptions import ValidationError


class Student(models.Model):
    _name = 'student.student'
    _description = 'Student'
    _rec_name = 'name'
    _order = 'name'

    name = fields.Char(string='Name', required=True)
    # code = fields.Char(string='Code', required=True) 
    # code tư sinh, không bắt buộc nhập, sẽ tự động tạo dựa trên tên khi lưu bản ghi
    code = fields.Char(string='Code', readonly=True, copy=False, help='Unique code for the student, generated automatically.')
    phone = fields.Char(string='Phone')
    dob = fields.Date(string='Date of Birth')
    #age tự động tính dựa trên dob, không cần lưu trong database
    age = fields.Integer(string='Age', compute='_compute_age', store=True)
    gender = fields.Selection([
        ('male', 'Male'),   
        ('female', 'Female'),
    ], string='Gender', default='male')
    student_image = fields.Binary(string='Student Image', attachment=True, help='Upload an image of your student.')
    classroom_id = fields.Many2one('student.classroom', string='Classroom')
    active = fields.Boolean(string='Active', default=True)


    _generated_code_sequence = 0

    @api.model
    def _generate_code(self, name):
        # Tạo code dựa trên tên và một số ngẫu nhiên để đảm bảo tính duy nhất
        self.__class__._generated_code_sequence += 1
        return f"{name[:3].upper()}-{self.__class__._generated_code_sequence:04d}"


    @api.model
    def create(self, vals):
        # Tự động tạo code dựa trên tên nếu chưa có
        if not vals.get('code') and vals.get('name'):
            vals['code'] = self._generate_code(vals['name'])

        return super(Student, self).create(vals)


    @api.depends('dob')
    def _compute_age(self):
        for record in self:
            if record.dob:
                today = fields.Date.today()
                age = today.year - record.dob.year - ((today.month, today.day) < (record.dob.month, record.dob.day))
                record.age = age
            else:
                record.age = 0

    @api.onchange("classroom_id")
    def _onchange_classroom_id(self):
        if self.classroom_id and len(self.classroom_id.student_ids) >= self.classroom_id.capacity:
            return {
                'warning': {
                    'title': _('Classroom Capacity Exceeded'),
                    'message': _('The selected classroom has reached its capacity. Please choose another classroom.'),
                }
            }
            

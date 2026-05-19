# *-*- coding: utf-8 -*-

from odoo import models, fields, api, tools, _
from odoo.exceptions import ValidationError

class Classroom(models.Model):
    _name = 'student.classroom'
    _description = 'Student Classroom'
    _rec_name = 'name'
    _order = 'name'

    name = fields.Char(string='Name', required=True)
    # code = fields.Char(string='Code', required=True)
    code = fields.Char(string='Code', readonly=True, copy=False, help='Unique code for the classroom, generated automatically.')
    description = fields.Text(string='Description')
    student_ids = fields.One2many('student.student', 'classroom_id', string='Students')
    grade_level = fields.Selection([
        ('grade_1', 'Lớp 1'),
        ('grade_2', 'Lớp 2'),
        ('grade_3', 'Lớp 3'),
        ('grade_4', 'Lớp 4'),
        ('grade_5', 'Lớp 5'),
        ('grade_6', 'Lớp 6'),
        ('grade_7', 'Lớp 7'),
        ('grade_8', 'Lớp 8'),
        ('grade_9', 'Lớp 9'),
        ('grade_10', 'Lớp 10'),
        ('grade_11', 'Lớp 11'),
        ('grade_12', 'Lớp 12'),
    ], string='Grade Level')
    teacher_id = fields.Many2one('hr.employee', string='Teacher')
    active = fields.Boolean(string='Active', default=True)
    capacity = fields.Integer(string='Capacity')
    # Sỉ số hiên tại
    current_size = fields.Integer(string='Current Size', compute='_compute_current_size', store=True)

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

        return super(Classroom, self).create(vals)
    
    @api.constrains('capacity')
    def _check_capacity(self):
        for record in self:
            if record.capacity < 0:
                raise ValidationError(_('Capacity must be a non-negative integer.'))
            if record.capacity < len(record.student_ids):
                raise ValidationError(_('Capacity cannot be less than the number of students assigned to this classroom.'))

    @api.depends('student_ids')
    def _compute_current_size(self):
        for record in self:
            record.current_size = len(record.student_ids)
            
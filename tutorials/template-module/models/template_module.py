from odoo import models, fields, api, tools, _
from odoo.exceptions import ValidationError

class TemplateModel(models.Model):
    _name = 'template.model'
    _description = 'Template Model'

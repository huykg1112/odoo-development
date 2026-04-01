from odoo import models, fields

class CollegeStudent(models.Model):
    _name = 'college.student'
    _description = 'College Student'

    admission_number = fields.Char(string='Admission Number', required=True, unique=True) 
    admission_date = fields.Date(string='Admission Date', required=True)
    first_name = fields.Char(string='Name', required=True)
    last_name = fields.Char(string='Surname', required=True)
    father_name = fields.Char(string='Father Name', required=True)
    mother_name = fields.Char(string='Mother Name', required=True)
    date_of_birth = fields.Date(string='Date of Birth')
    communication_address = fields.Text(string='Communication Address')
    street = fields.Char(string='Street')
    street2 = fields.Char(string='Street2')
    city = fields.Char(string='City')
    state_id = fields.Many2one('res.country.state', string='State', domain="[('country_id', '=?', country_id)]")
    country_id = fields.Many2one('res.country')
    country_code= fields.Char(related='country_id.code', string='Country Code')
    zip = fields.Char(string='Zip')
    email = fields.Char(string='Email')
    phone = fields.Char(string='Phone')
    same_as_communication_address = fields.Boolean(string='Same as Communication Address',default=False)
    image_19209 = fields.Image(string="Student Image")

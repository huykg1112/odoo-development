# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError

class TaskStatus(models.Model):
    _name = 'task.status'
    _description = 'Task Status'
    _order = 'sequence, id'

    name = fields.Char(string='Status Name', required=True, translate=True)
    sequence = fields.Integer(default=10)
    color = fields.Integer(string='Color Index')
    fold = fields.Boolean(string='Folded in Kanban', help='Whether the column is collapsed by default')
    
    can_transition_to_ids = fields.Many2many(
        'task.status', 'task_status_transition_rel', 
        'status_id', 'transition_id', 
        string='Valid Transitions',
        help='Define which statuses this status can move to.'
    )

class TaskCategory(models.Model):
    _name = 'task.category'
    _description = 'Task Category'

    name = fields.Char(string='Category Name', required=True, translate=True)
    color = fields.Integer(string='Color Index')


class TaskUser(models.Model):
    _name = 'task.user'
    _description = 'Task User'
    _order = 'name, id'

    name = fields.Char(string='Name', required=True, translate=True)
    email = fields.Char(string='Email')
    active = fields.Boolean(default=True)
    color = fields.Integer(string='Color Index')

class Task(models.Model):
    _name = 'task.task'
    _description = 'Task Record'
    _order = 'sequence, id'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Task Title', required=True, tracking=True)
    description = fields.Html(string='Description')
    priority = fields.Selection([
        ('0', 'Low'),
        ('1', 'Medium'),
        ('2', 'High'),
        ('3', 'Urgent'),
    ], string='Priority', default='1', tracking=True)
    
    status_id = fields.Many2one('task.status', string='Status', required=True, tracking=True, group_expand='_read_group_status_ids')
    category_id = fields.Many2one('task.category', string='Category', tracking=True)
    assignee_id = fields.Many2one('task.user', string='Assignee', tracking=True)
    user_id = fields.Many2one('res.users', string='Assigned To (System User)', default=lambda self: self.env.user, tracking=True)
    date_deadline = fields.Date(string='Deadline', tracking=True)
    sequence = fields.Integer(default=10)
    active = fields.Boolean(default=True)
    color = fields.Integer(string='Color Index')

    def write(self, vals):
        if 'status_id' in vals:
            target_status = self.env['task.status'].browse(vals['status_id'])
            for task in self:
                if task.status_id and task.status_id != target_status:
                    allowed_transitions = task.status_id.can_transition_to_ids
                    # Only enforce if transitions are defined for the current status
                    if allowed_transitions and target_status not in allowed_transitions:
                        raise ValidationError(f"Invalid transition from '{task.status_id.name}' to '{target_status.name}'.")
        return super().write(vals)

    @api.model
    def _read_group_status_ids(self, statuses, domain, order=None, **kwargs):
        """Always show all status columns in Kanban even if empty.

        Odoo may call group_expand methods with (statuses, domain) or
        (statuses, domain, order), depending on version/context.
        """
        return self.env['task.status'].search([], order=order or 'sequence, id')

    @api.onchange('status_id')
    def _onchange_status_id(self):
        if self._origin.status_id and self.status_id:
            valid_destinations = self._origin.status_id.can_transition_to_ids
            if valid_destinations and self.status_id not in valid_destinations:
                return {
                    'warning': {
                        'title': "Invalid Transition",
                        'message': f"Cannot move task from {self._origin.status_id.name} to {self.status_id.name} based on current rules."
                    }
                }

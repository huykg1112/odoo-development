/** @odoo-module **/

import { Component } from "@odoo/owl";

export class TaskCard extends Component {
    static template = "awesome_owl.TaskCard";
    static props = {
        task: { type: Object },
        onEdit: { type: Function },
        onDelete: { type: Function },
        onStatusChange: { type: Function },
        statusConfig: { type: Object },
        statusList: { type: Array, optional: true },
    };

    get priorityClass() {
        return `badge-priority-${this.props.task.priority}`;
    }

    get priorityLabel() {
        const labels = { low: "Low", medium: "Medium", high: "High", urgent: "Urgent" };
        return labels[this.props.task.priority] || "Medium";
    }

    get categoryLabel() {
        const labels = {
            development: "Dev",
            design: "Design",
            testing: "QA",
            documentation: "Docs",
            other: "Other",
        };
        return labels[this.props.task.category] || "Other";
    }

    get assigneeInitials() {
        if (!this.props.task.assignee) return "?";
        return this.props.task.assignee
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    }

    get formattedDueDate() {
        if (!this.props.task.dueDate) return null;
        const d = new Date(this.props.task.dueDate);
        const now = new Date();
        const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
        if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, overdue: true };
        if (diff === 0) return { text: "Today", overdue: false };
        if (diff === 1) return { text: "Tomorrow", overdue: false };
        return { text: `${diff}d left`, overdue: false };
    }

    get prevStatus() {
        const list = this.props.statusList || [];
        const idx = list.findIndex((s) => s.id === this.props.task.status);
        return idx > 0 ? list[idx - 1].id : null;
    }

    get nextStatus() {
        const list = this.props.statusList || [];
        const idx = list.findIndex((s) => s.id === this.props.task.status);
        return idx >= 0 && idx < list.length - 1 ? list[idx + 1].id : null;
    }

    getStatusLabel(status) {
        return this.props.statusConfig[status]?.label || status;
    }

    onClickEdit(ev) {
        ev.stopPropagation();
        this.props.onEdit(this.props.task);
    }

    onClickDelete(ev) {
        ev.stopPropagation();
        this.props.onDelete(this.props.task.id);
    }

    onMovePrev(ev) {
        ev.stopPropagation();
        if (this.prevStatus) {
            this.props.onStatusChange(this.props.task.id, this.prevStatus);
        }
    }

    onMoveNext(ev) {
        ev.stopPropagation();
        if (this.nextStatus) {
            this.props.onStatusChange(this.props.task.id, this.nextStatus);
        }
    }
}

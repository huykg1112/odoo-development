/** @odoo-module **/

import { Component, useState } from "@odoo/owl";

export class TaskForm extends Component {
    static template = "awesome_owl.TaskForm";
    static props = {
        task: { type: [Object, { value: null }], optional: true },
        statuses: { type: Array, optional: true },
        categories: { type: Array, optional: true },
        assignees: { type: Array, optional: true },
        onSave: { type: Function },
        onClose: { type: Function },
    };

    setup() {
        const t = this.props.task;
        this.state = useState({
            title: t ? t.title : "",
            description: t ? t.description : "",
            status: t ? t.status : (this.props.statuses?.[0]?.id || ""),
            priority: t ? t.priority : "medium",
            category: t ? t.category : (this.props.categories?.[0]?.id || ""),
            assigneeId: t ? (t.assigneeId || "") : (this.props.assignees?.[0]?.id || ""),
            dueDate: t ? (t.dueDate ? this.toInputDate(t.dueDate) : "") : "",

        });
    }

    toInputDate(d) {
        if (!d) return "";
        const date = new Date(d);
        return date.toISOString().split("T")[0];
    }

    get isEditing() {
        return !!this.props.task;
    }

    get formTitle() {
        return this.isEditing ? "Edit Task" : "Create New Task";
    }

    onInput(field, ev) {
        this.state[field] = ev.target.value;
    }

    async onSubmit() {
        if (!this.state.title.trim()) return;
        await this.props.onSave({
            title: this.state.title.trim(),
            description: this.state.description.trim(),
            status: this.state.status,
            priority: this.state.priority,
            category: this.state.category,
            assigneeId: this.state.assigneeId,
            dueDate: this.state.dueDate ? new Date(this.state.dueDate) : null,
        });
    }

    onCancel() {
        this.props.onClose();
    }

    onOverlayClick(ev) {
        if (ev.target === ev.currentTarget) {
            this.props.onClose();
        }
    }
}

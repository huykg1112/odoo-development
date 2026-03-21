/** @odoo-module **/

import { Component } from "@odoo/owl";

export class TaskLog extends Component {
    static template = "awesome_owl.TaskLog";
    static props = {
        logs: { type: Array },
        onClose: { type: Function },
    };

    getIcon(action) {
        const icons = {
            created: "fa-plus",
            updated: "fa-pencil",
            status_changed: "fa-exchange",
            deleted: "fa-trash",
        };
        return icons[action] || "fa-info";
    }

    formatTime(timestamp) {
        const d = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - d) / 1000);
        if (diff < 60) return "Just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    }
}

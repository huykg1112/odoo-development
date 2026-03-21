/** @odoo-module **/

import { Component } from "@odoo/owl";

export class Sidebar extends Component {
    static template = "awesome_owl.Sidebar";
    static props = {
        filters: { type: Object },
        stats: { type: Object },
        statusConfig: { type: Object },
        onFilterChange: { type: Function },
        onSearchInput: { type: Function },
    };

    get statusList() {
        return Object.entries(this.props.statusConfig).map(([key, cfg]) => ({
            key,
            label: cfg.label,
            color: cfg.color,
            count: this.props.stats.byStatus[key] || 0,
        }));
    }

    get priorityList() {
        return [
            { key: "low", label: "Low", color: "var(--priority-low)" },
            { key: "medium", label: "Medium", color: "var(--priority-medium)" },
            { key: "high", label: "High", color: "var(--priority-high)" },
            { key: "urgent", label: "Urgent", color: "var(--priority-urgent)" },
        ].map((p) => ({
            ...p,
            count: this.props.stats.byPriority[p.key] || 0,
        }));
    }

    get categoryList() {
        return [
            { key: "development", label: "Development" },
            { key: "design", label: "Design" },
            { key: "testing", label: "Testing" },
            { key: "documentation", label: "Documentation" },
            { key: "other", label: "Other" },
        ].map((c) => ({
            ...c,
            count: this.props.stats.byCategory[c.key] || 0,
        }));
    }

    onSearch(ev) {
        this.props.onSearchInput(ev.target.value);
    }

    toggleStatusFilter(status) {
        const current = this.props.filters.status;
        this.props.onFilterChange("status", current === status ? null : status);
    }

    togglePriorityFilter(priority) {
        const current = this.props.filters.priority;
        this.props.onFilterChange("priority", current === priority ? null : priority);
    }

    toggleCategoryFilter(category) {
        const current = this.props.filters.category;
        this.props.onFilterChange("category", current === category ? null : category);
    }
}

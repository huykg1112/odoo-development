/** @odoo-module **/

import { Component } from "@odoo/owl";

export class Sidebar extends Component {
    static template = "awesome_owl.Sidebar";
    static props = {
        filters: { type: Object },
        stats: { type: Object },
        statusConfig: { type: Object },
        categories: { type: Array, optional: true },
        onFilterChange: { type: Function },
        onSearchInput: { type: Function },
    };

    get statusList() {
        return Object.entries(this.props.statusConfig).map(([key, cfg]) => ({
            key: Number(key) || key, // Handle ID keys
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
        if (this.props.categories) {
            return this.props.categories.map((c) => ({
                key: c.id,
                label: c.name,
                count: this.props.stats.byCategory[c.id] || 0,
            }));
        }
        return [];
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

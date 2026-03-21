/** @odoo-module **/

import { Component, useState, onWillStart } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class StatusSettings extends Component {
    static template = "awesome_owl.StatusSettings";
    static props = {
        statuses: { type: Array, optional: true },
        onClose: { type: Function },
        onUpdate: { type: Function }, // Refresh parent data
        onNotify: { type: Function, optional: true },
    };

    setup() {
        this.orm = useService("orm");
        this.state = useState({
            statuses: [],
            editingId: null,
            editData: { name: "", color: 0, transitionIds: [] },
            isCreating: false,
            loading: {
                initial: true,
                saving: false,
                deletingId: null,
            },
        });

        onWillStart(async () => {
            // Re-fetch strict data for settings to ensure fresh state
            await this.loadStatuses();
            this.state.loading.initial = false;
        });
    }

    async loadStatuses() {
        const statuses = await this.orm.searchRead(
            "task.status", 
            [], 
            ["id", "name", "color", "sequence", "fold", "can_transition_to_ids"], 
            { order: "sequence, id" }
        );
        this.state.statuses = statuses;
    }

    get isEditing() {
        return this.state.editingId !== null || this.state.isCreating;
    }

    startEdit(status) {
        this.state.editingId = status.id;
        this.state.isCreating = false;
        this.state.editData = {
            name: status.name,
            color: status.color,
            transitionIds: status.can_transition_to_ids || [], // IDs
        };
    }

    startCreate() {
        this.state.editingId = null;
        this.state.isCreating = true;
        this.state.editData = {
            name: "",
            color: 0,
            transitionIds: [],
        };
    }

    cancelEdit() {
        this.state.editingId = null;
        this.state.isCreating = false;
        this.state.editData = { name: "", color: 0, transitionIds: [] };
    }

    async saveStatus() {
        const { name, color, transitionIds } = this.state.editData;

        const cleanName = (name || "").trim();
        if (!cleanName) {
            this.props.onNotify?.("Status name is required.", "danger");
            return;
        }
        
        try {
            this.state.loading.saving = true;
            if (this.state.isCreating) {
                await this.orm.create("task.status", [{
                    name: cleanName,
                    color: Number(color),
                    can_transition_to_ids: [[6, 0, transitionIds.map(Number)]], 
                    sequence: 100, // Default to end
                }]);
                this.props.onNotify?.("Created status.", "success");
            } else {
                await this.orm.write("task.status", [this.state.editingId], {
                    name: cleanName,
                    color: Number(color),
                    can_transition_to_ids: [[6, 0, transitionIds.map(Number)]],
                });
                this.props.onNotify?.("Saved status.", "success");
            }
            await this.loadStatuses();
            this.cancelEdit();
            this.props.onUpdate(); // Notify parent to reload
        } catch (e) {
            console.error("Failed to save status", e);
            this.props.onNotify?.("Couldn’t save status. Try again.", "danger");
        } finally {
            this.state.loading.saving = false;
        }
    }

    async deleteStatus(id) {
        if (!confirm("Are you sure? This might fail if tasks are assigned.")) return;
        try {
            this.state.loading.deletingId = id;
            await this.orm.unlink("task.status", [id]);
            await this.loadStatuses();
            this.props.onUpdate();
            this.props.onNotify?.("Deleted status.", "success");
        } catch (e) {
            this.props.onNotify?.("Couldn’t delete status. It may be in use.", "danger");
        } finally {
            this.state.loading.deletingId = null;
        }
    }

    toggleTransition(id) {
        const current = this.state.editData.transitionIds.map(Number);
        const target = Number(id);
        if (current.includes(target)) {
            this.state.editData.transitionIds = current.filter(x => x !== target);
        } else {
            this.state.editData.transitionIds = [...current, target];
        }
    }
    
    // Helper to get color code for display purposes, reusing logic from main app roughly
    getColorStyle(idx) {
        const colors = ["#71639e", "#d85c5c", "#e2a046", "#5cb85c", "#5bc0de", "#f0ad4e", "#d9534f", "#292b2c", "#f7f7f9"];
        return colors[idx % colors.length] || "#71639e";
    }
}

/** @odoo-module **/

import { Component, useState, onWillStart } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { TaskCard } from "./components/TaskCard";
import { TaskForm } from "./components/TaskForm";
import { TaskLog } from "./components/TaskLog";
import { Sidebar } from "./components/Sidebar";
import { Notification } from "./components/Notification";
import { StatusSettings } from "./components/StatusSettings";

export class TaskManager extends Component {
    static template = "awesome_owl.TaskManager";
    static components = { TaskCard, TaskForm, TaskLog, Sidebar, Notification, StatusSettings };

    setup() {
        this.orm = useService("orm");
        this.statusConfig = {};
        this.categories = [];
        this.statusList = []; // Array for consistent ordering

        this.state = useState({
            tasks: [],
            logs: [],
            nextLogId: 1,
            filters: {
                status: null,
                priority: null,
                category: null,
                search: "",
                dateRange: "all", // all, today, this_month, this_year, custom
                customStart: "",
                customEnd: "",
            },
            sort: {
                field: "dueDate", // dueDate, priority, status
                order: "asc", // asc, desc
            },
            pagination: {
                page: 1,
                pageSize: 10,
            },
            ui: {
                showForm: false,
                editingTask: null,
                showLog: false,
                showSettings: false,
                activeView: "kanban",
                showDeleteConfirm: false,
                deleteTaskId: null,
            },
            notifications: [],
            nextNotifId: 1,
        });

        onWillStart(async () => {
            await this.loadData();
        });
    }

    async loadData() {
        // Fetch Statuses with transitions
        const statuses = await this.orm.searchRead(
            "task.status", 
            [], 
            ["id", "name", "color", "sequence", "can_transition_to_ids"], 
            { order: "sequence, id" }
        );
        this.statusConfig = Object.fromEntries(statuses.map(s => [s.id, { 
            label: s.name, 
            color: this.getColor(s.color), 
            id: s.id,
            validTransitions: s.can_transition_to_ids 
        }]));
        this.statusList = statuses;

        // Fetch Categories
        this.categories = await this.orm.searchRead("task.category", [], ["id", "name", "color"]);

        // Fetch Tasks
        // We fetch all for now. In real app might want domain.
        const tasks = await this.orm.searchRead("task.task", [], 
            ["id", "name", "description", "priority", "status_id", "category_id", "user_id", "date_deadline", "create_date", "write_date"]);
        
        this.state.tasks = tasks.map(t => this.formatTask(t));
    }

    getColor(index) {
        // Simple mapping or return hex if stored. Model has integer color index.
        const colors = [
            "#71639e", "#d85c5c", "#e2a046", "#5cb85c", "#5bc0de", "#f0ad4e", "#d9534f", "#292b2c", "#f7f7f9"
        ];
        return colors[index % colors.length] || "#71639e";
    }

    hexToRgba(hex, alpha) {
        if (!hex || typeof hex !== "string") return "";
        const clean = hex.replace("#", "");
        if (clean.length !== 6) return "";
        const r = parseInt(clean.slice(0, 2), 16);
        const g = parseInt(clean.slice(2, 4), 16);
        const b = parseInt(clean.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    getStatusLabel(statusId) {
        return this.statusConfig[statusId]?.label || String(statusId || "");
    }

    getStatusBadgeStyle(statusId) {
        const color = this.statusConfig[statusId]?.color;
        if (!color) return "";
        const bg = this.hexToRgba(color, 0.15);
        return `background: ${bg}; color: ${color};`;
    }

    getCategoryName(categoryId) {
        if (!categoryId) return "—";
        const cat = this.categories.find((c) => c.id === categoryId);
        return cat ? cat.name : String(categoryId);
    }

    formatTask(t) {
        return {
            id: t.id,
            title: t.name,
            description: t.description || "",
            status: t.status_id ? t.status_id[0] : (this.statusList[0]?.id || 0),
            priority: this.mapPriority(t.priority),
            category: t.category_id ? t.category_id[0] : null,
            assignee: t.user_id ? t.user_id[1] : "", // Display name
            dueDate: t.date_deadline,
            createdAt: new Date(t.create_date),
            updatedAt: new Date(t.write_date),
            tags: [],
        };
    }

    mapPriority(val) {
        const map = { '0': 'low', '1': 'medium', '2': 'high', '3': 'urgent' };
        return map[val] || 'medium';
    }

    reversePriority(val) {
        const map = { 'low': '0', 'medium': '1', 'high': '2', 'urgent': '3' };
        return map[val] || '1';
    }

    // ─── Notifications ─────────────────────────────────────
    notify(message, type = "success") {
        const id = this.state.nextNotifId++;
        this.state.notifications.push({ id, message, type });
        setTimeout(() => {
            this.state.notifications = this.state.notifications.filter((n) => n.id !== id);
        }, 3500);
    }

    // ─── Log ────────────────────────────────────────────────
    addLog(taskId, action, details) {
        this.state.logs.unshift({
            id: this.state.nextLogId++,
            taskId,
            action,
            details,
            timestamp: new Date(),
        });
    }

    // ─── Computed ───────────────────────────────────────────
    get filteredTasks() {
        let tasks = this.state.tasks;
        const f = this.state.filters;
        
        // existing filters
        if (f.status) tasks = tasks.filter((t) => t.status === f.status);
        if (f.priority) tasks = tasks.filter((t) => t.priority === f.priority);
        if (f.category) tasks = tasks.filter((t) => t.category === f.category);
        if (f.search) {
            const q = f.search.toLowerCase();
            tasks = tasks.filter(
                (t) =>
                    t.title.toLowerCase().includes(q) ||
                    t.description.toLowerCase().includes(q) ||
                    (t.assignee && t.assignee.toLowerCase().includes(q))
            );
        }

        // Date Filter
        if (f.dateRange !== 'all') {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            
            tasks = tasks.filter(t => {
                if (!t.dueDate) return false; // Exclude no-date tasks from time filters
                const d = new Date(t.dueDate);
                
                switch(f.dateRange) {
                    case 'today':
                        return d >= startOfDay && d <= endOfDay;
                    case 'this_month':
                        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                    case 'this_year':
                        return d.getFullYear() === now.getFullYear();
                    case 'custom':
                        const start = f.customStart ? new Date(f.customStart) : null;
                        const end = f.customEnd ? new Date(f.customEnd) : null;
                        if (end) end.setHours(23, 59, 59);
                        if (start && d < start) return false;
                        if (end && d > end) return false;
                        return true;
                    default: return true;
                }
            });
        }

        // Sorting
        const { field, order } = this.state.sort;
        if (field) {
            tasks = [...tasks].sort((a, b) => { // Copy to avoid mutating
                let valA, valB;
                
                if (field === 'priority') {
                    // Logic to sort priority: urgent > high > medium > low
                    const pMap = { urgent: 3, high: 2, medium: 1, low: 0 };
                    valA = pMap[a.priority] || 0;
                    valB = pMap[b.priority] || 0;
                } else if (field === 'status') {
                     // Sort by status sequence/order
                     const idxA = this.statusList.findIndex(s => s.id === a.status);
                     const idxB = this.statusList.findIndex(s => s.id === b.status);
                     valA = idxA;
                     valB = idxB;
                } else if (field === 'dueDate') {
                    valA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                    valB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                    // Put no-date at end always? Or beginning? Let's treat 0 as very old.
                    // If we want no-date at bottom for ASC, assign huge number.
                    if (!a.dueDate) valA = order === 'asc' ? 9999999999999 : -1;
                    if (!b.dueDate) valB = order === 'asc' ? 9999999999999 : -1;
                } else {
                    if (field === "category") {
                        valA = this.getCategoryName(a.category) || "";
                        valB = this.getCategoryName(b.category) || "";
                    } else {
                        valA = a[field] || "";
                        valB = b[field] || "";
                    }
                }

                if (valA < valB) return order === 'asc' ? -1 : 1;
                if (valA > valB) return order === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return tasks;
    }

    get totalPages() {
        return Math.max(1, Math.ceil(this.filteredTasks.length / this.state.pagination.pageSize));
    }

    get pagedTasks() {
        const page = Math.min(this.state.pagination.page, this.totalPages);
        const start = (page - 1) * this.state.pagination.pageSize;
        const end = start + this.state.pagination.pageSize;
        return this.filteredTasks.slice(start, end);
    }

    get pageInfo() {
        const total = this.filteredTasks.length;
        if (!total) return { from: 0, to: 0, total };
        const page = Math.min(this.state.pagination.page, this.totalPages);
        const from = (page - 1) * this.state.pagination.pageSize + 1;
        const to = Math.min(total, page * this.state.pagination.pageSize);
        return { from, to, total };
    }

    goPrevPage() {
        this.state.pagination.page = Math.max(1, this.state.pagination.page - 1);
    }

    goNextPage() {
        this.state.pagination.page = Math.min(this.totalPages, this.state.pagination.page + 1);
    }

    // ─── Sorting & Settings ──────────────────────────────
    toggleSort(field) {
        if (this.state.sort.field === field) {
            this.state.sort.order = this.state.sort.order === 'asc' ? 'desc' : 'asc';
        } else {
            this.state.sort.field = field;
            this.state.sort.order = 'asc';
        }
        this.state.pagination.page = 1;
    }

    openSettings() {
        this.state.ui.showSettings = true;
    }

    closeSettings() {
        this.state.ui.showSettings = false;
        this.loadData(); // Reload config
    }
    
    // ─── Drag and Drop ──────────────────────────────────
    onTaskDragStart(ev, task) {
        ev.dataTransfer.setData("text/plain", JSON.stringify(task));
        ev.dataTransfer.effectAllowed = "move";
    }

    onTaskDrop(ev, targetStatusId) {
        ev.preventDefault();
        const data = ev.dataTransfer.getData("text/plain");
        if (!data) return;
        const task = JSON.parse(data);

        if (task.status === targetStatusId) return;

        // Check Valid Transition
        const currentStatus = this.statusConfig[task.status];
        if (currentStatus && currentStatus.validTransitions && currentStatus.validTransitions.length > 0) {
            if (!currentStatus.validTransitions.includes(targetStatusId)) {
                this.notify(`Cannot move from "${currentStatus.label}" to this status.`, "danger");
                return;
            }
        }

        this.onStatusChange(task.id, targetStatusId);
    }

    onDragOver(ev) {
        ev.preventDefault(); // Allow Drop
        ev.dataTransfer.dropEffect = "move";
    }

    get stats() {
        const tasks = this.state.tasks;
        const now = new Date();
        return {
            total: tasks.length,
            overdue: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done").length,
            byStatus: this.countBy(tasks, "status"),
            byPriority: this.countBy(tasks, "priority"),
            byCategory: this.countBy(tasks, "category"),
        };
    }

    countBy(arr, key) {
        return arr.reduce((acc, item) => {
            acc[item[key]] = (acc[item[key]] || 0) + 1;
            return acc;
        }, {});
    }

    getTasksByStatus(status) {
        return this.filteredTasks.filter((t) => t.status === status);
    }

    get statusColumns() {
        // Iterate over statusList instead of config entries to maintain order if using list
        // Or if using dynamic loaded config based on backend order.
        return this.statusList.map((status) => ({
            key: status.id,
            label: status.name,
            color: this.statusConfig[status.id].color,
            tasks: this.getTasksByStatus(status.id),
        }));
    }

    // ─── CRUD ───────────────────────────────────────────────
    openCreateForm() {
        this.state.ui.editingTask = null;
        this.state.ui.showForm = true;
    }

    openEditForm(task) {
        this.state.ui.editingTask = { ...task };
        this.state.ui.showForm = true;
    }

    closeForm() {
        this.state.ui.showForm = false;
        this.state.ui.editingTask = null;
    }

    async onSaveTask(data) {
        const vals = {
            name: data.title,
            description: data.description,
            status_id: Number(data.status),
            priority: this.reversePriority(data.priority),
            category_id: data.category ? Number(data.category) : false,
            date_deadline: data.dueDate, 
            // assignee: ignored as we don't have user selection yet
        };

        try {
            if (this.state.ui.editingTask) {
                // Update
                await this.orm.write("task.task", [this.state.ui.editingTask.id], vals);
                this.addLog(this.state.ui.editingTask.id, "updated", `Task "${data.title}" was updated`);
                this.notify(`Task "${data.title}" updated!`);
            } else {
                // Create
                const [newId] = await this.orm.create("task.task", [vals]);
                this.addLog(newId, "created", `Task "${data.title}" was created`);
                this.notify(`Task "${data.title}" created!`);
            }
            await this.loadData();
            this.closeForm();
        } catch (e) {
            console.error(e);
            this.notify("Error saving task", "danger");
        }
    }

    // Delete
    confirmDelete(taskId) {
        this.state.ui.showDeleteConfirm = true;
        this.state.ui.deleteTaskId = taskId;
    }

    cancelDelete() {
        this.state.ui.showDeleteConfirm = false;
        this.state.ui.deleteTaskId = null;
    }

    async deleteTask() {
        if (!this.state.ui.deleteTaskId) return;
        try {
            await this.orm.unlink("task.task", [this.state.ui.deleteTaskId]);
            this.notify("Task deleted successfully");
            await this.loadData();
        } catch (e) {
            console.error(e);
            this.notify("Error deleting task", "danger");
        }
        this.state.ui.showDeleteConfirm = false;
        this.state.ui.deleteTaskId = null;
    }

    executeDelete() {
        // Redundant with deleteTask
        this.deleteTask();
    }

    // Status change
    async onStatusChange(taskId, newStatusId) {
        // Optimistic update or wait for server?
        // Let's do simple wait for server
        try {
            await this.orm.write("task.task", [taskId], { status_id: Number(newStatusId) });
            await this.loadData();
            this.notify("Task status updated");
        } catch(e) {
            this.notify("Failed to move task", "danger");
        }
    }

    // ─── Filters ────────────────────────────────────────────
    onFilterChange(filterKey, value) {
        this.state.filters[filterKey] = value;
        this.state.pagination.page = 1;
    }

    onSearchInput(value) {
        this.state.filters.search = value;
        this.state.pagination.page = 1;
    }

    // ─── View Toggle ────────────────────────────────────────
    setView(view) {
        this.state.ui.activeView = view;
    }

    // ─── Log Panel ──────────────────────────────────────────
    toggleLog() {
        this.state.ui.showLog = !this.state.ui.showLog;
    }

    closeLog() {
        this.state.ui.showLog = false;
    }
}

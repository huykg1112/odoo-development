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
        this.assignees = [];
        this.statusList = []; // Array for consistent ordering

        this._searchDebounce = null;

        this.state = useState({
            kanbanTasks: [],
            table: {
                tasks: [],
                total: 0,
            },
            stats: {
                total: 0,
                done: 0,
                active: 0,
                overdue: 0,
                byStatus: {},
                byPriority: {},
                byCategory: {},
            },
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
                loading: {
                    initial: true,
                    tasks: false,
                    saveTask: false,
                    deleteTask: false,
                    statusChange: false,
                    settings: false,
                    createCategory: false,
                },
            },
            notifications: [],
            nextNotifId: 1,
        });

        onWillStart(async () => {
            await this.loadData();
        });
    }

    async loadData() {
        await this.withLoading("initial", async () => {
            await this.loadConfig();
            await this.refreshAll({ resetPage: true });
        });
    }

    async loadConfig() {
        // Fetch Statuses with transitions
        const statuses = await this.orm.searchRead(
            "task.status",
            [],
            ["id", "name", "color", "sequence", "fold", "can_transition_to_ids"],
            { order: "sequence, id" }
        );
        this.statusConfig = Object.fromEntries(
            statuses.map((s) => [
                s.id,
                {
                    label: s.name,
                    color: this.getColor(s.color),
                    id: s.id,
                    fold: !!s.fold,
                    validTransitions: s.can_transition_to_ids,
                },
            ])
        );
        this.statusList = statuses;

        // Fetch Categories
        this.categories = await this.orm.searchRead("task.category", [], ["id", "name", "color"]);

        // Fetch Assignees
        this.assignees = await this.orm.searchRead(
            "task.user",
            [["active", "=", true]],
            ["id", "name", "email", "color"],
            { order: "name, id" }
        );
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
            assigneeId: t.assignee_id ? t.assignee_id[0] : null,
            assignee: t.assignee_id ? t.assignee_id[1] : "", // Display name
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

    // ─── Loading helpers ──────────────────────────────────
    get isBusy() {
        const l = this.state.ui.loading;
        return !!(
            l.initial ||
            l.tasks ||
            l.saveTask ||
            l.deleteTask ||
            l.statusChange ||
            l.settings ||
            l.createCategory
        );
    }

    async withLoading(key, fn) {
        this.state.ui.loading[key] = true;
        try {
            return await fn();
        } finally {
            this.state.ui.loading[key] = false;
        }
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
    get totalPages() {
        return Math.max(1, Math.ceil((this.state.table.total || 0) / this.state.pagination.pageSize));
    }

    get pagedTasks() {
        return this.state.table.tasks;
    }

    get pageInfo() {
        const total = this.state.table.total || 0;
        if (!total) return { from: 0, to: 0, total };
        const page = Math.min(this.state.pagination.page, this.totalPages);
        const from = (page - 1) * this.state.pagination.pageSize + 1;
        const to = Math.min(total, page * this.state.pagination.pageSize);
        return { from, to, total };
    }

    goPrevPage() {
        if (this.state.pagination.page <= 1) return;
        this.state.pagination.page = Math.max(1, this.state.pagination.page - 1);
        void this.refreshAll();
    }

    goNextPage() {
        if (this.state.pagination.page >= this.totalPages) return;
        this.state.pagination.page = Math.min(this.totalPages, this.state.pagination.page + 1);
        void this.refreshAll();
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
        void this.refreshAll();
    }

    openSettings() {
        this.state.ui.showSettings = true;
    }

    closeSettings() {
        this.state.ui.showSettings = false;
        void this.withLoading("settings", async () => {
            await this.loadConfig();
            await this.refreshAll({ resetPage: true });
        });
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
        return this.state.stats;
    }

    getTasksByStatus(status) {
        return this.state.kanbanTasks.filter((t) => t.status === status);
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
            assignee_id: data.assigneeId ? Number(data.assigneeId) : false,
            date_deadline: data.dueDate ? this.formatDate(data.dueDate) : false,
        };

        await this.withLoading("saveTask", async () => {
            try {
                if (this.state.ui.editingTask) {
                    await this.orm.write("task.task", [this.state.ui.editingTask.id], vals);
                    this.addLog(this.state.ui.editingTask.id, "updated", `Task "${data.title}" was updated`);
                    this.notify(`Saved "${data.title}".`, "success");
                } else {
                    const [newId] = await this.orm.create("task.task", [vals]);
                    this.addLog(newId, "created", `Task "${data.title}" was created`);
                    this.notify(`Created "${data.title}".`, "success");
                }
                await this.refreshAll();
                this.closeForm();
            } catch (e) {
                console.error(e);
                this.notify("Couldn’t save task. Try again.", "danger");
            }
        });
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
        await this.withLoading("deleteTask", async () => {
            try {
                await this.orm.unlink("task.task", [this.state.ui.deleteTaskId]);
                this.notify("Deleted task.", "success");
                await this.refreshAll({ resetPage: true });
            } catch (e) {
                console.error(e);
                this.notify("Couldn’t delete task. It may be restricted.", "danger");
            }
            this.state.ui.showDeleteConfirm = false;
            this.state.ui.deleteTaskId = null;
        });
    }

    executeDelete() {
        // Redundant with deleteTask
        this.deleteTask();
    }

    // Status change
    async onStatusChange(taskId, newStatusId) {
        // Optimistic update or wait for server?
        // Let's do simple wait for server
        await this.withLoading("statusChange", async () => {
            try {
                await this.orm.write("task.task", [taskId], { status_id: Number(newStatusId) });
                await this.refreshAll();
                this.notify("Moved task.", "success");
            } catch (e) {
                this.notify("Couldn’t move task.", "danger");
            }
        });
    }

    // ─── Filters ────────────────────────────────────────────
    onFilterChange(filterKey, value) {
        this.state.filters[filterKey] = value;
        this.state.pagination.page = 1;
        void this.refreshAll({ resetPage: true });
    }

    onSearchInput(value) {
        this.state.filters.search = value;
        this.state.pagination.page = 1;

        if (this._searchDebounce) {
            clearTimeout(this._searchDebounce);
        }
        this._searchDebounce = setTimeout(() => {
            void this.refreshAll({ resetPage: true });
        }, 250);
    }

    onDateFilterChange() {
        this.state.pagination.page = 1;
        void this.refreshAll({ resetPage: true });
    }

    // ─── View Toggle ────────────────────────────────────────
    setView(view) {
        this.state.ui.activeView = view;
        if (view === "kanban") {
            void this.refreshKanban();
        }
    }

    // ─── Log Panel ──────────────────────────────────────────
    toggleLog() {
        this.state.ui.showLog = !this.state.ui.showLog;
    }

    closeLog() {
        this.state.ui.showLog = false;
    }

    // ─── Backend filtering/sorting/pagination ─────────────
    formatDate(d) {
        if (!d) return "";
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    buildDomain({ omitStatus = false, omitPriority = false, omitCategory = false } = {}) {
        const f = this.state.filters;
        const domain = [];

        if (!omitStatus && f.status) domain.push(["status_id", "=", Number(f.status)]);
        if (!omitPriority && f.priority) domain.push(["priority", "=", this.reversePriority(f.priority)]);
        if (!omitCategory && f.category) domain.push(["category_id", "=", Number(f.category)]);

        if (f.search) {
            domain.push(
                "|",
                "|",
                ["name", "ilike", f.search],
                ["description", "ilike", f.search],
                ["assignee_id", "ilike", f.search]
            );
        }

        if (f.dateRange && f.dateRange !== "all") {
            const now = new Date();
            if (f.dateRange === "today") {
                const s = this.formatDate(now);
                domain.push(["date_deadline", "=", s]);
            } else if (f.dateRange === "this_month") {
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                domain.push(["date_deadline", ">=", this.formatDate(start)]);
                domain.push(["date_deadline", "<=", this.formatDate(end)]);
            } else if (f.dateRange === "this_year") {
                const start = new Date(now.getFullYear(), 0, 1);
                const end = new Date(now.getFullYear(), 11, 31);
                domain.push(["date_deadline", ">=", this.formatDate(start)]);
                domain.push(["date_deadline", "<=", this.formatDate(end)]);
            } else if (f.dateRange === "custom") {
                if (f.customStart) domain.push(["date_deadline", ">=", f.customStart]);
                if (f.customEnd) domain.push(["date_deadline", "<=", f.customEnd]);
            }
        }

        return domain;
    }

    buildOrder() {
        const { field, order } = this.state.sort;
        const dir = order === "desc" ? "desc" : "asc";
        switch (field) {
            case "title":
                return `name ${dir}`;
            case "status":
                return `status_id.sequence ${dir}, status_id ${dir}, id desc`;
            case "priority":
                return `priority ${dir}, id desc`;
            case "category":
                return `category_id ${dir}, id desc`;
            case "dueDate":
                return `date_deadline ${dir}, id desc`;
            default:
                return `id desc`;
        }
    }

    async refreshAll({ resetPage = false } = {}) {
        if (resetPage) this.state.pagination.page = 1;
        await this.withLoading("tasks", async () => {
            const domain = this.buildDomain();
            const order = this.buildOrder();

            await Promise.all([
                this.loadStats(domain),
                this.loadTableTasks(domain, order),
                this.state.ui.activeView === "kanban" ? this.loadKanbanTasks(domain, order) : Promise.resolve(),
            ]);
        });
    }

    async refreshKanban() {
        const domain = this.buildDomain();
        const order = this.buildOrder();
        await this.withLoading("tasks", async () => {
            await this.loadKanbanTasks(domain, order);
        });
    }

    async loadTableTasks(domain, order) {
        const limit = this.state.pagination.pageSize;
        const offset = (this.state.pagination.page - 1) * limit;
        const fields = [
            "id",
            "name",
            "description",
            "priority",
            "status_id",
            "category_id",
            "assignee_id",
            "date_deadline",
            "create_date",
            "write_date",
        ];

        const total = await this.orm.call("task.task", "search_count", [domain]);

        // Clamp invalid page
        const lastPage = Math.max(1, Math.ceil(total / limit));
        if (this.state.pagination.page > lastPage) {
            this.state.pagination.page = lastPage;
        }

        const actualOffset = (this.state.pagination.page - 1) * limit;
        const records = await this.orm.searchRead("task.task", domain, fields, {
            order,
            offset: actualOffset,
            limit,
        });

        this.state.table.total = total;
        this.state.table.tasks = records.map((t) => this.formatTask(t));
    }

    async loadKanbanTasks(domain, order) {
        const fields = [
            "id",
            "name",
            "description",
            "priority",
            "status_id",
            "category_id",
            "assignee_id",
            "date_deadline",
            "create_date",
            "write_date",
        ];
        const records = await this.orm.searchRead("task.task", domain, fields, { order });
        this.state.kanbanTasks = records.map((t) => this.formatTask(t));
    }


    async loadStats(domain) {
        const fullDomain = domain || this.buildDomain();
        const statusDomain = this.buildDomain({ omitStatus: true });
        const priorityDomain = this.buildDomain({ omitPriority: true });
        const categoryDomain = this.buildDomain({ omitCategory: true });

        const total = await this.orm.call("task.task", "search_count", [fullDomain]);

        const today = this.formatDate(new Date());
        const overdueDomain = [...fullDomain, ["date_deadline", "<", today], ["status_id.fold", "=", false]];
        const overdue = await this.orm.call("task.task", "search_count", [overdueDomain]);

        const [byStatusFullGroups, byStatusGroups, byPriorityGroups, byCategoryGroups] = await Promise.all([
            this.orm.call("task.task", "read_group", [fullDomain, ["status_id"], ["status_id"]], { lazy: false }),
            this.orm.call("task.task", "read_group", [statusDomain, ["status_id"], ["status_id"]], { lazy: false }),
            this.orm.call("task.task", "read_group", [priorityDomain, ["priority"], ["priority"]], { lazy: false }),
            this.orm.call("task.task", "read_group", [categoryDomain, ["category_id"], ["category_id"]], { lazy: false }),
        ]);

        const byStatusFull = {};
        for (const g of byStatusFullGroups) {
            const id = g.status_id ? g.status_id[0] : null;
            if (id) byStatusFull[id] = g.__count;
        }

        const byStatus = {};
        for (const g of byStatusGroups) {
            const id = g.status_id ? g.status_id[0] : null;
            if (id) byStatus[id] = g.__count;
        }

        const byPriority = {};
        for (const g of byPriorityGroups) {
            const key = g.priority;
            if (key !== undefined && key !== null && key !== false) {
                byPriority[this.mapPriority(String(key))] = g.__count;
            }
        }

        const byCategory = {};
        for (const g of byCategoryGroups) {
            const id = g.category_id ? g.category_id[0] : null;
            if (id) byCategory[id] = g.__count;
        }

        let done = 0;
        for (const [statusIdStr, count] of Object.entries(byStatusFull)) {
            const statusId = Number(statusIdStr);
            if (this.statusConfig[statusId]?.fold) done += count;
        }

        this.state.stats.total = total;
        this.state.stats.overdue = overdue;
        this.state.stats.byStatus = byStatus;
        this.state.stats.byPriority = byPriority;
        this.state.stats.byCategory = byCategory;
        this.state.stats.done = done;
        this.state.stats.active = Math.max(0, total - done);
    }
}

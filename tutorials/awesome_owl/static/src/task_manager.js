/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { TaskCard } from "./components/TaskCard";
import { TaskForm } from "./components/TaskForm";
import { TaskLog } from "./components/TaskLog";
import { Sidebar } from "./components/Sidebar";
import { Notification } from "./components/Notification";

const STATUS_CONFIG = {
    backlog: { label: "Backlog", color: "var(--status-backlog)" },
    todo: { label: "To Do", color: "var(--status-todo)" },
    in_progress: { label: "In Progress", color: "var(--status-progress)" },
    review: { label: "Review", color: "var(--status-review)" },
    done: { label: "Done", color: "var(--status-done)" },
};

const SAMPLE_TASKS = [
    {
        id: 1,
        title: "Setup Project Architecture",
        description: "Define folder structure, install dependencies, and configure build tools for the new ERP module",
        status: "done",
        priority: "high",
        category: "development",
        assignee: "Nguyen Van A",
        createdAt: new Date("2026-03-18"),
        updatedAt: new Date("2026-03-20"),
        dueDate: new Date("2026-03-20"),
        tags: [],
    },
    {
        id: 2,
        title: "Design Dashboard Mockup",
        description: "Create wireframes and high-fidelity mockups for the main task management dashboard",
        status: "review",
        priority: "medium",
        category: "design",
        assignee: "Tran Thi B",
        createdAt: new Date("2026-03-19"),
        updatedAt: new Date("2026-03-21"),
        dueDate: new Date("2026-03-22"),
        tags: [],
    },
    {
        id: 3,
        title: "Implement Kanban Board",
        description: "Build the interactive Kanban board with drag support and status columns",
        status: "in_progress",
        priority: "urgent",
        category: "development",
        assignee: "Nguyen Van A",
        createdAt: new Date("2026-03-20"),
        updatedAt: new Date("2026-03-21"),
        dueDate: new Date("2026-03-25"),
        tags: [],
    },
    {
        id: 4,
        title: "Write Unit Tests",
        description: "Create comprehensive test suite for task CRUD operations and state management",
        status: "todo",
        priority: "medium",
        category: "testing",
        assignee: "Le Van C",
        createdAt: new Date("2026-03-20"),
        updatedAt: new Date("2026-03-20"),
        dueDate: new Date("2026-03-28"),
        tags: [],
    },
    {
        id: 5,
        title: "API Documentation",
        description: "Write API documentation for all task management endpoints and data models",
        status: "backlog",
        priority: "low",
        category: "documentation",
        assignee: "",
        createdAt: new Date("2026-03-21"),
        updatedAt: new Date("2026-03-21"),
        dueDate: null,
        tags: [],
    },
    {
        id: 6,
        title: "User Authentication Flow",
        description: "Implement login, logout, and session management for the ERP system",
        status: "todo",
        priority: "high",
        category: "development",
        assignee: "Pham Thi D",
        createdAt: new Date("2026-03-19"),
        updatedAt: new Date("2026-03-19"),
        dueDate: new Date("2026-03-24"),
        tags: [],
    },
    {
        id: 7,
        title: "Performance Optimization",
        description: "Profile and optimize rendering performance for large task lists",
        status: "backlog",
        priority: "medium",
        category: "development",
        assignee: "",
        createdAt: new Date("2026-03-21"),
        updatedAt: new Date("2026-03-21"),
        dueDate: null,
        tags: [],
    },
    {
        id: 8,
        title: "UI Accessibility Audit",
        description: "Review all components for WCAG 2.1 compliance and keyboard navigation",
        status: "backlog",
        priority: "low",
        category: "testing",
        assignee: "Le Van C",
        createdAt: new Date("2026-03-21"),
        updatedAt: new Date("2026-03-21"),
        dueDate: new Date("2026-03-30"),
        tags: [],
    },
];

export class TaskManager extends Component {
    static template = "awesome_owl.TaskManager";
    static components = { TaskCard, TaskForm, TaskLog, Sidebar, Notification };

    setup() {
        this.statusConfig = STATUS_CONFIG;

        this.state = useState({
            tasks: SAMPLE_TASKS,
            logs: [
                {
                    id: 1,
                    taskId: 1,
                    action: "created",
                    details: 'Task "Setup Project Architecture" was created',
                    timestamp: new Date("2026-03-18T09:00:00"),
                },
                {
                    id: 2,
                    taskId: 1,
                    action: "status_changed",
                    details: 'Task "Setup Project Architecture" moved to Done',
                    timestamp: new Date("2026-03-20T14:30:00"),
                },
                {
                    id: 3,
                    taskId: 3,
                    action: "created",
                    details: 'Task "Implement Kanban Board" was created',
                    timestamp: new Date("2026-03-20T10:00:00"),
                },
            ],
            nextId: 9,
            nextLogId: 4,
            filters: {
                status: null,
                priority: null,
                category: null,
                search: "",
            },
            ui: {
                showForm: false,
                editingTask: null,
                showLog: false,
                activeView: "kanban",
                showDeleteConfirm: false,
                deleteTaskId: null,
            },
            notifications: [],
            nextNotifId: 1,
        });
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
        return tasks;
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
        return Object.entries(this.statusConfig).map(([key, cfg]) => ({
            key,
            label: cfg.label,
            color: cfg.color,
            tasks: this.getTasksByStatus(key),
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

    onSaveTask(data) {
        if (this.state.ui.editingTask) {
            // Update existing
            const id = this.state.ui.editingTask.id;
            this.state.tasks = this.state.tasks.map((t) =>
                t.id === id ? { ...t, ...data, updatedAt: new Date() } : t
            );
            this.addLog(id, "updated", `Task "${data.title}" was updated`);
            this.notify(`Task "${data.title}" updated successfully!`);
        } else {
            // Create new
            const newTask = {
                id: this.state.nextId++,
                ...data,
                createdAt: new Date(),
                updatedAt: new Date(),
                tags: [],
            };
            this.state.tasks.push(newTask);
            this.addLog(newTask.id, "created", `Task "${data.title}" was created`);
            this.notify(`Task "${data.title}" created!`);
        }
        this.closeForm();
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

    executeDelete() {
        const id = this.state.ui.deleteTaskId;
        const task = this.state.tasks.find((t) => t.id === id);
        if (task) {
            this.state.tasks = this.state.tasks.filter((t) => t.id !== id);
            this.addLog(id, "deleted", `Task "${task.title}" was deleted`);
            this.notify(`Task "${task.title}" deleted`, "info");
        }
        this.cancelDelete();
    }

    // Status change
    onStatusChange(taskId, newStatus) {
        const task = this.state.tasks.find((t) => t.id === taskId);
        if (task) {
            const oldStatus = this.statusConfig[task.status]?.label || task.status;
            const newLabel = this.statusConfig[newStatus]?.label || newStatus;
            task.status = newStatus;
            task.updatedAt = new Date();
            this.addLog(taskId, "status_changed", `Task "${task.title}" moved from ${oldStatus} to ${newLabel}`);
            this.notify(`Moved to ${newLabel}`);
        }
    }

    // ─── Filters ────────────────────────────────────────────
    onFilterChange(filterKey, value) {
        this.state.filters[filterKey] = value;
    }

    onSearchInput(value) {
        this.state.filters.search = value;
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

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

    /**
     * Entry point của component (Owl).
     * - Khai báo service (ORM), cache config (status/category/assignee)
     * - Khởi tạo state reactive (useState) cho UI + dữ liệu
     * - Đăng ký hook onWillStart để preload dữ liệu trước khi render lần đầu
     */
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

    /**
     * Load toàn bộ dữ liệu cần cho màn hình.
     * Chạy trong withLoading("initial") để bật/tắt spinner tổng.
     * Quy ước giống Odoo backend: load "config" (master data) trước,
     * sau đó refresh danh sách + thống kê theo filter hiện tại.
     */
    async loadData() {
        await this.withLoading("initial", async () => {
            await this.loadConfig();
            await this.refreshAll({ resetPage: true });
        });
    }

    /**
     * Load master/config từ backend thông qua ORM service.
     * - Status: đọc sequence/fold + can_transition_to_ids để kiểm soát kéo-thả
     * - Category, Assignee: dùng để hiển thị label và filter
     * Lưu ý: searchRead trả recordset dạng JS object; many2one là [id, display_name].
     */
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

    /**
     * Map integer color index (kiểu Odoo) -> mã màu hex.
     * Backend thường lưu color như số nguyên; UI tự mapping sang palette.
     */
    getColor(index) {
        // Simple mapping or return hex if stored. Model has integer color index.
        const colors = [
            "#71639e", "#d85c5c", "#e2a046", "#5cb85c", "#5bc0de", "#f0ad4e", "#d9534f", "#292b2c", "#f7f7f9"
        ];
        return colors[index % colors.length] || "#71639e";
    }

    /**
     * Helper UI: chuyển hex (#RRGGBB) -> rgba(r,g,b,a) để dùng làm background nhẹ.
     * @param {string} hex
     * @param {number} alpha
     * @returns {string}
     */
    hexToRgba(hex, alpha) {
        if (!hex || typeof hex !== "string") return "";
        const clean = hex.replace("#", "");
        if (clean.length !== 6) return "";
        const r = parseInt(clean.slice(0, 2), 16);
        const g = parseInt(clean.slice(2, 4), 16);
        const b = parseInt(clean.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /**
     * Lấy label của status từ cache statusConfig.
     * Dùng khi render table/kanban để tránh phụ thuộc vào many2one name.
     */
    getStatusLabel(statusId) {
        return this.statusConfig[statusId]?.label || String(statusId || "");
    }

    /**
     * Tạo style inline cho badge status theo color config.
     * Trả về chuỗi CSS (background + text color).
     */
    getStatusBadgeStyle(statusId) {
        const color = this.statusConfig[statusId]?.color;
        if (!color) return "";
        const bg = this.hexToRgba(color, 0.15);
        return `background: ${bg}; color: ${color};`;
    }

    /**
     * Resolve tên category từ cache categories (id -> name).
     * @param {number|null} categoryId
     * @returns {string}
     */
    getCategoryName(categoryId) {
        if (!categoryId) return "—";
        const cat = this.categories.find((c) => c.id === categoryId);
        return cat ? cat.name : String(categoryId);
    }

    /**
     * Chuẩn hoá record backend (task.task) sang shape mà UI dùng.
     * - many2one -> lấy id/name
     * - priority: map từ string số ('0'..'3') sang enum UI (low/medium/high/urgent)
     * - status default: rơi về status đầu tiên theo sequence nếu backend thiếu
     */
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

    /**
     * Map priority backend -> priority enum phía UI.
     * Backend thường lưu selection dạng string số.
     */
    mapPriority(val) {
        const map = { '0': 'low', '1': 'medium', '2': 'high', '3': 'urgent' };
        return map[val] || 'medium';
    }

    /**
     * Map priority UI -> giá trị selection backend.
     * Dùng khi create/write để dữ liệu đúng kiểu selection của model.
     */
    reversePriority(val) {
        const map = { 'low': '0', 'medium': '1', 'high': '2', 'urgent': '3' };
        return map[val] || '1';
    }

    // ─── Loading helpers ──────────────────────────────────
    /**
     * Computed: có đang bận request nào không.
     * Quy tụ các flag loading để UI có thể disable thao tác khi đang gọi ORM.
     */
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

    /**
     * Wrapper chuẩn hoá pattern "loading flag + try/finally".
     * Giống cách Odoo UI đảm bảo spinner luôn được tắt dù RPC fail.
     * @param {keyof this.state.ui.loading} key
     * @param {Function} fn
     */
    async withLoading(key, fn) {
        this.state.ui.loading[key] = true;
        try {
            return await fn();
        } finally {
            this.state.ui.loading[key] = false;
        }
    }

    // ─── Notifications ─────────────────────────────────────
    /**
     * Push toast notification vào state rồi auto-dismiss.
     * Đây là notification local của tutorial (không dùng bus service).
     */
    notify(message, type = "success") {
        const id = this.state.nextNotifId++;
        this.state.notifications.push({ id, message, type });
        setTimeout(() => {
            this.state.notifications = this.state.notifications.filter((n) => n.id !== id);
        }, 3500);
    }

    // ─── Log ────────────────────────────────────────────────
    /**
     * Ghi lại hành động lên task (created/updated/moved...).
     * Log này chỉ ở client để demo audit trail; không lưu vào backend.
     */
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
    /**
     * Tổng số trang dựa theo tổng record backend (search_count) và pageSize.
     */
    get totalPages() {
        return Math.max(1, Math.ceil((this.state.table.total || 0) / this.state.pagination.pageSize));
    }

    /**
     * Danh sách task hiện tại của view table.
     * Trước đây có thể slice client; ở đây đã phân trang backend nên trả thẳng.
     */
    get pagedTasks() {
        return this.state.table.tasks;
    }

    /**
     * Thông tin "Showing x-y of total".
     * Tính toán dựa theo trang hiện tại và pageSize.
     */
    get pageInfo() {
        const total = this.state.table.total || 0;
        if (!total) return { from: 0, to: 0, total };
        const page = Math.min(this.state.pagination.page, this.totalPages);
        const from = (page - 1) * this.state.pagination.pageSize + 1;
        const to = Math.min(total, page * this.state.pagination.pageSize);
        return { from, to, total };
    }

    /**
     * Chuyển về trang trước và reload dataset.
     */
    goPrevPage() {
        if (this.state.pagination.page <= 1) return;
        this.state.pagination.page = Math.max(1, this.state.pagination.page - 1);
        void this.refreshAll();
    }

    /**
     * Chuyển sang trang sau và reload dataset.
     */
    goNextPage() {
        if (this.state.pagination.page >= this.totalPages) return;
        this.state.pagination.page = Math.min(this.totalPages, this.state.pagination.page + 1);
        void this.refreshAll();
    }

    // ─── Sorting & Settings ──────────────────────────────
    /**
     * Toggle sort cho table/kanban.
     * - Nếu bấm lại cùng field: đảo asc/desc
     * - Nếu field mới: set asc
     * Sau đó reset về page 1 và refresh.
     */
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

    /**
     * Mở panel settings (StatusSettings).
     */
    openSettings() {
        this.state.ui.showSettings = true;
    }

    /**
     * Đóng settings và reload config từ backend.
     * Vì status transitions/sequence có thể đã thay đổi, cần rebuild statusConfig.
     */
    closeSettings() {
        this.state.ui.showSettings = false;
        void this.withLoading("settings", async () => {
            await this.loadConfig();
            await this.refreshAll({ resetPage: true });
        });
    }
    
    // ─── Drag and Drop ──────────────────────────────────
    /**
     * Drag start handler: serialize task vào dataTransfer.
     * Lưu ý: đây là dữ liệu client-side; server vẫn là source of truth.
     */
    onTaskDragStart(ev, task) {
        ev.dataTransfer.setData("text/plain", JSON.stringify(task));
        ev.dataTransfer.effectAllowed = "move";
    }

    /**
     * Drop handler: validate transition theo statusConfig trước khi write.
     * - Nếu trạng thái hiện tại có validTransitions: chỉ cho phép drop vào status hợp lệ
     * - Nếu OK: gọi onStatusChange để write lên backend (task.task.status_id)
     */
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

    /**
     * Cho phép drop bằng cách preventDefault trên dragover.
     */
    onDragOver(ev) {
        ev.preventDefault(); // Allow Drop
        ev.dataTransfer.dropEffect = "move";
    }

    /**
     * Getter alias để template dùng ngắn gọn.
     */
    get stats() {
        return this.state.stats;
    }

    /**
     * Lọc task cho kanban theo status id.
     */
    getTasksByStatus(status) {
        return this.state.kanbanTasks.filter((t) => t.status === status);
    }

    /**
     * Build cột kanban theo statusList (đã sắp theo sequence từ backend).
     * Tránh iterate Object.entries(statusConfig) vì object không đảm bảo order.
     */
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
    /**
     * Mở form tạo task mới.
     */
    openCreateForm() {
        this.state.ui.editingTask = null;
        this.state.ui.showForm = true;
    }

    /**
     * Mở form sửa task, clone object để không mutate trực tiếp list item.
     */
    openEditForm(task) {
        this.state.ui.editingTask = { ...task };
        this.state.ui.showForm = true;
    }

    /**
     * Đóng form và clear editing context.
     */
    closeForm() {
        this.state.ui.showForm = false;
        this.state.ui.editingTask = null;
    }

    /**
     * Create/Write task.task lên backend.
     * - Build vals theo field name Odoo (name, description, status_id, ...)
     * - many2one: dùng id hoặc false
     * - date: format YYYY-MM-DD
     * Sau khi thành công: refreshAll để đồng bộ table/kanban/stats.
     */
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
    /**
     * Mở confirm dialog xoá.
     */
    confirmDelete(taskId) {
        this.state.ui.showDeleteConfirm = true;
        this.state.ui.deleteTaskId = taskId;
    }

    /**
     * Huỷ xoá và reset state.
     */
    cancelDelete() {
        this.state.ui.showDeleteConfirm = false;
        this.state.ui.deleteTaskId = null;
    }

    /**
     * Xoá task.task bằng unlink.
     * Nếu xoá thành công: refreshAll(resetPage) để tránh trang hiện tại bị out-of-range.
     */
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

    /**
     * Alias (để template gọi) — thực tế gọi lại deleteTask().
     */
    executeDelete() {
        // Redundant with deleteTask
        this.deleteTask();
    }

    // Status change
    /**
     * Write status_id lên backend khi kéo-thả hoặc đổi status.
     * Ở đây chọn "wait for server" (không optimistic), đảm bảo UI phản ánh đúng
     * theo access rights / constraints phía server.
     */
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
    /**
     * Set filter (status/priority/category/...) rồi reload.
     * Reset về trang 1 vì domain thay đổi.
     */
    onFilterChange(filterKey, value) {
        this.state.filters[filterKey] = value;
        this.state.pagination.page = 1;
        void this.refreshAll({ resetPage: true });
    }

    /**
     * Input search với debounce để tránh spam RPC.
     * Khi user gõ: chỉ refresh sau 250ms idle.
     */
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

    /**
     * Khi đổi dateRange/customStart/customEnd: reload.
     */
    onDateFilterChange() {
        this.state.pagination.page = 1;
        void this.refreshAll({ resetPage: true });
    }

    // ─── View Toggle ────────────────────────────────────────
    /**
     * Chuyển giữa kanban/table.
     * Khi vào kanban: gọi refreshKanban() để đảm bảo dataset kanban update.
     */
    setView(view) {
        this.state.ui.activeView = view;
        if (view === "kanban") {
            void this.refreshKanban();
        }
    }

    // ─── Log Panel ──────────────────────────────────────────
    /**
     * Toggle panel log (client-only).
     */
    toggleLog() {
        this.state.ui.showLog = !this.state.ui.showLog;
    }

    /**
     * Đóng panel log.
     */
    closeLog() {
        this.state.ui.showLog = false;
    }

    // ─── Backend filtering/sorting/pagination ─────────────
    /**
     * Format JS Date -> string YYYY-MM-DD để write vào field date.
     */
    formatDate(d) {
        if (!d) return "";
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    /**
     * Build domain (mảng điều kiện) để dùng với searchRead/search_count/read_group.
     * Tương đương domain Odoo Python: [('field','operator',value), ...]
     * Có các cờ omitX để tính stats theo từng chiều (status/priority/category)
     * mà không "double filter".
     */
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

    /**
     * Build order string theo cú pháp Odoo ("field asc/desc, ...").
     * Lưu ý: order theo related field (status_id.sequence) phụ thuộc model/fields.
     */
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

    /**
     * Refresh mọi phần của màn hình theo filter/sort/pagination hiện tại.
     * - domain/order dùng chung
     * - load song song: stats + table + (kanban nếu đang active)
     */
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

    /**
     * Chỉ refresh dataset kanban (nhẹ hơn refreshAll).
     */
    async refreshKanban() {
        const domain = this.buildDomain();
        const order = this.buildOrder();
        await this.withLoading("tasks", async () => {
            await this.loadKanbanTasks(domain, order);
        });
    }

    /**
     * Load dataset cho table với phân trang backend.
     * - search_count để lấy total
     * - clamp page nếu total thay đổi làm page hiện tại vượt lastPage
     * - searchRead với offset/limit
     */
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

    /**
     * Load dataset cho kanban (không phân trang) để drag/drop theo status.
     * Nếu dataset lớn, có thể cần giới hạn; ở tutorial ưu tiên đơn giản.
     */
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


    /**
     * Tính toán stats bằng các RPC read_group/search_count.
     * - total: search_count(domain)
     * - overdue: thêm điều kiện date_deadline < today và status không fold
     * - byStatus/byPriority/byCategory: read_group trên domain đã omit filter tương ứng
     * - done: sum theo các status có fold=true (quy ước kiểu Odoo: cột gập = done)
     */
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

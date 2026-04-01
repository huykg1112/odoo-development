/** @odoo-module **/

// Import lop Component tu OWL de tao UI component.
import { Component } from "@odoo/owl";

// TaskCard la mot component hien thi 1 task trong board/list.
export class TaskCard extends Component {
    // Ten template XML/QWeb ma component nay se render.
    static template = "awesome_owl.TaskCard";

    // Dinh nghia props dau vao de OWL validate kieu du lieu.
    static props = {
        // task: object chua toan bo thong tin task hien tai.
        task: { type: Object },
        // onEdit: callback duoc goi khi user muon sua task.
        onEdit: { type: Function },
        // onDelete: callback duoc goi khi user xoa task.
        onDelete: { type: Function },
        // onStatusChange: callback doi trang thai task.
        onStatusChange: { type: Function },
        // statusConfig: map cau hinh trang thai (label, color, ...).
        statusConfig: { type: Object },
        // statusList: danh sach trang thai theo thu tu workflow.
        statusList: { type: Array, optional: true },
        // categories: danh sach category de doi id -> ten category.
        categories: { type: Array, optional: true },
    };

    // Tao class CSS theo do uu tien de style badge priority.
    get priorityClass() {
        return `badge-priority-${this.props.task.priority}`;
    }

    // Chuyen ma priority thanh nhan hien thi cho nguoi dung.
    get priorityLabel() {
        // Bang map ma -> label.
        const labels = { low: "Low", medium: "Medium", high: "High", urgent: "Urgent" };
        // Neu khong co priority hop le thi fallback ve Medium.
        return labels[this.props.task.priority] || "Medium";
    }

    // Lay ten category tu id category trong task.
    get categoryLabel() {
        // id category luu trong task.
        const id = this.props.task.category;
        // Neu task chua co category thi hien thi dau gach ngang.
        if (!id) return "—";
        // Tim category theo id trong danh sach categories truyen vao.
        const cat = (this.props.categories || []).find((c) => c.id === id);
        // Neu tim thay thi lay ten, neu khong thi hien thi id dang chuoi.
        return cat ? cat.name : String(id);
    }

    // Tao chu viet tat tu ten assignee de hien thi avatar text.
    get assigneeInitials() {
        // Neu chua co nguoi duoc giao viec.
        if (!this.props.task.assignee) return "?";
        // Tach ten theo khoang trang -> lay ky tu dau moi tu -> ghep -> viet hoa -> cat 2 ky tu.
        return this.props.task.assignee
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    }

    // Format han task thanh chuoi de doc (Today, Tomorrow, Xd left, Xd overdue).
    get formattedDueDate() {
        // Neu khong co due date thi khong hien thi.
        if (!this.props.task.dueDate) return null;
        // Tao Date object tu dueDate.
        const d = new Date(this.props.task.dueDate);
        // Lay thoi diem hien tai.
        const now = new Date();
        // Tinh so ngay chenhlech (lam tron len).
        const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
        // Qua han.
        if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, overdue: true };
        // Dung han hom nay.
        if (diff === 0) return { text: "Today", overdue: false };
        // Han vao ngay mai.
        if (diff === 1) return { text: "Tomorrow", overdue: false };
        // Con lai X ngay.
        return { text: `${diff}d left`, overdue: false };
    }

    // Lay trang thai truoc do trong workflow de nut "move prev".
    get prevStatus() {
        // Neu khong truyen statusList thi dung mang rong.
        const list = this.props.statusList || [];
        // Tim vi tri status hien tai trong list.
        const idx = list.findIndex((s) => s.id === this.props.task.status);
        // Neu co status truoc do thi tra ve id, neu khong thi null.
        return idx > 0 ? list[idx - 1].id : null;
    }

    // Lay trang thai tiep theo trong workflow de nut "move next".
    get nextStatus() {
        // Neu khong truyen statusList thi dung mang rong.
        const list = this.props.statusList || [];
        // Tim vi tri status hien tai trong list.
        const idx = list.findIndex((s) => s.id === this.props.task.status);
        // Neu co status ke tiep thi tra ve id, neu khong thi null.
        return idx >= 0 && idx < list.length - 1 ? list[idx + 1].id : null;
    }

    // Lay label cua status tu statusConfig.
    getStatusLabel(status) {
        // Neu config co label thi dung label, neu khong fallback chinh ma status.
        return this.props.statusConfig[status]?.label || status;
    }

    // Click nut Edit.
    onClickEdit(ev) {
        // Chan su kien noi bot len parent card.
        ev.stopPropagation();
        // Goi callback edit va truyen task hien tai.
        this.props.onEdit(this.props.task);
    }

    // Ho tro keyboard accessibility tren card (Enter/Space de mo edit).
    onCardKeyDown(ev) {
        // Neu bam Enter hoac Space.
        if (ev.key === "Enter" || ev.key === " ") {
            // Chan hanh vi mac dinh (vd: scroll khi bam Space).
            ev.preventDefault();
            // Mo form/chuc nang edit task.
            this.props.onEdit(this.props.task);
        }
    }

    // Click nut Delete.
    onClickDelete(ev) {
        // Chan su kien noi bot.
        ev.stopPropagation();
        // Goi callback xoa theo task id.
        this.props.onDelete(this.props.task.id);
    }

    // Move task ve status truoc.
    onMovePrev(ev) {
        // Chan su kien noi bot.
        ev.stopPropagation();
        // Chi doi status khi ton tai prevStatus hop le.
        if (this.prevStatus) {
            // Goi callback doi status (taskId, statusMoi).
            this.props.onStatusChange(this.props.task.id, this.prevStatus);
        }
    }

    // Move task sang status tiep theo.
    onMoveNext(ev) {
        // Chan su kien noi bot.
        ev.stopPropagation();
        // Chi doi status khi ton tai nextStatus hop le.
        if (this.nextStatus) {
            // Goi callback doi status (taskId, statusMoi).
            this.props.onStatusChange(this.props.task.id, this.nextStatus);
        }
    }
}

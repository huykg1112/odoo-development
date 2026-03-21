/** @odoo-module **/

import { Component, useState, useRef} from "@odoo/owl";
import { useAutofocus } from "@web/core/utils/hooks";

export class Playground extends Component {
    static template = "awesome_owl.playground";

    setup() {
        this.inputRef = useAutofocus();

        this.state = useState({
            // Danh sách công việc
            tasks: [
                { id: 1, text: "Học Owl Component" },
                { id: 2, text: "Viết Hướng Dẫn code" },
                { id: 3, text: "Đăng bài hướng dẫn lên blog" },
            ],
            nextId: 4, 
            newText: "", // Dữ liệu cho ô input Thêm mới

            // Trạng thái cho Dialog sửa
            showEditDialog: false,
            editId: null,
            editText: "",

            // Trạng thái hiển thị Thông báo (Notification Toast)
            notificationText: "",
            notificationType: "success", // "success" hoặc "error"
        });
    }

    // Hàm gọi thông báo Toast
    showNotification(msg, type = "success") {
        this.state.notificationText = msg;
        this.state.notificationType = type;
        
        // Tự động ẩn sau 3 giây
        setTimeout(() => {
            this.state.notificationText = "";
        }, 3000);
    }

    // Hàm THÊM task
    addTask() {
        // Dùng giá trị từ state thay vì useRef để an toàn hơn
        const text = this.inputRef.el.value.trim();
        if (text) {
            this.state.tasks.push({ id: this.state.nextId++, text: text });
            this.inputRef.el.value = ""; // Xóa trắng ô input
            this.showNotification("Thêm công việc thành công!", "success");
        } else {
            this.showNotification("Vui lòng không để trống công việc!", "error");
        }
    }

    // Hàm XÓA task
    removeTask(taskId) {
        this.state.tasks = this.state.tasks.filter((task) => task.id !== taskId);
        this.showNotification("Đã xóa công việc!", "success");
    }

    // Mở Modal (Dialog) SỬA
    openEditDialog(task) {
        this.state.editId = task.id;
        this.state.editText = task.text;
        this.state.showEditDialog = true;
    }

    // Đóng Modal (Dialog)
    closeEditDialog() {
        this.state.showEditDialog = false;
        this.state.editId = null;
    }

    // LƯU task sau khi sửa
    saveTask() {
        const text = this.state.editText.trim();
        if (text) {
            this.state.tasks = this.state.tasks.map((task) =>
                task.id === this.state.editId ? { ...task, text: text } : task
            );
            this.closeEditDialog();
            this.showNotification("Đã cập nhật công việc!", "success");
        } else {
            this.showNotification("Công việc không được để trống!", "error");
        }
    }
}

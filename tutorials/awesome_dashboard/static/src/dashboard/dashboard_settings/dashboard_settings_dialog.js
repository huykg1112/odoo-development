/** @odoo-module **/
import { Component, useState } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import { registry } from "@web/core/registry";

export class DashboardSettingsDialog extends Dialog {
    static template = "awesome_dashboard.DashboardSettingsDialog";
    static components = { Dialog };
    static props = {
        currentItems: Array,
        close: Function,
        onApply: Function,
    };

    setup() {
        const allItems = registry.category("awesome_dashboard").getAll(); // Lấy tất cả các item có thể chọn từ registry

        this.state = useState({ // Tạo một object để theo dõi trạng thái checked của từng item, dựa trên currentItems
            checked: Object.fromEntries( // Tạo một object có key là id của item và value là true/false tùy thuộc vào việc item đó có trong currentItems hay không
                allItems.map((item) => [item.id, this.props.currentItems.some((i) => i.id === item.id)]) // Duyệt qua tất cả các item và kiểm tra xem chúng có trong currentItems hay không để thiết lập giá trị checked ban đầu
            ) 
        });
        this.allItems = allItems; // Lưu lại tất cả các item để sử dụng khi render
    }

    onApply() {
        const removeIds = this.allItems
            .filter((item) => !this.state.checked[item.id]) // Lọc ra những item mà người dùng đã bỏ chọn (checked = false)
            .map((item) => item.id);
        this.props.onApply(removeIds); // Gọi hàm onApply với danh sách id của những item bị bỏ chọn để cập nhật dashboard
        this.props.close(); // Đóng dialog sau khi áp dụng thay đổi
    }
}

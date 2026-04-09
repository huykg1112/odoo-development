/** @odoo-module **/

import { Component,useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
// import { useService } from "@web/core/utils/hooks"; // Hook để sử dụng các service đã được đăng ký trong Odoo, giúp truy cập và tương tác với các chức năng chung như action, orm, rpc,... một cách dễ dàng và hiệu quả hơn trong OWL.
import { useClicker } from "./clicker_systray/clicker_service"; // Custom hook để sử dụng clicker service một cách tiện lợi hơn trong component này, giúp truy cập vào state và hàm onclick của clicker service mà không cần phải gọi useService và useState riêng biệt mỗi lần.
import { ClickValue } from "./clicker_systray/click_value/click_value";
import { Notebook } from "@web/core/notebook/notebook"; // Component Notebook của Odoo được sử dụng để tạo ra một giao diện có dạng tab, giúp tổ chức và hiển thị nội dung theo từng tab một cách rõ ràng và dễ dàng cho người dùng khi tương tác với client action này trong Odoo.

export class ClickerClientAction extends Component {
    static template = "awesome_clicker.ClickerClientAction";
    static components = { ClickValue, Notebook }; // Đăng ký component con ClickValue để có thể sử dụng trong template của client action này
    static props = ["*"];  // Client action nhận nhiều props từ framework

    setup() {
        // this.clicker = useService("awesome_clicker.clicker"); // Sử dụng service clicker để có thể truy cập vào state và hàm onclick đã được định nghĩa trong clicker_service.js, giúp quản lý số lượng click một cách tập trung và dễ dàng hơn.
        // console.log("ClickerClientAction setup, clicker:", this.clicker);
        // this.state = useState(this.clicker.state); // Tạo một state local trong component này, khởi tạo với state từ clicker service, giúp đồng bộ hóa số lượng click giữa các component sử dụng cùng service này.
        this.clicker = useClicker();
        this.state = useState(this.clicker); // Lấy proxy reactive để template tự cập nhật
    }
}

// Đăng ký vào action registry
registry.category("actions").add("awesome_clicker.client_action", ClickerClientAction);
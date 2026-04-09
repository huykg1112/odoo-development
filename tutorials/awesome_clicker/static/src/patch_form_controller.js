/** @odoo-module **/

import { FormController } from "@web/views/form/form_controller"; // FormController là controller mặc định của Odoo được sử dụng để quản lý logic và hành vi của các form view trong hệ thống, giúp xử lý các sự kiện, tương tác với dữ liệu và điều khiển giao diện người dùng của form một cách hiệu quả.
import { patch } from "@web/core/utils/patch"; // Hàm patch được sử dụng để mở rộng hoặc thay đổi hành vi của một class hoặc component đã tồn tại trong Odoo mà không cần phải sửa đổi mã gốc của nó, giúp duy trì tính ổn định và khả năng bảo trì của hệ thống khi muốn thêm các tính năng tùy chỉnh.
import { useService } from "@web/core/utils/hooks";

patch(FormController.prototype, { // Sử dụng patch để mở rộng hành vi của FormController, giúp thêm một cơ chế ngẫu nhiên để phát hiện và trao thưởng cho người dùng khi họ mở một form view, tạo ra một trải nghiệm thú vị và bất ngờ cho người dùng khi tương tác với các form trong Odoo.
    setup() {
        super.setup(...arguments); // Gọi hàm setup của FormController gốc để đảm bảo rằng tất cả các thiết lập và logic mặc định của FormController vẫn được thực hiện đúng cách, giúp duy trì tính ổn định và chức năng cơ bản của form view trong Odoo khi chúng ta thêm các tính năng tùy chỉnh vào controller này.

        // 50% chance khi mở form view
        if (Math.random() < 0.5) {
            const clicker = useService("awesome_clicker.clicker");
            const notificationService = useService("notification");
            console.log("notificationService", notificationService);
            const actionService = useService("action");
            console.log("actionService", actionService);

            const reward = clicker.claimReward();
            if (reward) {
                notificationService.add(
                    `🎉 Reward found: ${reward.description}`,
                    {
                        type: "success",
                        sticky: true,     // Không tự biến mất
                        buttons: [
                            {
                                name: "Collect!",
                                primary: true,
                                onClick: () => {
                                    actionService.doAction({ // Khi người dùng nhấn nút "Collect!", điều hướng đến client action của clicker game để họ có thể sử dụng phần thưởng vừa nhận được.        
                                        type: "ir.actions.client",
                                        tag: "awesome_clicker.client_action",
                                        target: "new",
                                        name: "Clicker Game",
                                    });
                                },
                            },
                        ],
                    }
                );
            }
        }
    },
});
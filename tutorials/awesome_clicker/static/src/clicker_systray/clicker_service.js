/** @odoo-module **/

import { reactive, useState } from "@odoo/owl"; //
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

const clickerService = {
    start() {
        const state = reactive({ count: 0 }); // Sử dụng reactive để tạo một state phản ứng, giúp tự động cập nhật giao diện khi giá trị count thay đổi, và cho phép chia sẻ state này giữa nhiều component khác nhau trong ứng dụng một cách dễ dàng và hiệu quả hơn trong OWL.

        function onclick(amount) {
            state.count += amount;
        }

        return { state, onclick };
    },
};

registry.category("services").add("awesome_clicker.clicker", clickerService);


/**
 * Custom hook — thay vì gọi useService + useState mỗi lần
 * @returns {Object} clicker (bao gồm state reactive + increment function)
 */
export function useClicker() {
    const clicker = useService("awesome_clicker.clicker");
    // useState ở đây để component tự re-render khi state thay đổi
    useState(clicker.state);
    return clicker;
}
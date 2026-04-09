/** @odoo-module **/

import { reactive, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { ClickerModel } from "./clicker_model";

const clickerService = {
    // start() {
    //     const state = reactive({
    //         count: 0,
    //         level: 0,
    //         clickBots: 0,
    //     }); // Sử dụng reactive để tạo một state phản ứng, giúp tự động cập nhật giao diện khi giá trị count thay đổi, và cho phép chia sẻ state này giữa nhiều component khác nhau trong ứng dụng một cách dễ dàng và hiệu quả hơn trong OWL.

    //     function onclick(amount) {
    //         state.count += amount;
    //         if (state.count >= 1000 && state.level < 1) {
    //             state.level = 1;
    //         }
    //     }
    //     function buyClickBot() {
    //         if (state.count >= 1000) {
    //             state.count -= 1000;
    //             state.clickBots += 1;
    //         }
    //     }

    //     setInterval(() => { // Sử dụng setInterval để tạo một timer chạy mỗi giây, giúp tự động tăng số lượng click dựa trên số lượng click bot mà người chơi đã mua, tạo ra một cơ chế tích lũy click thụ động trong trò chơi.
    //         if (state.clickBots > 0) {
    //             state.count += 10 * state.clickBots;
    //             // Check level up sau khi bots thêm clicks
    //             if (state.count >= 1000 && state.level < 1) {
    //                 state.level = 1;
    //             }
    //         }
    //     }, 1000);

    //     return { state, onclick, buyClickBot };
    // },
    dependencies: ["effect"],
    start(env, { effect }) { // start là hàm được gọi khi service được khởi tạo, nó trả về một đối tượng chứa state và các hàm để tương tác với state đó, giúp quản lý logic của trò chơi clicker một cách tập trung và dễ dàng hơn trong OWL.
        const clicker = reactive(new ClickerModel());

        clicker.bus.addEventListener("MILESTONE_1k", () => {
            effect.add({
                type: "rainbow_man",
                message: "🎉 Milestone reached! You can now buy ClickBots!",
            });
        });

        clicker.bus.addEventListener("MILESTONE_5k", () => {
            effect.add({
                type: "rainbow_man",
                message: "🎉 Milestone reached! You can now buy BigBots!",
            });
        });

        clicker.bus.addEventListener("MILESTONE_50k", () => {
            effect.add({
                type: "rainbow_man",
                message: "🎉 Milestone reached! You can now buy Power Upgrades!",
            });
        });

        clicker.bus.addEventListener("MILESTONE_100k", () => {
            effect.add({
                type: "rainbow_man",
                message: "🎉 Milestone reached! You can now buy Trees!",
            });
        });

        registry.category("command_providers").add("awesome_clicker", {
            provide: (env, options) => [ // Đăng ký các lệnh tùy chỉnh cho CommandPalette, giúp người dùng có thể nhanh chóng thực hiện các hành động liên quan đến clicker game thông qua giao diện tìm kiếm lệnh của Odoo, tạo ra một trải nghiệm tương tác tiện lợi và thú vị hơn.
                {
                    name: "Open Clicker Game",
                    action: () => {
                        env.services.action.doAction({
                            type: "ir.actions.client",
                            tag: "awesome_clicker.client_action",
                            target: "new",
                            name: "Clicker Game",
                        });
                    },
                },
                {
                    name: "Buy 1 ClickBot",
                    action: () => {
                        clicker.buyClickBot();
                    },
                },
            ],
        })

        return clicker;
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
    useState(clicker);
    return clicker;
}
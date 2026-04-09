/** @odoo-module **/

import { Component, useState, useExternalListener, useRef } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
// import { useExternalListener } from "@web/core/utils/hooks"; // Hook để lắng nghe sự kiện bên ngoài component, giúp tương tác với DOM hoặc các sự kiện toàn cục một cách dễ dàng và hiệu quả hơn trong OWL.

export class ClickerSystrayItem extends Component {
  static template = "awesome_clicker.ClickerSystrayItem";

  setup() {
    this.containerRef = useRef("container");
    this.clicker = useService("awesome_clicker.clicker"); // Sử dụng service clicker để có thể truy cập vào state và hàm onclick đã được định nghĩa trong clicker_service.js, giúp quản lý số lượng click một cách tập trung và dễ dàng hơn.
    this.state = useState(this.clicker.state); // Tạo một state local trong component này, khởi tạo với state từ clicker service, giúp đồng bộ hóa số lượng click giữa các component sử dụng cùng service này.
    this.actionService = useService("action"); // Sử dụng service action để có thể gọi các action khác trong Odoo, ví dụ như điều hướng đến một view hoặc mở một dialog khi người dùng tương tác với item này.
    // Sử dụng useExternalListener để lắng nghe sự kiện "click" trên document.body, và gọi hàm onExternalClick khi sự kiện xảy ra.
    // Không dùng capture: true vì nó sẽ gọi onExternalClick trước onClick, làm tăng count lên 11 thay vì 10.
    // Trong bubble phase, stopPropagation() sẽ ngăn chặn sự kiện lan truyền hiệu quả.
    useExternalListener(document.body, "click", this.onExternalClick);

    this.action = useService("action"); // Sử dụng service action để có thể gọi các action khác trong Odoo, ví dụ như điều hướng đến một view hoặc mở một dialog khi người dùng tương tác với item này.
  }
  onExternalClick(ev) {
    // Chỉ gọi onclick(1) nếu click xảy ra **ngoài** container của systray item
    // Điều này tránh việc systray item nghe được click events từ modal dialog (ví dụ: ClickerClientAction)
    if (!this.containerRef.el.contains(ev.target)) {
      this.clicker.onclick(1);
    }
  }

  onClick(ev) {
    ev.stopPropagation(); // Ngăn chặn sự kiện click lan truyền lên document.body, để tránh việc onExternalClick được gọi khi người dùng click vào chính item này.
    this.clicker.onclick(10);
  }

  openClientAction() {
    this.action.doAction({
      type: "ir.actions.client", // Client action thay vì act_window
      tag: "awesome_clicker.client_action", // Tag của client action đã được đăng ký
      target: "new", // Mở dạng dialog (không full screen)
      name: "Clicker Game",
    });
  }
}

registry.category("systray").add("awesome_clicker.ClickerSystrayItem", {
  Component: ClickerSystrayItem,
});

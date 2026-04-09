/** @odoo-module **/

import { Component, useState, useExternalListener } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
// import { useExternalListener } from "@web/core/utils/hooks"; // Hook để lắng nghe sự kiện bên ngoài component, giúp tương tác với DOM hoặc các sự kiện toàn cục một cách dễ dàng và hiệu quả hơn trong OWL.

export class ClickerSystrayItem extends Component {
  static template = "awesome_clicker.ClickerSystrayItem";

  setup() {
    this.clicker = useService("awesome_clicker.clicker"); // Sử dụng service clicker để có thể truy cập vào state và hàm onclick đã được định nghĩa trong clicker_service.js, giúp quản lý số lượng click một cách tập trung và dễ dàng hơn.
    this.state = useState(this.clicker.state); // Tạo một state local trong component này, khởi tạo với state từ clicker service, giúp đồng bộ hóa số lượng click giữa các component sử dụng cùng service này.
    this.actionService = useService("action"); // Sử dụng service action để có thể gọi các action khác trong Odoo, ví dụ như điều hướng đến một view hoặc mở một dialog khi người dùng tương tác với item này.
    // Sử dụng useExternalListener để lắng nghe sự kiện "click" trên document.body, và gọi hàm onExternalClick khi sự kiện xảy ra. Tham số {capture: true} giúp đảm bảo rằng sự kiện được bắt ở giai đoạn capture, trước khi nó được xử lý bởi các listener khác.
    //  giai đoạn capture là giai đoạn mà sự kiện được truyền từ document xuống đến target element, ngược lại với giai đoạn bubble (sự kiện được truyền từ target element lên document). Việc sử dụng capture có thể giúp đảm bảo rằng listener của bạn được gọi trước các listener khác, đặc biệt là khi bạn muốn can thiệp hoặc ngăn chặn sự kiện trước khi nó được xử lý bởi các phần tử khác trong DOM.
    useExternalListener(document.body, "click", this.onExternalClick, {
      capture: true,
    });

    this.action = useService("action"); // Sử dụng service action để có thể gọi các action khác trong Odoo, ví dụ như điều hướng đến một view hoặc mở một dialog khi người dùng tương tác với item này.
  }
  onExternalClick() {
    this.clicker.onclick(1); // Gọi hàm onclick của clicker service với tham số 1, giúp tăng số lượng click lên 1 mỗi khi có sự kiện click xảy ra trên document.body, trừ khi sự kiện đó bị ngăn chặn bởi onClick của chính item này.
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

/** @odoo-module **/

import { Component, useSubEnv, useState, onWillStart } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Layout } from "@web/search/layout"; // là component Layout được cung cấp bởi Odoo để tạo bố cục cho các trang, có thể tùy chỉnh để phù hợp với giao diện dashboard của bạn.
import { useService } from "@web/core/utils/hooks"; // là hook để sử dụng các service của Odoo trong component OWL, giúp truy cập vào các chức năng như ORM, action, rpc, ... một cách dễ dàng và tiện lợi.
import { DashboardItem } from "./dashboard_item/dashboard_item";
import { PieChart } from "./pie_chart/pie_chart";

class AwesomeDashboard extends Component {
  static template = "awesome_dashboard.AwesomeDashboard"; // dùng để render template XML/QWeb tương ứng
  static components = { Layout, DashboardItem, PieChart}; // đăng ký các component con sẽ sử dụng trong template

  setup() {
    // hàm setup để khởi tạo state, services, hooks, ... nếu cần
    useSubEnv({ // tạo một sub-environment riêng cho component này, có thể dùng để truyền các giá trị hoặc cấu hình đặc biệt mà không ảnh hưởng đến phần còn lại của ứng dụng
        config: {
            ...this.env.config,
            noBreadcrumbs: true,
        }
    });

    this.action = useService("action"); // ví dụ sử dụng service action để điều hướng hoặc gọi các action khác
    
    this.statisticsService = useService("awesome_dashboard.statistics");
    this.statistics = useState(this.statisticsService.statistics); // Khôi phục lại dòng này để lưu trữ dữ liệu State!

    // onWillStart(async () => {
    //     const data = await this.statisticsService.loadStatistics(); // Sửa lại chữ locad -> load
    //     Object.assign(this.statistics, data);
    // });

}

  // Khai báo Getter để tính tổng ngay trong Javascript
  get totalSize() {
      // Nếu dữ liệu chưa tải xong, trả về 0
      if (!this.statistics || !this.statistics.orders_by_size) {
          return 0;
      }
      // Cộng tổng tất cả giá trị value trong object orders_by_size lại với nhau
      return Object.values(this.statistics.orders_by_size).reduce((sum, val) => sum + val, 0);
  }

  openCustomers() {
    // ví dụ một phương thức để mở action liên quan đến khách hàng, có thể gọi khi người dùng click vào một phần tử trong dashboard
    this.action.doAction("contacts.action_contacts"); // gọi action có XML ID là contacts.action_contacts để mở danh sách khách hàng
  }

  openLeads() {
    // ví dụ một phương thức để mở action liên quan đến leads, có thể gọi khi người dùng click vào một phần tử trong dashboard
    this.action.doAction({
      type: "ir.actions.act_window", // loại action là mở cửa sổ
      name: "Leads", // tên hiển thị của action
      res_model: "crm.lead", // model mà action sẽ hiển thị, ở đây là crm.lead để hiển thị danh sách leads
      views: [
        [false, "list"],
        [false, "form"], // định nghĩa các view sẽ hiển thị khi mở action, ở đây là list view và form view của model crm.lead
      ], // định nghĩa các view sẽ hiển thị khi mở action, ở đây là list view và form view của model crm.lead
    });
  }
}

registry
  .category("lazy_components")
  .add("awesome_dashboard.AwesomeDashboard", AwesomeDashboard);

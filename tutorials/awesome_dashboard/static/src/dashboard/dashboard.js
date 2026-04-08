/** @odoo-module **/

import { Component, useSubEnv, useState, onWillStart } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Layout } from "@web/search/layout"; // là component Layout được cung cấp bởi Odoo để tạo bố cục cho các trang, có thể tùy chỉnh để phù hợp với giao diện dashboard của bạn.
import { useService } from "@web/core/utils/hooks"; // là hook để sử dụng các service của Odoo trong component OWL, giúp truy cập vào các chức năng như ORM, action, rpc, ... một cách dễ dàng và tiện lợi.
import { DashboardItem } from "./dashboard_item/dashboard_item";
import { PieChart } from "./pie_chart/pie_chart";
import { DashboardSettingsDialog } from "./dashboard_settings/dashboard_settings_dialog";
import "../dashboard/dashboard_service";
import "../dashboard/dashboard_item/dashboard_item";
const STORAGE_KEY = "awesome_dashboard.removed_items";


class AwesomeDashboard extends Component {
  static template = "awesome_dashboard.AwesomeDashboard"; // dùng để render template XML/QWeb tương ứng
  static components = { Layout, DashboardItem, PieChart, DashboardSettingsDialog}; // đăng ký các component con sẽ sử dụng trong template

  setup() {
    // hàm setup để khởi tạo state, services, hooks, ... nếu cần
    useSubEnv({ // tạo một sub-environment riêng cho component này, có thể dùng để truyền các giá trị hoặc cấu hình đặc biệt mà không ảnh hưởng đến phần còn lại của ứng dụng
        config: {
            ...this.env.config,
            noBreadcrumbs: true,
        }
    });

    // this.items = registry.category("awesome_dashboard").getAll();

    this.action = useService("action"); // ví dụ sử dụng service action để điều hướng hoặc gọi các action khác
    this.dialog = useService("dialog"); // ví dụ sử dụng service dialog để mở các dialog tùy chỉnh như DashboardSettingsDialog

    this.statisticsService = useService("awesome_dashboard.statistics");
    this.statistics = useState(this.statisticsService.statistics); // Khôi phục lại dòng này để lưu trữ dữ liệu State!

    // onWillStart(async () => {
    //     const data = await this.statisticsService.loadStatistics(); // Sửa lại chữ locad -> load
    //     Object.assign(this.statistics, data);
    // });
    const stored = localStorage.getItem(STORAGE_KEY);
    const removedIds = stored ? JSON.parse(stored) : []; // Lấy danh sách ID của các item đã bị ẩn từ localStorage, nếu có
    this.state = useState({ removedIds }); // Tạo một state để theo dõi các item đã bị ẩn, khởi tạo với danh sách ID đã lấy được từ localStorage
  }

  get items() {
        const allItems = registry.category("awesome_dashboard").getAll();
        return allItems.filter(item => !this.state.removedIds.includes(item.id));
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

  openSettings() {
        this.dialog.add(DashboardSettingsDialog, {
            currentItems: this.items,
            onApply: (removedIds) => {
                this.state.removedIds = removedIds;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(removedIds));
            },
        });
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

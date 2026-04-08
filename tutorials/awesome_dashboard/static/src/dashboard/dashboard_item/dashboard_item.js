/** @odoo-module **/
import { Component } from "@odoo/owl";
import { PieChartCard } from "../pie_chart/pie_chart_card.js";
import { NumberCard } from "../number_card/number_card.js";
import { registry } from "@web/core/registry";


const dashboardRegistry = registry.category("awesome_dashboard");

dashboardRegistry.add("nb_new_orders", {
    id: "new_orders",
    description: "New Orders This Month",
    Component: NumberCard,
    props: (data) => ({
        title: "New Orders This Month",
        value: data.nb_new_orders,
    }),
});

dashboardRegistry.add("total_amount", {
    id: "total_amount",
    description: "Total Amount of New Orders",
    Component: NumberCard,
    props: (data) => ({
        title: "Total Amount of New Orders",
        value: data.total_amount,
    }),
});

dashboardRegistry.add("average_quantity", {
    id: "average_quantity",
    description: "Average T-Shirt per Order",
    Component: NumberCard,
    props: (data) => ({
        title: "Average T-Shirt per Order",
        value: data.average_quantity,
    }),
});

dashboardRegistry.add("nb_cancelled_orders", {
    id: "nb_cancelled_orders",
    description: "Cancelled Orders This Month",
    Component: NumberCard,
    props: (data) => ({
        title: "Cancelled Orders This Month",
        value: data.nb_cancelled_orders,
    }),
});

dashboardRegistry.add("average_time", {
    id: "average_time",
    description: "Average Processing Time",
    Component: NumberCard,
    props: (data) => ({
        title: "Average Processing Time",
        value: data.average_time,
    }),
});

dashboardRegistry.add("orders_by_size", {
    id: "orders_by_size",
    description: "T-Shirts by Size",
    Component: PieChartCard,
    size: 1,
    props: (data) => ({
        data: data.orders_by_size,
    }),
});


// export const items =[
//   {
//         id: "nb_new_orders",
//         description: "New Orders This Month",
//         Component: NumberCard,
//         props: (data) => ({
//             title: "New Orders This Month",
//             value: data.nb_new_orders,
//         }),
//     },
//     {
//         id: "total_amount",
//         description: "Total Amount of New Orders",
//         Component: NumberCard,
//         props: (data) => ({
//             title: "Total Amount of New Orders",
//             value: data.total_amount,
//         }),
//     },
//     {
//         id: "average_quantity",
//         description: "Average T-Shirt per Order",
//         Component: NumberCard,
//         props: (data) => ({
//             title: "Average T-Shirt per Order",
//             value: data.average_quantity,
//         }),
//     },
//     {
//         id: "nb_cancelled_orders",
//         description: "Cancelled Orders This Month",
//         Component: NumberCard,
//         props: (data) => ({
//             title: "Cancelled Orders This Month",
//             value: data.nb_cancelled_orders,
//         }),
//     },
//     {
//         id: "average_time",
//         description: "Average Processing Time",
//         Component: NumberCard,
//         props: (data) => ({
//             title: "Average Processing Time",
//             value: data.average_time,
//         }),
//     },
//     {
//         id: "orders_by_size",
//         description: "T-Shirts by Size",
//         Component: PieChartCard,
//         size: 2,
//         props: (data) => ({
//             data: data.orders_by_size,
//         }),
//     },
// ]

export class DashboardItem extends Component {
  static template = "awesome_dashboard.DashboardItem"; // template XML/QWeb tương ứng để render component này
  static props = { // định nghĩa các props mà component này nhận vào
    size: { type: Number, optional: true },
    width: { type: String, optional: true }, // Thêm prop width để nhập tùy chỉnh (vd: '30%', '500px')
    slots: Object, // slots cho nội dung
    // title: { type: String },
    // count: { type: Number },
    // icon: { type: String, optional: true },
    // onClick: { type: Function, optional: true },
  };
  static defaultProps = { // giá trị mặc định cho props
    size: 1,
  };

  get itemStyle() { 
    // Ưu tiên dùng width nếu bạn có truyền (VD: width="'50%'")
    if (this.props.width) {
        return `width: ${this.props.width};`;
    }
    // Nếu không truyền width, tính dựa theo size mặc định (ví dụ hệ số 200px)
    return `width: ${this.props.size * 200}px; flex-grow: ${this.props.size};`;
  }
}

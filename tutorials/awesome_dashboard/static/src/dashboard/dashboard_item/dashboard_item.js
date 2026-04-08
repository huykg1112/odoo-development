import { Component } from "@odoo/owl";

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

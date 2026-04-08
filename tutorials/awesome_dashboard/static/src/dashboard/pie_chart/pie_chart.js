/** @odoo-module **/
import { Component, onMounted, onWillStart, useRef, onPatched } from "@odoo/owl";
import { loadJS } from "@web/core/assets";

export class PieChart extends Component {
  static template = "awesome_dashboard.PieChart";
  static props = {
    data: Object,
  };

  setup() {
    this.canvasRef = useRef("canvas"); // Tham chiếu đến phần tử canvas trong template
    this.chart = null; // Khởi tạo biến lưu trữ biểu đồ để xóa khi vẽ lại

    onWillStart(async () => { // Tải thư viện Chart.js trước khi component bắt đầu khởi tạo
      await loadJS("/web/static/lib/Chart/Chart.js");
    });

    onMounted(() => { // Sau khi component được gắn vào DOM, gọi hàm để vẽ biểu đồ
      this._renderChart();
    });

    onPatched(() => { // Mỗi khi nhận dữ liệu mới và component update giao diện, vẽ lại biểu đồ
      this._renderChart();
    });
  }

  _renderChart() { // Hàm để vẽ biểu đồ tròn sử dụng Chart.js
    if (this.chart) {
      this.chart.destroy(); // Hủy biểu đồ cũ trước khi vẽ lại để tránh dữ liệu bị chồng chéo
    }

    const data = this.props.data; // Dữ liệu được truyền vào từ props, có thể là một đối tượng với các nhãn và giá trị tương ứng
    const labels = Object.keys(data); 
    const values = Object.values(data);

    this.chart = new Chart(this.canvasRef.el, { // Tạo một biểu đồ mới trên phần tử canvas được tham chiếu
      type: "pie", // Loại biểu đồ là pie (biểu đồ tròn) hoặc bạn có thể thay đổi thành "doughnut" nếu muốn biểu đồ có lỗ ở giữa
      data: { // Dữ liệu cho biểu đồ, bao gồm các nhãn và giá trị tương ứng
        labels: labels, // Các nhãn sẽ hiển thị trên biểu đồ, thường là tên của các phần tử trong biểu đồ
        datasets: [ // Một mảng các dataset, mỗi dataset có thể đại diện cho một tập hợp dữ liệu khác nhau trên cùng một biểu đồ
          {
            data: values,
            backgroundColor: [ // Màu sắc cho mỗi phần của biểu đồ, bạn có thể tùy chỉnh hoặc tạo động dựa trên số lượng phần tử        
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
            ],
          },
        ],
      },
      options: { // Các tùy chọn để cấu hình biểu đồ, như tiêu đề, độ phản hồi, v.v.
        responsive: true,
        title: {
          display: true,
          text: "T-Shirts by Size",
        },
      },
    });
  }
}


import { registry } from "@web/core/registry";
import { rpc } from "@web/core/network/rpc";
// import { memoize } from "@web/core/utils/functions";
import { reactive } from "@odoo/owl";

const RELOAD_INTERVAL = 5 * 60 * 1000; // 5 phút (dùng 10000ms = 10s để test)

const statisticsService = { // Đây là một service đơn giản để lấy dữ liệu thống kê cho dashboard, có thể được sử dụng bởi nhiều component khác nhau trong dashboard.
    dependencies: [], // Nếu service này phụ thuộc vào các service khác, bạn có thể liệt kê chúng ở đây.

    start(evn){ // Hàm khởi động của service, có thể dùng để thiết lập các giá trị ban đầu hoặc thực hiện các hành động khi service được khởi tạo.
        
        const state = reactive({ isLoaded: false });
        // const loadStatistics = memoize(async () => { // Sử dụng memoize để cache kết quả của hàm loadStatistics, giúp tránh việc gọi lại RPC nếu dữ liệu đã được tải trước đó.
        //     return await rpc("/awesome_dashboard/statistics");
        // });
        // return { loadStatistics };

        async function loadData() {
            const data = await rpc("/awesome_dashboard/statistics");
            // Cập nhật in-place để reactive hoạt động
            Object.assign(state, data, { isLoaded: true });
        }
        // Load lần đầu
        loadData();
        // Reload định kỳ
        setInterval(loadData, RELOAD_INTERVAL);

            return { statistics: state, loadStatistics: loadData };

    }
}

registry.category("services").add("awesome_dashboard.statistics", statisticsService); // Đăng ký service vào registry của Odoo, với tên "awesome_dashboard.statistics" để có thể sử dụng trong các component khác thông qua useService("awesome_dashboard.statistics").
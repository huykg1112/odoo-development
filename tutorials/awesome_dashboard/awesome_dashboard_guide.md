# Chapter 2: Build a Dashboard — Hướng Dẫn Chi Tiết

> **Module:** `f:\BMS\Odoo\tutorials\awesome_dashboard`  
> **Tutorial gốc:** https://www.odoo.com/documentation/18.0/developer/tutorials/discover_js_framework/02_build_a_dashboard.html

---

## Tổng Quan

Bạn sẽ xây dựng một dashboard hoàn chỉnh từ module `awesome_dashboard` đã có sẵn. Module này hiện chỉ có một component đơn giản hiển thị chữ "hello dashboard". Qua 12 bài tập, bạn sẽ học:

- Dùng `Layout` component của Odoo
- Sử dụng **Services** (action service, rpc, notification...)  
- Gọi API server và hiển thị thống kê
- Tạo Chart.js (pie chart)
- Lazy loading assets
- Tạo dashboard extensible/generic

### Cấu Trúc Module Hiện Tại

```
awesome_dashboard/
├── __init__.py
├── __manifest__.py
├── controllers/          # (có sẵn, chứa route /statistics)
├── static/
│   └── src/
│       ├── dashboard.js  # Component chính
│       └── dashboard.xml # Template
└── views/
    └── views.xml         # Action + Menu
```

---

## Bài 1: A new Layout (Thêm Layout Component)

### Mục tiêu
Tích hợp `Layout` component của Odoo để dashboard có control panel ở trên và content ở dưới.

### Lý thuyết
`Layout` component từ `@web/search/layout` cung cấp bố cục chuẩn của Odoo:
- **Control panel** ở trên (chứa buttons, breadcrumb)
- **Content area** ở dưới

### Các file cần sửa/tạo

#### [MODIFY] `static/src/dashboard.js`

```javascript
/** @odoo-module **/

import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Layout } from "@web/search/layout";

class AwesomeDashboard extends Component {
    static template = "awesome_dashboard.AwesomeDashboard";
    static components = { Layout };
}

registry.category("actions").add("awesome_dashboard.dashboard", AwesomeDashboard);
```

#### [MODIFY] `static/src/dashboard.xml`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<templates xml:space="preserve">

    <t t-name="awesome_dashboard.AwesomeDashboard">
        <Layout display="{controlPanel: {}}" className="'o_dashboard h-100'">
            <t t-set-slot="layout-buttons">
                <!-- Buttons sẽ thêm ở bài 2 -->
            </t>
            <!-- Content dashboard -->
            <div class="o_dashboard_content d-flex flex-wrap gap-3 p-3">
                Hello from dashboard!
            </div>
        </Layout>
    </t>

</templates>
```

#### [NEW] `static/src/dashboard.scss`

```scss
.o_dashboard {
    background-color: #f0f0f0; // hoặc màu bạn thích
}
```

### Kiểm tra
Mở `http://localhost:8069/web`, vào **Awesome Dashboard** app. Bạn sẽ thấy control panel xuất hiện và background màu gray.

---

## Theory: Services

> [!NOTE]
> **Services** là các đoạn code persistent (không bị destroy khi component destroy). Chúng export state/functions mà component có thể sử dụng.

**Ví dụ service đơn giản:**
```javascript
import { registry } from "@web/core/registry";

const myService = {
    dependencies: ["notification"],
    start(env, { notification }) {
        let counter = 1;
        setInterval(() => {
            notification.add(`Tick Tock ${counter++}`);
        }, 5000);
    },
};

registry.category("services").add("myService", myService);
```

**Sử dụng service trong component:**
```javascript
import { useService } from "@web/core/utils/hooks";

setup() {
    this.sharedState = useService("shared_state");
}
```

---

## Bài 2: Add Buttons for Quick Navigation

### Mục tiêu
Thêm 2 button vào control panel:
- **Customers**: mở kanban view của tất cả customers
- **Leads**: mở list view của `crm.lead`

### Lý thuyết
Dùng **action service** để mở các Odoo action:
```javascript
this.action.doAction("xml_id_of_action"); // dùng xml id
this.action.doAction({ type: "ir.actions.act_window", ... }); // dùng object
```

### Các file cần sửa

#### [MODIFY] `static/src/dashboard.js`

```javascript
/** @odoo-module **/

import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Layout } from "@web/search/layout";
import { useService } from "@web/core/utils/hooks";

class AwesomeDashboard extends Component {
    static template = "awesome_dashboard.AwesomeDashboard";
    static components = { Layout };

    setup() {
        this.action = useService("action");
    }

    openCustomers() {
        this.action.doAction("contacts.action_contacts");
    }

    openLeads() {
        this.action.doAction({
            type: "ir.actions.act_window",
            name: "Leads",
            res_model: "crm.lead",
            views: [[false, "list"], [false, "form"]],
        });
    }
}

registry.category("actions").add("awesome_dashboard.dashboard", AwesomeDashboard);
```

> [!TIP]
> XML ID của action Customers trong Odoo là `contacts.action_contacts`. Nếu không có module `contacts`, thử `base.action_partner_form`.

#### [MODIFY] `static/src/dashboard.xml`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<templates xml:space="preserve">

    <t t-name="awesome_dashboard.AwesomeDashboard">
        <Layout display="{controlPanel: {}}" className="'o_dashboard h-100'">
            <t t-set-slot="layout-buttons">
                <button class="btn btn-primary" t-on-click="openCustomers">
                    Customers
                </button>
                <button class="btn btn-secondary ms-2" t-on-click="openLeads">
                    Leads
                </button>
            </t>
            <div class="o_dashboard_content d-flex flex-wrap gap-3 p-3">
                <!-- Content sẽ thêm ở các bài tiếp theo -->
            </div>
        </Layout>
    </t>

</templates>
```

---

## Bài 3: Add a Dashboard Item

### Mục tiêu
Tạo component `DashboardItem` hiển thị nội dung trong card, có thể điều chỉnh kích thước.

### Các file cần tạo/sửa

#### [NEW] `static/src/dashboard_item/dashboard_item.js`

```javascript
/** @odoo-module **/

import { Component } from "@odoo/owl";

export class DashboardItem extends Component {
    static template = "awesome_dashboard.DashboardItem";
    static props = {
        size: { type: Number, optional: true },
        slots: Object,  // slots cho nội dung
    };
    static defaultProps = {
        size: 1,
    };

    get style() {
        return `width: ${18 * this.props.size}rem;`;
    }
}
```

#### [NEW] `static/src/dashboard_item/dashboard_item.xml`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<templates xml:space="preserve">

    <t t-name="awesome_dashboard.DashboardItem">
        <div class="o_dashboard_item card" t-att-style="style">
            <div class="card-body">
                <t t-slot="default"/>
            </div>
        </div>
    </t>

</templates>
```

#### [MODIFY] `static/src/dashboard.js` — Thêm DashboardItem

```javascript
/** @odoo-module **/

import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Layout } from "@web/search/layout";
import { useService } from "@web/core/utils/hooks";
import { DashboardItem } from "./dashboard_item/dashboard_item";

class AwesomeDashboard extends Component {
    static template = "awesome_dashboard.AwesomeDashboard";
    static components = { Layout, DashboardItem };

    setup() {
        this.action = useService("action");
    }

    openCustomers() {
        this.action.doAction("contacts.action_contacts");
    }

    openLeads() {
        this.action.doAction({
            type: "ir.actions.act_window",
            name: "Leads",
            res_model: "crm.lead",
            views: [[false, "list"], [false, "form"]],
        });
    }
}

registry.category("actions").add("awesome_dashboard.dashboard", AwesomeDashboard);
```

#### [MODIFY] `static/src/dashboard.xml` — Dùng DashboardItem

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<templates xml:space="preserve">

    <t t-name="awesome_dashboard.AwesomeDashboard">
        <Layout display="{controlPanel: {}}" className="'o_dashboard h-100'">
            <t t-set-slot="layout-buttons">
                <button class="btn btn-primary" t-on-click="openCustomers">Customers</button>
                <button class="btn btn-secondary ms-2" t-on-click="openLeads">Leads</button>
            </t>
            <div class="o_dashboard_content d-flex flex-wrap gap-3 p-3">
                <DashboardItem>
                    <p>Item 1 (size=1)</p>
                </DashboardItem>
                <DashboardItem size="2">
                    <p>Item 2 (size=2)</p>
                </DashboardItem>
            </div>
        </Layout>
    </t>

</templates>
```

---

## Bài 4: Call the Server, Add Some Statistics

### Mục tiêu
Gọi API `/awesome_dashboard/statistics` và hiển thị dữ liệu thực từ server.

### Lý thuyết — rpc function
```javascript
import { rpc } from "@web/core/network/rpc";

setup() {
    onWillStart(async () => {
        const result = await rpc("/my/controller", { a: 1, b: 2 });
    });
}
```

### Dữ liệu từ `/awesome_dashboard/statistics`
Route này trả về object với các field (dựa vào code controller trong module):
- `new_orders`: số orders mới tháng này
- `amount_new_orders`: tổng doanh thu orders mới
- `average_quantity`: trung bình số áo theo order
- `cancelled_orders`: số orders bị huỷ
- `average_time`: thời gian trung bình từ 'new' → 'sent'/'cancelled'
- `shirts_by_size`: số áo bán theo từng size (S/M/L/XL/XXL) — dùng cho bài 6

### [MODIFY] `static/src/dashboard.js`

```javascript
/** @odoo-module **/

import { Component, onWillStart, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Layout } from "@web/search/layout";
import { useService } from "@web/core/utils/hooks";
import { DashboardItem } from "./dashboard_item/dashboard_item";
import { rpc } from "@web/core/network/rpc";

class AwesomeDashboard extends Component {
    static template = "awesome_dashboard.AwesomeDashboard";
    static components = { Layout, DashboardItem };

    setup() {
        this.action = useService("action");
        this.statistics = useState({});

        onWillStart(async () => {
            const data = await rpc("/awesome_dashboard/statistics");
            Object.assign(this.statistics, data);
        });
    }

    openCustomers() {
        this.action.doAction("contacts.action_contacts");
    }

    openLeads() {
        this.action.doAction({
            type: "ir.actions.act_window",
            name: "Leads",
            res_model: "crm.lead",
            views: [[false, "list"], [false, "form"]],
        });
    }
}

registry.category("actions").add("awesome_dashboard.dashboard", AwesomeDashboard);
```

### [MODIFY] `static/src/dashboard.xml`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<templates xml:space="preserve">

    <t t-name="awesome_dashboard.AwesomeDashboard">
        <Layout display="{controlPanel: {}}" className="'o_dashboard h-100'">
            <t t-set-slot="layout-buttons">
                <button class="btn btn-primary" t-on-click="openCustomers">Customers</button>
                <button class="btn btn-secondary ms-2" t-on-click="openLeads">Leads</button>
            </t>
            <div class="o_dashboard_content d-flex flex-wrap gap-3 p-3">
                <DashboardItem>
                    <h5 class="card-title">New Orders</h5>
                    <p class="display-6" t-esc="statistics.new_orders"/>
                </DashboardItem>
                <DashboardItem>
                    <h5 class="card-title">Total Amount</h5>
                    <p class="display-6" t-esc="statistics.amount_new_orders"/>
                </DashboardItem>
                <DashboardItem>
                    <h5 class="card-title">Avg T-Shirt per Order</h5>
                    <p class="display-6" t-esc="statistics.average_quantity"/>
                </DashboardItem>
                <DashboardItem>
                    <h5 class="card-title">Cancelled Orders</h5>
                    <p class="display-6" t-esc="statistics.cancelled_orders"/>
                </DashboardItem>
                <DashboardItem>
                    <h5 class="card-title">Avg Processing Time</h5>
                    <p class="display-6" t-esc="statistics.average_time"/>
                </DashboardItem>
            </div>
        </Layout>
    </t>

</templates>
```

---

## Bài 5: Cache Network Calls, Create a Service

### Mục tiêu
Tránh gọi API mỗi lần component mount, bằng cách tạo **statistics service** với caching.

### Lý thuyết
- Dùng `memoize` từ `@web/core/utils/functions` để cache kết quả
- Service được khởi tạo một lần và tồn tại suốt vòng đời ứng dụng

### [NEW] `static/src/dashboard_service.js`

```javascript
/** @odoo-module **/

import { registry } from "@web/core/registry";
import { rpc } from "@web/core/network/rpc";
import { memoize } from "@web/core/utils/functions";

const statisticsService = {
    dependencies: [],

    start(env) {
        // memoize đảm bảo loadStatistics chỉ gọi RPC một lần
        const loadStatistics = memoize(async () => {
            return await rpc("/awesome_dashboard/statistics");
        });

        return { loadStatistics };
    },
};

registry.category("services").add("awesome_dashboard.statistics", statisticsService);
```

### [MODIFY] `static/src/dashboard.js` — Dùng service

```javascript
/** @odoo-module **/

import { Component, onWillStart, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Layout } from "@web/search/layout";
import { useService } from "@web/core/utils/hooks";
import { DashboardItem } from "./dashboard_item/dashboard_item";

// Import service để đăng ký nó
import "./dashboard_service";

class AwesomeDashboard extends Component {
    static template = "awesome_dashboard.AwesomeDashboard";
    static components = { Layout, DashboardItem };

    setup() {
        this.action = useService("action");
        this.statisticsService = useService("awesome_dashboard.statistics");
        this.statistics = useState({});

        onWillStart(async () => {
            const data = await this.statisticsService.loadStatistics();
            Object.assign(this.statistics, data);
        });
    }

    openCustomers() {
        this.action.doAction("contacts.action_contacts");
    }

    openLeads() {
        this.action.doAction({
            type: "ir.actions.act_window",
            name: "Leads",
            res_model: "crm.lead",
            views: [[false, "list"], [false, "form"]],
        });
    }
}

registry.category("actions").add("awesome_dashboard.dashboard", AwesomeDashboard);
```

> [!NOTE]
> Vì `memoize` cache theo arguments, và ta gọi `loadStatistics()` không có arg, nên lần 2 trở đi sẽ trả về cached result mà không gọi server.

---

## Bài 6: Display a Pie Chart

### Mục tiêu
Thêm pie chart sử dụng Chart.js để hiển thị số lượng áo bán theo size (S/M/L/XL/XXL).

### Lý thuyết — Lazy Loading
Thay vì load Chart.js ngay từ đầu, ta **lazy load** khi component cần dùng:
```javascript
import { loadJs } from "@web/core/assets";

onWillStart(async () => {
    await loadJs("/web/static/lib/Chart/Chart.js");
});
```

### [NEW] `static/src/pie_chart/pie_chart.js`

```javascript
/** @odoo-module **/

import { Component, onMounted, onWillStart, useRef } from "@odoo/owl";
import { loadJs } from "@web/core/assets";

export class PieChart extends Component {
    static template = "awesome_dashboard.PieChart";
    static props = {
        data: Object,  // { S: 10, M: 20, L: 15, XL: 5, XXL: 3 }
    };

    setup() {
        this.canvasRef = useRef("canvas");

        onWillStart(async () => {
            await loadJs("/web/static/lib/Chart/Chart.js");
        });

        onMounted(() => {
            this._renderChart();
        });
    }

    _renderChart() {
        const data = this.props.data;
        const labels = Object.keys(data);
        const values = Object.values(data);

        new Chart(this.canvasRef.el, {
            type: "pie",
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56",
                        "#4BC0C0",
                        "#9966FF",
                    ],
                }],
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: "T-Shirts by Size",
                },
            },
        });
    }
}
```

### [NEW] `static/src/pie_chart/pie_chart.xml`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<templates xml:space="preserve">

    <t t-name="awesome_dashboard.PieChart">
        <canvas t-ref="canvas"/>
    </t>

</templates>
```

### [MODIFY] `static/src/dashboard.js` — Thêm PieChart

```javascript
/** @odoo-module **/

import { Component, onWillStart, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Layout } from "@web/search/layout";
import { useService } from "@web/core/utils/hooks";
import { DashboardItem } from "./dashboard_item/dashboard_item";
import { PieChart } from "./pie_chart/pie_chart";
import "./dashboard_service";

class AwesomeDashboard extends Component {
    static template = "awesome_dashboard.AwesomeDashboard";
    static components = { Layout, DashboardItem, PieChart };

    setup() {
        this.action = useService("action");
        this.statisticsService = useService("awesome_dashboard.statistics");
        this.statistics = useState({});

        onWillStart(async () => {
            const data = await this.statisticsService.loadStatistics();
            Object.assign(this.statistics, data);
        });
    }

    openCustomers() {
        this.action.doAction("contacts.action_contacts");
    }

    openLeads() {
        this.action.doAction({
            type: "ir.actions.act_window",
            name: "Leads",
            res_model: "crm.lead",
            views: [[false, "list"], [false, "form"]],
        });
    }
}

registry.category("actions").add("awesome_dashboard.dashboard", AwesomeDashboard);
```

### [MODIFY] `static/src/dashboard.xml` — Thêm PieChart card

```xml
<!-- Thêm vào trong o_dashboard_content, sau các card khác -->
<DashboardItem size="2">
    <h5 class="card-title">T-Shirts by Size</h5>
    <PieChart data="statistics.shirts_by_size"/>
</DashboardItem>
```

---

## Bài 7: Real Life Update

### Mục tiêu
Data trong service được cache, nhưng ta muốn tự động reload sau mỗi 10 phút. Nếu dashboard đang hiển thị, nó sẽ cập nhật ngay lập tức.

### Lý thuyết — reactive
- `reactive()` từ `@odoo/owl` tạo object reactive, không gắn với component nào
- Component dùng `useState()` trên reactive object để subscribe vào thay đổi

### [MODIFY] `static/src/dashboard_service.js`

```javascript
/** @odoo-module **/

import { registry } from "@web/core/registry";
import { rpc } from "@web/core/network/rpc";
import { reactive } from "@odoo/owl";

const RELOAD_INTERVAL = 10 * 60 * 1000; // 10 phút (dùng 10000ms = 10s để test)

const statisticsService = {
    dependencies: [],

    start(env) {
        // Tạo reactive object để components có thể subscribe
        const state = reactive({ isLoaded: false });

        async function loadData() {
            const data = await rpc("/awesome_dashboard/statistics");
            // Cập nhật in-place để reactive hoạt động
            Object.assign(state, data, { isLoaded: true });
        }

        // Load lần đầu
        loadData();

        // Reload định kỳ
        setInterval(loadData, RELOAD_INTERVAL);

        return { statistics: state };
    },
};

registry.category("services").add("awesome_dashboard.statistics", statisticsService);
```

### [MODIFY] `static/src/dashboard.js` — Dùng useState với reactive

```javascript
/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Layout } from "@web/search/layout";
import { useService } from "@web/core/utils/hooks";
import { DashboardItem } from "./dashboard_item/dashboard_item";
import { PieChart } from "./pie_chart/pie_chart";
import "./dashboard_service";

class AwesomeDashboard extends Component {
    static template = "awesome_dashboard.AwesomeDashboard";
    static components = { Layout, DashboardItem, PieChart };

    setup() {
        this.action = useService("action");
        const statsService = useService("awesome_dashboard.statistics");
        // useState để component re-render khi statistics thay đổi
        this.statistics = useState(statsService.statistics);
    }

    openCustomers() {
        this.action.doAction("contacts.action_contacts");
    }

    openLeads() {
        this.action.doAction({
            type: "ir.actions.act_window",
            name: "Leads",
            res_model: "crm.lead",
            views: [[false, "list"], [false, "form"]],
        });
    }
}

registry.category("actions").add("awesome_dashboard.dashboard", AwesomeDashboard);
```

> [!IMPORTANT]
> Vì service load data bất đồng bộ và component không cần `onWillStart` nữa, cần thêm điều kiện `t-if="statistics.isLoaded"` trong template để tránh lỗi khi data chưa sẵn sàng.

---

## Bài 8: Lazy Loading the Dashboard

### Mục tiêu
Lazy load toàn bộ dashboard assets để chỉ tải khi người dùng thực sự cần xem dashboard.

### Các bước

**Bước 1:** Di chuyển tất cả file dashboard vào thư mục con `/dashboard`:

```
static/src/
├── dashboard_action.js          # [NEW] - file mới ở src gốc
└── dashboard/                   # [NEW] - thư mục con
    ├── dashboard.js
    ├── dashboard.xml
    ├── dashboard.scss
    ├── dashboard_service.js
    ├── dashboard_item/
    │   ├── dashboard_item.js
    │   └── dashboard_item.xml
    └── pie_chart/
        ├── pie_chart.js
        └── pie_chart.xml
```

**Bước 2:** Tạo assets bundle riêng trong `__manifest__.py`:

```python
'assets': {
    'web.assets_backend': [
        'awesome_dashboard/static/src/dashboard_action.js',
    ],
    'awesome_dashboard.dashboard_assets': [
        'awesome_dashboard/static/src/dashboard/**/*',
    ],
},
```

**Bước 3:** Sửa `dashboard.js` (trong thư mục `/dashboard`) — đổi registry từ `actions` sang `lazy_components`:

```javascript
/** @odoo-module **/
// ... imports như cũ

class AwesomeDashboard extends Component {
    // ... code như cũ
}

// ĐỔI: đăng ký vào lazy_components thay vì actions
registry.category("lazy_components").add("awesome_dashboard.AwesomeDashboard", AwesomeDashboard);
```

**Bước 4:** Tạo `static/src/dashboard_action.js` (file loader trung gian):

```javascript
/** @odoo-module **/

import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { LazyComponent } from "@web/core/assets";

class AwesomeDashboardLoader extends Component {
    static components = { LazyComponent };
    static template = "awesome_dashboard.DashboardLoader";
}

registry.category("actions").add("awesome_dashboard.dashboard", AwesomeDashboardLoader);
```

**Bước 5:** Tạo template cho loader trong một file XML mới `static/src/dashboard_action.xml`:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<templates xml:space="preserve">
    <t t-name="awesome_dashboard.DashboardLoader">
        <LazyComponent
            bundle="'awesome_dashboard.dashboard_assets'"
            Component="'awesome_dashboard.AwesomeDashboard'"
        />
    </t>
</templates>
```

Cũng thêm file XML này vào bundle `web.assets_backend` trong manifest.

---

## Bài 9: Making Our Dashboard Generic

### Mục tiêu
Thay vì hardcode content trong template, dùng danh sách `items` để render dashboard một cách linh hoạt.

### Cấu trúc một Dashboard Item

```javascript
const item = {
    id: "average_quantity",
    description: "Average amount of t-shirt",
    Component: NumberCard,
    size: 3,           // optional, default 1
    props: (data) => ({ // optional
        title: "Average amount of t-shirt by order this month",
        value: data.average_quantity,
    }),
};
```

### Bước 1: Tạo component NumberCard và PieChartCard

**[NEW] `static/src/dashboard/number_card.js`:**

```javascript
/** @odoo-module **/
import { Component } from "@odoo/owl";

export class NumberCard extends Component {
    static template = "awesome_dashboard.NumberCard";
    static props = {
        title: String,
        value: [Number, String],
    };
}
```

**[NEW] `static/src/dashboard/number_card.xml`:**

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<templates xml:space="preserve">
    <t t-name="awesome_dashboard.NumberCard">
        <div>
            <h5 t-esc="props.title"/>
            <p class="display-4" t-esc="props.value"/>
        </div>
    </t>
</templates>
```

**[NEW] `static/src/dashboard/pie_chart_card.js`:**

```javascript
/** @odoo-module **/
import { Component } from "@odoo/owl";
import { PieChart } from "./pie_chart/pie_chart";

export class PieChartCard extends Component {
    static template = "awesome_dashboard.PieChartCard";
    static components = { PieChart };
    static props = {
        data: Object,
    };
}
```

**[NEW] `static/src/dashboard/pie_chart_card.xml`:**

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<templates xml:space="preserve">
    <t t-name="awesome_dashboard.PieChartCard">
        <div>
            <h5>T-Shirts by Size</h5>
            <PieChart data="props.data"/>
        </div>
    </t>
</templates>
```

### Bước 2: Tạo `dashboard_items.js`

```javascript
/** @odoo-module **/

import { NumberCard } from "./number_card";
import { PieChartCard } from "./pie_chart_card";

export const items = [
    {
        id: "new_orders",
        description: "New Orders This Month",
        Component: NumberCard,
        props: (data) => ({
            title: "New Orders This Month",
            value: data.new_orders,
        }),
    },
    {
        id: "amount_new_orders",
        description: "Total Amount of New Orders",
        Component: NumberCard,
        props: (data) => ({
            title: "Total Amount of New Orders",
            value: data.amount_new_orders,
        }),
    },
    {
        id: "average_quantity",
        description: "Average T-Shirt per Order",
        Component: NumberCard,
        props: (data) => ({
            title: "Average T-Shirt per Order",
            value: data.average_quantity,
        }),
    },
    {
        id: "cancelled_orders",
        description: "Cancelled Orders This Month",
        Component: NumberCard,
        props: (data) => ({
            title: "Cancelled Orders This Month",
            value: data.cancelled_orders,
        }),
    },
    {
        id: "average_time",
        description: "Average Processing Time",
        Component: NumberCard,
        props: (data) => ({
            title: "Average Processing Time",
            value: data.average_time,
        }),
    },
    {
        id: "shirts_by_size",
        description: "T-Shirts by Size",
        Component: PieChartCard,
        size: 2,
        props: (data) => ({
            data: data.shirts_by_size,
        }),
    },
];
```

### Bước 3: Cập nhật Dashboard component

```javascript
setup() {
    // ...
    this.items = items; // thêm vào setup
}
```

### Bước 4: Cập nhật template

```xml
<div class="o_dashboard_content d-flex flex-wrap gap-3 p-3">
    <t t-foreach="items" t-as="item" t-key="item.id">
        <DashboardItem size="item.size || 1">
            <t t-set="itemProp" t-value="item.props ? item.props(statistics) : {'data': statistics}"/>
            <t t-component="item.Component" t-props="itemProp"/>
        </DashboardItem>
    </t>
</div>
```

---

## Bài 10: Making Our Dashboard Extensible

### Mục tiêu
Thay vì hardcode danh sách items, đăng ký chúng vào **registry** để các module khác có thể dễ dàng thêm item mới.

### [MODIFY] `static/src/dashboard/dashboard_items.js`

Thay vì `export const items = [...]`, đăng ký vào registry:

```javascript
/** @odoo-module **/

import { registry } from "@web/core/registry";
import { NumberCard } from "./number_card";
import { PieChartCard } from "./pie_chart_card";

const dashboardRegistry = registry.category("awesome_dashboard");

dashboardRegistry.add("new_orders", {
    id: "new_orders",
    description: "New Orders This Month",
    Component: NumberCard,
    props: (data) => ({
        title: "New Orders This Month",
        value: data.new_orders,
    }),
});

dashboardRegistry.add("amount_new_orders", {
    id: "amount_new_orders",
    description: "Total Amount of New Orders",
    Component: NumberCard,
    props: (data) => ({
        title: "Total Amount of New Orders",
        value: data.amount_new_orders,
    }),
});

// ... thêm tương tự cho các items khác

dashboardRegistry.add("shirts_by_size", {
    id: "shirts_by_size",
    description: "T-Shirts by Size",
    Component: PieChartCard,
    size: 2,
    props: (data) => ({
        data: data.shirts_by_size,
    }),
});
```

### [MODIFY] `static/src/dashboard/dashboard.js` — Đọc từ registry

```javascript
setup() {
    this.action = useService("action");
    const statsService = useService("awesome_dashboard.statistics");
    this.statistics = useState(statsService.statistics);

    // Lấy items từ registry thay vì hardcode
    this.items = registry.category("awesome_dashboard").getAll();
}
```

---

## Bài 11: Add and Remove Dashboard Items

### Mục tiêu
Cho phép user bật/tắt từng dashboard item và lưu cấu hình vào **localStorage**.

### Logic
- Lưu danh sách `removedItemIds` vào localStorage
- Filter `items` dựa trên `removedItemIds`
- Nút Settings (gear icon) mở Dialog để cấu hình

### [NEW] `static/src/dashboard/dashboard_settings_dialog.js`

```javascript
/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import { registry } from "@web/core/registry";

export class DashboardSettingsDialog extends Component {
    static template = "awesome_dashboard.DashboardSettingsDialog";
    static components = { Dialog };
    static props = {
        currentItems: Array,
        close: Function,
        onApply: Function,
    };

    setup() {
        const allItems = registry.category("awesome_dashboard").getAll();
        this.state = useState({
            // checkbox checked = item hiển thị (ngược với removedIds)
            checked: Object.fromEntries(
                allItems.map(item => [item.id, this.props.currentItems.some(i => i.id === item.id)])
            ),
        });
        this.allItems = allItems;
    }

    onApply() {
        const removedIds = this.allItems
            .filter(item => !this.state.checked[item.id])
            .map(item => item.id);
        this.props.onApply(removedIds);
        this.props.close();
    }
}
```

### [NEW] `static/src/dashboard/dashboard_settings_dialog.xml`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<templates xml:space="preserve">
    <t t-name="awesome_dashboard.DashboardSettingsDialog">
        <Dialog title="'Dashboard Settings'">
            <t t-foreach="allItems" t-as="item" t-key="item.id">
                <div class="form-check">
                    <input
                        class="form-check-input"
                        type="checkbox"
                        t-att-id="'item_' + item.id"
                        t-model="state.checked[item.id]"
                    />
                    <label class="form-check-label" t-att-for="'item_' + item.id">
                        <t t-esc="item.description"/>
                    </label>
                </div>
            </t>
            <t t-set-slot="footer">
                <button class="btn btn-primary" t-on-click="onApply">Apply</button>
                <button class="btn btn-secondary ms-2" t-on-click="props.close">Cancel</button>
            </t>
        </Dialog>
    </t>
</templates>
```

### [MODIFY] `static/src/dashboard/dashboard.js`

```javascript
/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Layout } from "@web/search/layout";
import { useService } from "@web/core/utils/hooks";
import { DashboardItem } from "./dashboard_item/dashboard_item";
import { DashboardSettingsDialog } from "./dashboard_settings_dialog";
import "./dashboard_service";
import "./dashboard_items";

const STORAGE_KEY = "awesome_dashboard.removed_items";

class AwesomeDashboard extends Component {
    static template = "awesome_dashboard.AwesomeDashboard";
    static components = { Layout, DashboardItem, DashboardSettingsDialog };

    setup() {
        this.action = useService("action");
        this.dialog = useService("dialog");
        const statsService = useService("awesome_dashboard.statistics");
        this.statistics = useState(statsService.statistics);

        // Đọc config từ localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        const removedIds = stored ? JSON.parse(stored) : [];

        this.state = useState({ removedIds });
    }

    get items() {
        const allItems = registry.category("awesome_dashboard").getAll();
        return allItems.filter(item => !this.state.removedIds.includes(item.id));
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
        this.action.doAction("contacts.action_contacts");
    }

    openLeads() {
        this.action.doAction({
            type: "ir.actions.act_window",
            name: "Leads",
            res_model: "crm.lead",
            views: [[false, "list"], [false, "form"]],
        });
    }
}

registry.category("lazy_components").add("awesome_dashboard.AwesomeDashboard", AwesomeDashboard);
```

### [MODIFY] `static/src/dashboard/dashboard.xml` — Thêm Settings button

```xml
<t t-set-slot="layout-buttons">
    <button class="btn btn-primary" t-on-click="openCustomers">Customers</button>
    <button class="btn btn-secondary ms-2" t-on-click="openLeads">Leads</button>
    <!-- Nút settings -->
    <button class="btn btn-light ms-2" t-on-click="openSettings" title="Settings">
        <i class="fa fa-cog"/>
    </button>
</t>
```

---

## Bài 12: Going Further (Bonus)

### Các cải tiến thêm

**1. Dịch (i18n)**
```javascript
import { _t } from "@web/core/l10n/translation";

// Thay thế string thường bằng
const title = _t("New Orders This Month");
```

**2. Click vào pie chart → mở list view theo size**
Trong PieChart component, thêm xử lý click:
```javascript
onClick(event) {
    const chart = event.chart;
    const elements = chart.getElementsAtEventForMode(event, "nearest", { intersect: true }, false);
    if (elements.length) {
        const index = elements[0].index;
        const size = Object.keys(this.props.data)[index];
        this.action.doAction({
            type: "ir.actions.act_window",
            name: `Orders - Size ${size}`,
            res_model: "sale.order",
            views: [[false, "list"]],
            domain: [["product_id.attribute_value_ids.name", "=", size]],
        });
    }
}
```

**3. Responsive (Mobile)**
```scss
.o_dashboard {
    .o_dashboard_item {
        @media (max-width: 768px) {
            width: 100% !important;
        }
    }
}
```

---

## Cấu Trúc File Cuối Cùng

```
awesome_dashboard/
├── __manifest__.py              # Cập nhật assets
├── controllers/
│   └── main.py                  # (đã có sẵn)
└── static/
    └── src/
        ├── dashboard_action.js  # [Bài 8] Loader component
        ├── dashboard_action.xml # [Bài 8] Loader template
        └── dashboard/           # [Bài 8] Thư mục assets
            ├── dashboard.js
            ├── dashboard.xml
            ├── dashboard.scss
            ├── dashboard_service.js
            ├── dashboard_items.js
            ├── number_card.js
            ├── number_card.xml
            ├── pie_chart_card.js
            ├── pie_chart_card.xml
            ├── dashboard_settings_dialog.js
            ├── dashboard_settings_dialog.xml
            ├── dashboard_item/
            │   ├── dashboard_item.js
            │   └── dashboard_item.xml
            └── pie_chart/
                ├── pie_chart.js
                └── pie_chart.xml
```

---

## Manifest Cuối Cùng

```python
'assets': {
    'web.assets_backend': [
        'awesome_dashboard/static/src/dashboard_action.js',
        'awesome_dashboard/static/src/dashboard_action.xml',
    ],
    'awesome_dashboard.dashboard_assets': [
        'awesome_dashboard/static/src/dashboard/**/*',
    ],
},
```

---

## Lưu Ý Quan Trọng

> [!WARNING]
> Sau mỗi thay đổi JS/XML, cần **reload trang** và có thể cần **xóa cache** của browser (`Ctrl+Shift+R`).

> [!IMPORTANT]
> Khi thêm file mới vào module, Odoo cần được **khởi động lại** để nhận assets mới (hoặc dùng dev mode với `?debug=assets`).

> [!TIP]
> Để bật developer mode: vào Settings → Technical → Activate the developer mode. Hoặc thêm `?debug=1` vào URL.

### Thứ tự bài tập khuyến nghị
Làm tuần tự từ Bài 1 → 11. Mỗi bài xây dựng trên nền của bài trước. Bài 8 (Lazy Loading) là điểm bước ngoặt quan trọng về cấu trúc file.

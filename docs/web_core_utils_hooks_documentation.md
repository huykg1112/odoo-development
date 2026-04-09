# Tài Liệu Toàn Diện về Hooks trong Odoo OWL (v2.8.2)

Odoo sử dụng bộ hook hai tầng:
- **Tầng 1 — `@odoo/owl`**: Các hook gốc của OWL framework (built-in), dùng ở mọi nơi.
- **Tầng 2 — `@web/core/utils/hooks`**: Các hook tiện ích nâng cao do Odoo tự viết thêm, đóng gói các pattern phổ biến như lấy service, subscribe bus event, autofocus, v.v.

---

## PHẦN 1 — Hooks Gốc từ `@odoo/owl`

Import từ: `import { ... } from "@odoo/owl";`

---

### 1.1 `useState(initialState)`

**Dùng để làm gì:**
Tạo một đối tượng state phản ứng (reactive). Bất kỳ thuộc tính nào trong state thay đổi, OWL sẽ tự động re-render đúng phần DOM bị ảnh hưởng. Đây là hook cơ bản nhất để quản lý trạng thái UI.

**Khi nào dùng:**
- Khi bạn cần lưu trữ bất kỳ dữ liệu nào liên quan đến giao diện mà có thể thay đổi theo thời gian (bộ đếm, dữ liệu lọc, trạng thái mở/đóng dropdown, ...).

**Ví dụ cụ thể (từ `awesome_clicker`):**
```javascript
import { Component, useState } from "@odoo/owl";

export class ClickerSystrayItem extends Component {
    setup() {
        // Tạo state với giá trị ban đầu là { count: 0 }
        this.state = useState({ count: 0 });
    }

    onClick() {
        this.state.count += 10; // → UI tự động cập nhật số đếm
    }
}
```

**Lưu ý quan trọng:**
- Chỉ dùng được bên trong `setup()`.
- Chỉ trigger re-render khi thay đổi thuộc tính **trực tiếp** trong object (không phải nested sâu hơn trừ khi dùng nested reactive).

---

### 1.2 `useRef(refName)`

**Dùng để làm gì:**
Lấy một tham chiếu trực tiếp đến một DOM Element hoặc Component con đã được đánh dấu bằng `t-ref` trong template. Trả về một object `{ el: HTMLElement | null }`.

**Khi nào dùng:**
- Cần scroll một vùng nội dung tới vị trí nhất định.
- Cần lấy kích thước element (`getBoundingClientRect`).
- Cần tích hợp thư viện ngoài cần một DOM node thật (ví dụ Chart.js, CodeMirror).
- Cần gọi `.focus()` trên input.

**Ví dụ cụ thể:**
```javascript
import { Component, useRef, onMounted } from "@odoo/owl";

export class ChatBox extends Component {
    static template = "mymodule.ChatBox";

    setup() {
        this.chatBodyRef = useRef("chatBody"); // Đánh dấu bằng t-ref="chatBody" trong XML

        onMounted(() => {
            // Tự động cuộn xuống cuối hộp chat khi component vừa load xong
            const el = this.chatBodyRef.el;
            if (el) el.scrollTop = el.scrollHeight;
        });
    }
}
```

```xml
<div t-ref="chatBody" class="chat-body overflow-auto" style="height: 400px;">
    <!-- các tin nhắn -->
</div>
```

---

### 1.3 `useEffect(effect, computeDependencies?)`

**Dùng để làm gì:**
Thực thi một hiệu ứng phụ (side effect) khi component được mounted hoặc patched (re-render), nhưng **chỉ chạy lại khi danh sách dependency thực sự thay đổi**. Cho phép trả về một cleanup function để dọn dẹp khi effect sắp chạy lại hoặc component unmount.

**Khi nào dùng:**
- Cần lắng nghe một biến thay đổi để chạy logic phụ (ví dụ: khi `state.searchQuery` thay đổi thì tự gọi API tìm kiếm lại).
- Cần thêm/gỡ event listener có điều kiện dựa trên state.
- Là "xương sống" của nhiều hook tiện ích Odoo viết ra như `useBus`, `useAutofocus`.

**Cú pháp:**
```javascript
useEffect(
    (dep1, dep2) => {
        // Chạy khi dep1 hoặc dep2 thay đổi
        const id = setInterval(() => console.log(dep1), 1000);
        // Trả về cleanup function
        return () => clearInterval(id);
    },
    () => [this.state.dep1, this.props.dep2] // Dependency array
);
```

**Ví dụ cụ thể:**
```javascript
import { Component, useState, useEffect } from "@odoo/owl";

export class LiveSearch extends Component {
    setup() {
        this.state = useState({ query: "", results: [] });

        // Chỉ tìm kiếm lại khi query thực sự thay đổi (không tìm lại khi render vì lý do khác)
        useEffect(
            async (query) => {
                if (query.length >= 2) {
                    this.state.results = await this.env.services.orm.searchRead(
                        "res.partner",
                        [["name", "ilike", query]],
                        ["name", "email"]
                    );
                }
            },
            () => [this.state.query] // Dependency: chỉ re-run khi query thay đổi
        );
    }
}
```

---

### 1.4 `useExternalListener(target, eventName, handler, options?)`

**Dùng để làm gì:**
Đăng ký một event listener trên một DOM element **bên ngoài** cây component (ví dụ: `window`, `document`, `document.body`). Hook tự động **thêm** listener khi component mounted và **gỡ** listener khi component unmounted, tránh memory leak.

**Khi nào dùng:**
- Đóng dropdown/menu khi người dùng click ra ngoài.
- Lắng nghe `window.resize` để re-calculate layout.
- Lắng nghe `keydown` ở `window` để hỗ trợ phím tắt toàn cục.
- Lắng nghe custom DOM event phát từ nơi khác trong ứng dụng.

**Ví dụ cụ thể (từ file `clicker_systray_item.js` trong dự án này):**
```javascript
import { Component, useState } from "@odoo/owl";
import { useExternalListener } from "@odoo/owl"; // hoặc "@web/core/utils/hooks"

export class ClickerSystrayItem extends Component {
    setup() {
        this.state = useState({ count: 0 });

        // Lắng nghe custom event "clicker-click" trên document.body
        // Tham số { capture: true } → handler chạy ở giai đoạn capture (trước bubble)
        useExternalListener(document.body, "clicker-click", this.onExternalClick, { capture: true });
    }

    onExternalClick() {
        this.state.count++; // Tăng 1 mỗi khi có click bên ngoài
    }

    onClick(ev) {
        ev.stopPropagation(); // Chặn event lan lên document.body, tránh gọi onExternalClick
        this.state.count += 10; // Click vào chính item → tăng 10
    }
}
```

> **💡 Giải thích capture vs bubble:**
> - **Bubble (mặc định):** Sự kiện đi từ phần tử bị click lên tới `document`. Handler chạy muộn.
> - **Capture:** Sự kiện đi từ `document` xuống phần tử bị click. Handler chạy sớm nhất, trước các handler của phần tử con.

---

### 1.5 `useEnv()` và `useSubEnv(extension)` / `useChildSubEnv(extension)`

**`useEnv()`**
Trả về trực tiếp đối tượng `env` của component hiện tại. Thường dùng khi viết custom hook (hàm độc lập ngoài class, cần tham chiếu env).

**`useSubEnv(extension)`**
Mở rộng `env` cho **cả component hiện tại và toàn bộ cây con**. Tất cả component con/cháu sẽ kế thừa thêm các thuộc tính mới.

**`useChildSubEnv(extension)`**
Chỉ mở rộng cho **cây con**, không ảnh hưởng đến component hiện tại.

**Khi nào dùng:**
- Cần truyền context xuống toàn bộ cây con mà không muốn drill props qua nhiều tầng (ví dụ: context record hiện tại của form view).

**Ví dụ:**
```javascript
import { Component, useSubEnv, useEnv } from "@odoo/owl";

// Component cha thiết lập context dùng chung
export class FormView extends Component {
    setup() {
        useSubEnv({ currentRecord: this.props.record });
        // Giờ mọi component con đều có this.env.currentRecord
    }
}

// Component cháu đọc ra dùng
export class StatusBadge extends Component {
    setup() {
        const env = useEnv();
        this.record = env.currentRecord; // Lấy record từ ancestor
    }
}
```

---

### 1.6 `useComponent()`

**Dùng để làm gì:**
Trả về instance của component đang gọi hook. Thường dùng khi bạn **viết custom hook** (hàm utility độc lập), cần tham chiếu đến component để bind `this`, kiểm tra status, hoặc truy cập `env`.

**Khi nào dùng:**
- Hầu như **chỉ dùng khi viết custom hook** cho người khác dùng lại.
- Không nên dùng trực tiếp trong class vì đã có `this`.

**Ví dụ (tái hiện cách `useBus` trong Odoo được xây dựng):**
```javascript
import { useComponent, useEffect } from "@odoo/owl";

// Custom hook viết để tái sử dụng ở nhiều component
export function useBus(bus, eventName, callback) {
    const component = useComponent(); // Lấy component instance để bind this

    useEffect(() => {
        const listener = callback.bind(component); // Bind this vào component
        bus.addEventListener(eventName, listener);
        return () => bus.removeEventListener(eventName, listener); // Cleanup
    }, () => []);
}
```

---

### 1.7 Lifecycle Hooks (`onWillStart`, `onMounted`, `onPatched`, `onWillUnmount`, ...)

Đây là các hook lắng nghe vòng đời component. Tất cả đều phải được gọi **trong `setup()`**.

| Hook | Import | Khi nào chạy | Dùng để làm gì |
|------|--------|--------------|----------------|
| `onWillStart` | `@odoo/owl` | Trước render đầu tiên (async OK) | Fetch dữ liệu từ server, load thư viện ngoài |
| `onMounted` | `@odoo/owl` | Sau khi DOM đã vẽ lần đầu | Khởi tạo thư viện JS (Chart.js), focus input, đo kích thước DOM |
| `onWillUpdateProps` | `@odoo/owl` | Trước khi props mới từ cha đến | Clear state cũ, chuẩn bị cho dữ liệu mới |
| `onPatched` | `@odoo/owl` | Sau mỗi lần re-render (sau lần đầu) | Cập nhật thư viện Chart vẽ lại biểu đồ, scroll xuống cuối |
| `onWillPatch` | `@odoo/owl` | Trước mỗi lần re-render | Lưu scroll position để khôi phục sau khi patch |
| `onWillUnmount` | `@odoo/owl` | Trước khi component bị destroy | Clear interval, gỡ listener, hủy WebSocket |
| `onWillDestroy` | `@odoo/owl` | Khi component bị destroy (sau unmount) | Giải phóng tài nguyên cuối cùng |
| `onRendered` | `@odoo/owl` | Mỗi khi render (bao gồm lần đầu) | Debug, tracking render |
| `onError` | `@odoo/owl` | Khi có lỗi trong cây con | Error boundary — hiện UI fallback |

**Ví dụ tổng hợp lifecycle:**
```javascript
import {
    Component, useState,
    onWillStart, onMounted, onWillUpdateProps, onPatched, onWillUnmount
} from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { loadJS } from "@web/core/assets";

export class SalesDashboard extends Component {
    static props = { companyId: Number };

    setup() {
        this.orm = useService("orm");
        this.state = useState({ data: [], chartInstance: null });
        this.chartRef = useRef("chartCanvas");

        // 1. Fetch data trước khi hiển thị
        onWillStart(async () => {
            await loadJS("/web/static/lib/Chart.js/Chart.js"); // Tải chart lib
            this.state.data = await this.orm.searchRead(
                "sale.order",
                [["company_id", "=", this.props.companyId]],
                ["name", "amount_total"]
            );
        });

        // 2. Khi DOM sẵn sàng, khởi tạo biểu đồ
        onMounted(() => {
            this._initChart();
        });

        // 3. Khi props thay đổi (chuyển sang công ty khác)
        onWillUpdateProps(async (nextProps) => {
            this.state.data = await this.orm.searchRead(
                "sale.order",
                [["company_id", "=", nextProps.companyId]],
                ["name", "amount_total"]
            );
        });

        // 4. Sau mỗi re-render, vẽ lại biểu đồ
        onPatched(() => {
            this._updateChart();
        });

        // 5. Khi component bị xóa, destroy biểu đồ
        onWillUnmount(() => {
            if (this.state.chartInstance) {
                this.state.chartInstance.destroy();
            }
        });
    }

    _initChart() { /* ... */ }
    _updateChart() { /* ... */ }
}
```

---

## PHẦN 2 — Hooks Tiện Ích từ `@web/core/utils/hooks`

Import từ: `import { useService, useBus, ... } from "@web/core/utils/hooks";`
File nguồn: `odoo/addons/web/static/src/core/utils/hooks.js`

---

### 2.1 `useService(serviceName)` ⭐ Quan trọng nhất

**Dùng để làm gì:**
Lấy một service từ `env.services` một cách an toàn. Nội bộ nó wrap các method của service bằng cơ chế **"protect method"** — nếu component bị destroy trong lúc đang chờ kết quả async, Promise sẽ tự động bị bỏ qua (không crash).

**Khi nào dùng:**
Mỗi khi cần tương tác với backend hay các chức năng hệ thống:
- `orm` → CRUD với model Python
- `rpc` → Gọi controller HTTP tùy ý
- `action` → Điều hướng giữa các view/action
- `notification` → Hiện thông báo toast
- `dialog` → Mở hộp thoại
- `router` → Quản lý URL hash

**Ví dụ thực tế (từ `awesome_dashboard`):**
```javascript
import { Component, useState, onWillStart } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class Dashboard extends Component {
    setup() {
        // Lấy các service cần dùng
        this.orm = useService("orm");
        this.action = useService("action");
        this.notification = useService("notification");

        this.state = useState({ orders: [], loading: true });

        onWillStart(async () => {
            try {
                this.state.orders = await this.orm.searchRead(
                    "sale.order",           // Model name
                    [["state", "=", "sale"]], // Domain
                    ["name", "partner_id", "amount_total"], // Fields
                    { limit: 10, order: "date_order desc" } // Options
                );
            } finally {
                this.state.loading = false;
            }
        });
    }

    openOrder(orderId) {
        // Chuyển sang form view của order
        this.action.doAction({
            type: "ir.actions.act_window",
            res_model: "sale.order",
            res_id: orderId,
            views: [[false, "form"]],
        });
    }

    showSuccess() {
        this.notification.add("Đã lưu thành công!", { type: "success" });
    }
}
```

**Danh sách các service quan trọng nhất:**

| Service | Chức năng chính |
|---------|----------------|
| `orm` | `searchRead`, `read`, `write`, `create`, `unlink`, `call` |
| `rpc` | `rpc(route, params)` — gọi HTTP endpoint tùy ý |
| `action` | `doAction(action)` — điều hướng view/action |
| `notification` | `add(message, { type })` — toast thông báo |
| `dialog` | `add(Component, props)` — mở hộp thoại |
| `router` | `navigate`, `current` — URL routing |
| `ui` | `isSmall`, `activeElement` — responsive state |
| `user` | `userId`, `lang`, `tz` — thông tin user hiện tại |

---

### 2.2 `useBus(bus, eventName, callback)`

**Dùng để làm gì:**
Đăng ký lắng nghe một sự kiện trên **EventBus** của OWL (hoặc bất kỳ bus nào dùng `addEventListener/removeEventListener`). Hook tự động thêm/gỡ listener theo vòng đời component — không cần lo memory leak.

**Khi nào dùng:**
- Khi nhiều component không có quan hệ cha-con cần giao tiếp với nhau thông qua bus chung.
- Lắng nghe event từ service trung tâm (ví dụ: bus thông báo loading, bus WebSocket message).

**Ví dụ thực tế:**
```javascript
import { Component, useState } from "@odoo/owl";
import { useBus, useService } from "@web/core/utils/hooks";

export class LoadingIndicator extends Component {
    setup() {
        this.state = useState({ loading: false });
        const rpcService = useService("rpc"); // rpc service có bus riêng

        // Lắng nghe event "REQUEST_SENT" từ rpc bus → hiện spinner
        useBus(rpcService.bus, "REQUEST_SENT", () => {
            this.state.loading = true;
        });

        // Lắng nghe event "REQUEST_COMPLETED" → ẩn spinner
        useBus(rpcService.bus, "REQUEST_COMPLETED", () => {
            this.state.loading = false;
        });
    }
}
```

> **Khác biệt với `useExternalListener`:**
> - `useBus` → dành cho OWL `EventBus` (object dùng `addEventListener/removeEventListener`)
> - `useExternalListener` → dành cho DOM Elements thật (`window`, `document`, `HTMLElement`)

---

### 2.3 `useAutofocus({ refName?, selectAll?, mobile? })`

**Dùng để làm gì:**
Tự động focus vào một element được đánh dấu bằng `t-ref` ngay khi nó xuất hiện trong DOM. Nếu là input/textarea, đặt cursor về cuối (hoặc chọn toàn bộ text nếu `selectAll: true`). Trên thiết bị mobile, tự động bỏ qua để tránh bàn phím ảo pop-up bất ngờ.

**Khi nào dùng:**
- Khi mở form/dialog, muốn con trỏ đặt sẵn vào field đầu tiên.
- Thanh search filter mở ra cần focus ngay vào ô tìm kiếm.
- Quick create form trong Kanban.

**Ví dụ thực tế (Kanban Column Quick Create):**
```javascript
import { Component, useState } from "@odoo/owl";
import { useAutofocus } from "@web/core/utils/hooks";

export class KanbanColumnQuickCreate extends Component {
    static template = "web.KanbanColumnQuickCreate";

    setup() {
        this.state = useState({ name: "" });
        // Tự động focus vào input có t-ref="autofocus" khi component rendered
        useAutofocus();
        // Hoặc tùy chỉnh:
        // useAutofocus({ refName: "nameInput", selectAll: true });
    }
}
```

```xml
<div class="o_column_quick_create">
    <!-- t-ref="autofocus" → hook sẽ tự focus vào đây -->
    <input t-ref="autofocus" t-model="state.name" placeholder="Tên cột mới..." />
    <button t-on-click="confirm">Thêm</button>
</div>
```

---

### 2.4 `useOwnedDialogs()`

**Dùng để làm gì:**
Trả về một hàm `addDialog(Component, props)` có thể mở dialog. Mặc biệt hơn `useService("dialog")` ở chỗ: **khi component bị unmount, tất cả dialog nó đã mở sẽ tự đóng lại**. Rất hữu ích khi tránh dialog "mồ côi" còn tồn tại sau khi component cha đã bị destroy.

**Khi nào dùng:**
- Component có thể mở nhiều dialog con, và muốn đảm bảo tất cả dialog đó bị dọn dẹp khi component bị đóng.
- Ví dụ: Calendar mở dialog tạo event, khi user chuyển tháng (calendar re-mount) thì dialog cũ phải tự đóng.

**Ví dụ:**
```javascript
import { Component } from "@odoo/owl";
import { useOwnedDialogs } from "@web/core/utils/hooks";
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";

export class RecordList extends Component {
    setup() {
        // Dùng useOwnedDialogs thay vì useService("dialog")
        this.addDialog = useOwnedDialogs();
    }

    deleteRecord(recordId) {
        this.addDialog(ConfirmationDialog, {
            title: "Xác nhận xóa",
            body: "Bạn có chắc muốn xóa bản ghi này không?",
            confirm: async () => {
                await this.orm.unlink("res.partner", [recordId]);
            },
        });
        // Nếu component này bị đóng trước khi user confirm/cancel,
        // dialog sẽ tự động đóng theo. Không bị dialog "mồ côi".
    }
}
```

---

### 2.5 `useSpellCheck({ refName? })`

**Dùng để làm gì:**
Tắt spell check (đường gạch đỏ) khi element không có focus. Chỉ bật spell check khi người dùng đang gõ vào element đó. Điều này giúp giao diện sạch hơn, tránh đường gạch đỏ khắp nơi khi chỉ đọc.

**Khi nào dùng:**
- Các field textarea, rich text editor trong form view.
- Bất cứ đâu bạn muốn trải nghiệm spell check thông minh hơn.

**Ví dụ (từ `text_field.js`):**
```javascript
import { Component } from "@odoo/owl";
import { useSpellCheck } from "@web/core/utils/hooks";

export class TextField extends Component {
    static template = "web.TextField";

    setup() {
        // Tự động toggle spellcheck chỉ khi focus
        useSpellCheck(); // Mặc định tìm element có t-ref="spellcheck"
        // Hoặc: useSpellCheck({ refName: "myTextInput" });
    }
}
```

```xml
<textarea t-ref="spellcheck" t-model="state.value" />
```

---

### 2.6 `useChildRef()` và `useForwardRefToParent(refName)`

**Dùng để làm gì:**
Hai hook này cặp đôi với nhau để **truyền ref từ component con lên component cha** (Forward Ref pattern).

- **`useChildRef()`**: Dùng ở component **Cha** để tạo một "placeholder ref" chờ con gán vào.
- **`useForwardRefToParent(refName)`**: Dùng ở component **Con** để gửi ref của chính nó lên cha.

**Khi nào dùng:**
- Component cha cần điều khiển trực tiếp DOM của component con (ví dụ: focus, scroll, gọi method).
- Khi bạn có wrapper component bao ngoài một input, nhưng cha vẫn cần truy cập trực tiếp vào `<input>` element bên trong.

**Ví dụ:**
```javascript
// ===== Component Cha =====
import { Component, useRef } from "@odoo/owl";
import { useChildRef } from "@web/core/utils/hooks";
import { FancyInput } from "./fancy_input";

export class ParentForm extends Component {
    static components = { FancyInput };
    static template = "mymodule.ParentForm";

    setup() {
        // Tạo ref chờ con gán vào
        this.inputRef = useChildRef();
    }

    focusInput() {
        // Truy cập DOM của component con
        this.inputRef.el?.focus();
    }
}
```

```xml
<!-- Cha truyền ref xuống con qua prop -->
<FancyInput inputRef="inputRef" />
<button t-on-click="focusInput">Focus vào input</button>
```

```javascript
// ===== Component Con =====
import { Component } from "@odoo/owl";
import { useForwardRefToParent } from "@web/core/utils/hooks";

export class FancyInput extends Component {
    static props = { inputRef: { type: Function, optional: true } };
    static template = "mymodule.FancyInput";

    setup() {
        // Gửi ref có tên "input" lên cha thông qua prop "inputRef"
        useForwardRefToParent("input");
    }
}
```

```xml
<!-- Con đánh dấu element cần forward -->
<input t-ref="input" class="fancy-input" />
```

---

### 2.7 `useRefListener(ref, eventName, handler, options?)`

**Dùng để làm gì:**
Thêm event listener lên một DOM element được tham chiếu bởi `ref`, nhưng theo kiểu "safe" — tự động thêm khi element xuất hiện và gỡ khi element biến mất hoặc component unmount.

**Khi nào dùng:**
- Khi viết custom hook cần gắn nhiều event listener lên một element cụ thể trong template.
- Thay thế cho pattern thủ công `onMounted` + `onWillUnmount` khi gắn listener vào DOM ref.

**Ví dụ:**
```javascript
import { Component, useRef } from "@odoo/owl";
import { useRefListener } from "@web/core/utils/hooks";

export class ResizablePanel extends Component {
    setup() {
        this.panelRef = useRef("panel");

        // Thay vì phải dùng onMounted + onWillUnmount thủ công:
        useRefListener(this.panelRef, "mousedown", this.onMouseDown.bind(this));
        useRefListener(this.panelRef, "touchstart", this.onTouchStart.bind(this), { passive: true });
    }

    onMouseDown(ev) { /* Bắt đầu resize */ }
    onTouchStart(ev) { /* Bắt đầu resize trên mobile */ }
}
```

---

## PHẦN 3 — Bảng Tổng Hợp Quick Reference

| Hook | Import từ | Mục đích chính |
|------|-----------|----------------|
| `useState` | `@odoo/owl` | State phản ứng cơ bản |
| `useRef` | `@odoo/owl` | Tham chiếu DOM element |
| `useEffect` | `@odoo/owl` | Side effect có dependency |
| `useExternalListener` | `@odoo/owl` | Event listener bên ngoài component |
| `useEnv` | `@odoo/owl` | Truy cập env hiện tại |
| `useSubEnv` | `@odoo/owl` | Mở rộng env cho cây con |
| `useChildSubEnv` | `@odoo/owl` | Mở rộng env chỉ cho con |
| `useComponent` | `@odoo/owl` | Instance component (dùng khi viết custom hook) |
| `onWillStart` | `@odoo/owl` | Lifecycle: trước render đầu tiên |
| `onMounted` | `@odoo/owl` | Lifecycle: sau khi DOM vẽ xong |
| `onPatched` | `@odoo/owl` | Lifecycle: sau mỗi re-render |
| `onWillUpdateProps` | `@odoo/owl` | Lifecycle: trước khi nhận props mới |
| `onWillUnmount` | `@odoo/owl` | Lifecycle: trước khi destroy |
| `onWillDestroy` | `@odoo/owl` | Lifecycle: khi bị destroy hoàn toàn |
| `onError` | `@odoo/owl` | Lifecycle: error boundary |
| **`useService`** | `@web/core/utils/hooks` | Lấy Odoo service (orm, rpc, action...) |
| **`useBus`** | `@web/core/utils/hooks` | Subscribe EventBus an toàn |
| **`useAutofocus`** | `@web/core/utils/hooks` | Auto focus input khi mount |
| **`useOwnedDialogs`** | `@web/core/utils/hooks` | Mở dialog tự đóng khi parent unmount |
| **`useSpellCheck`** | `@web/core/utils/hooks` | Toggle spellcheck theo focus |
| **`useChildRef`** | `@web/core/utils/hooks` | Tạo forward ref ở component cha |
| **`useForwardRefToParent`** | `@web/core/utils/hooks` | Gửi ref từ con lên cha |
| **`useRefListener`** | `@web/core/utils/hooks` | Event listener trên DOM ref |

---

## PHẦN 4 — Luồng Quyết Định Dùng Hook Nào

```
Muốn lưu state UI thay đổi theo thời gian?
    └─→ useState()

Cần tham chiếu trực tiếp vào DOM element?
    └─→ useRef() + t-ref="name"

Cần gọi API / service Odoo (orm, rpc, action)?
    └─→ useService("serviceName")

Cần lắng nghe event trên window/document?
    └─→ useExternalListener(window, "eventName", handler)

Cần lắng nghe event từ EventBus?
    └─→ useBus(bus, "eventName", callback)

Cần logic chạy khi dependency thay đổi?
    └─→ useEffect(fn, () => [dep1, dep2])

Cần focus input khi component mở ra?
    └─→ useAutofocus()

Cần mở dialog và tự đóng khi component unmount?
    └─→ useOwnedDialogs()

Cần cha truy cập DOM của con?
    └─→ useChildRef() ở cha + useForwardRefToParent() ở con

Cần viết custom hook cho người khác dùng?
    └─→ useComponent() để lấy instance
```

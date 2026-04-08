# Tài liệu Chi Tiết Về OWL (Odoo Web Library)

OWL (Odoo Web Library) là một UI framework được nhúng sâu và phát triển bởi chính đội ngũ Odoo (từ phiên bản Odoo 14 trở lên, trở thành hệ thống frontend chính thống và duy nhất từ Odoo 16 ở phiên bản OWL 2.x). 

Nó kết hợp những ưu điểm tốt nhất của React (Component-based, khái niệm Hooks) và Vue (Tính năng Reactivity dạng Proxy, cú pháp template) trong khi vẫn duy trì sự tương thích tuyệt đối với QWeb (hệ thống template gốc của Odoo).

Dưới đây là một tài liệu chi tiết từ gốc rễ đến các thành phần xoay quanh OWL.

---

## 1. Cấu trúc một Component Cơ Bản (Component Object)

Component là đơn vị xây dựng giao diện cơ bản nhất trong OWL. Mọi mảnh ghép trên trang (form, nút bấm, sidebar, dashboard) đều là Component.

```javascript
import { Component, useState } from "@odoo/owl";

export class MyCounter extends Component {
    // 1. Template: Chỉ định chuỗi tên QWeb template hoặc inline XML
    static template = "my_module.MyCounterTemplate";
    
    // 2. Props validation: Khai báo dữ liệu truyền từ component Cha
    static props = {
        title: { type: String, optional: true },
        startCount: { type: Number },
    };

    // 3. Hàm Setup: Nơi khởi tạo trạng thái và Lifecycle
    setup() {
        // Trạng thái phản ứng (Reactivity)
        this.state = useState({
            count: this.props.startCount || 0,
        });
    }

    // 4. Logic methods
    increment() {
        this.state.count++;
    }
}
```

*Trong file XML tương ứng:*
```xml
<templates>
    <t t-name="my_module.MyCounterTemplate" owl="1">
        <div class="counter-box">
            <h1 t-esc="props.title || 'Counter'" />
            <p>Giá trị: <t t-esc="state.count"/></p>
            <!-- Lắng nghe sự kiện click -->
            <button t-on-click="increment">Tăng</button>
        </div>
    </t>
</templates>
```

---

## 2. Reactivity (Tính phản ứng của dữ liệu)

OWL sử dụng `Proxy` của JavaScript để quan sát xem dữ liệu có thay đổi hay không. Nếu có, nó tự động re-render (tự cập nhật lại vùng DOM bị ảnh hưởng).

- **`useState`**: Chuyên dùng trong phương thức `setup()`. Gắn với vòng đời component. Bất kỳ giá trị nào trong bộ `useState` thay đổi, Component sẽ render lại.
- **`reactive` / `useReactive`**: Dùng để tạo ra một cấu trúc dữ liệu phản ứng có thể tồn tại độc lập bên ngoài scope của Component (chẳng hạn như một global store).

```javascript
// Ví dụ tạo 1 rổ State
this.state = useState({ user: 'Admin', age: 30 });
// Cập nhật giá trị -> UI sẽ tự đổi màn hình ngay lập tức !
this.state.age = 31; 
```

---

## 3. Lifecycle Hooks (Vòng đời Component)

Lifecycle Hooks giúp lập trình viên can thiệp vào các thời điểm cụ thể khi một Component được sinh ra, cập nhật, hay bị gỡ khỏi màn hình.

| Hook | Nhập từ | Chức năng (Khi nào chạy?) | Ví dụ thực tế |
|---|---|---|---|
| **`onWillStart`** | `@odoo/owl` | Trước khi Component render **LẦN ĐẦU TIÊN**. Bản năng là Async (chấp nhận `await`). | Fetch dữ liệu từ Database qua RPC trước khi hiển thị khung HTML. |
| **`onMounted`** | `@odoo/owl` | Ngay khi DOM của component đã được vẽ hẳn lên trình duyệt. | Kích hoạt thư viện Chart.js vẽ biểu đồ canvas, focus chuột vào ô `<input>`. |
| **`onWillUpdateProps`** | `@odoo/owl` | Trước khi hệ thống nhận được bộ `props` mới từ Component cha đẩy xuống. | Xóa đi hoặc làm mới nội dung cũ dựa trên ID bản ghi (props.recordId) mới nhận. |
| **`onWillUnmount`** | `@odoo/owl` | Ngay trước khi Component bị xóa sổ khỏi hệ thống DOM. | Gỡ bỏ (clear) `setInterval`, gỡ các Event Listener ở `window.addEventListener`. |

```javascript
import { Component, onWillStart, onMounted, onWillUnmount } from "@odoo/owl";

setup() {
    onWillStart(async () => {
        this.data = await this.env.services.orm.searchRead('res.partner', []);
    });

    onMounted(() => {
        console.log("Component đã lên hình!");
    });
}
```

---

## 4. QWeb Directives (Cú pháp Template OWL)

Thay vì dùng JSX như React, OWL dùng QWeb (XML-based) vốn là đặc sản của Odoo.

- **Hiển thị giá trị:**
  - `t-esc`: In ra text an toàn (chống XSS script injection). Ví dụ `<span t-esc="state.name"/>`
  - `t-out`: In ra HTML thô trực tiếp (Giống `v-html` trong Vue).

- **Vòng lặp và rẽ nhánh:**
  - Có các thẻ bù trừ `<t t-if="điều kiện">`, `<t t-elif="điều kiện">`, `<t t-else="">`
  - Vòng lặp: `<t t-foreach="state.partners" t-as="partner" t-key="partner.id">` (Bắt buộc phải có `t-key` cho mỗi mục để OWL tối ưu hóa thuật toán render Diffing).

- **Sự kiện (Event Bindings):**
  - `<button t-on-click="doSomething">`
  - `<input t-on-keyup.enter="submitForm">`
  - `t-on-[event].prevent`: `preventDefault()` (ngăn hành vi nổi bọt native).
  - `t-on-[event].stop`: `stopPropagation()`.

- **Thuộc tính Động (Dynamic Attributes):**
  - **`t-att-[name]="value"`**: Đặt thuộc tính theo biểu thức. Ví dụ: `<input t-att-disabled="state.isLocked" />`
  - **`t-attf-[name]="string"`**: Ghép chuỗi hỗn hợp biểu thức. Ví dụ: `<div t-attf-class="col-{{ props.size }} bg-primary" />`

- **Tương tác trực tiếp Model (2-way Data Binding):**
  - `<input t-model="state.username" />` - Tự động cập nhật thuộc tính cấu hình khi bạn gõ chữ (Giống `v-model` trong Vue).

---

## 5. `env` và các Services (Môi trường chung)

Mọi Component trong OWL khi ở trong nền tảng Odoo đều chia sẻ chung một môi trường được gọi là `env` (environment). 

`env` giống một chiếc cặp hồ sơ khổng lồ đi xuyên suốt mọi ngõ ngách, chứa các `services` cốt lõi của Frontend Odoo (Như gửi request, thông báo, chuyển trang,...).

Thay vì phải `import` lẻ tẻ, bạn có thể gọi thẳng:
- `this.env.services.orm`: Gọi hàm Python ORM model (search, read, write, create).
- `this.env.services.rpc`: Cho phép call HTTP call thẳng vào controller JSON (ví dụ server side `awesome_dashboard`).
- `this.env.services.action.doAction`: Yêu cầu Odoo mở một Action Form/List khác trên giao diện.
- `this.env.services.notification.add`: Hiện ra một cái hộp nhỏ màu xanh/đỏ báo lỗi ở góc phải màn hình.

**Cách dùng `useEnv` và `useSubEnv`:**
```javascript
import { useEnv, useSubEnv } from "@odoo/owl";

// Lấy Env nếu xài ở file hàm rời ko phải Component
const env = useEnv(); 

// Phân vai Env cho con cái: Tất cả các Node con do component này sinh ra sẽ được thừa hưởng 1 biến thêm vào `name` = "Odoo Global".
useSubEnv({ myAppName: "Odoo Global" }); 
```

---

## 6. Composition: Component Lồng Nhau và Hooks Tiện Ích

**`useRef`**
Lấy tham chiếu thẳng vào Thẻ DOM Element để chơi với JS thuần (ví dụ scroll dỏm hay canvas).
```xml
<div t-ref="chatBox"> Nội dung chat </div>
```
```javascript
import { useRef } from "@odoo/owl";
setup() {
    this.chatRef = useRef("chatBox");
    onMounted(() => {
        // Chỉ cuộn trang khi element đã vẽ
        this.chatRef.el.scrollTop = 1000;
    });
}
```

**`useEffect`**
Hiệu ứng phụ chạy chỉ khi biến được chỉ định có sự thay đổi. Tránh render phung phí.
```javascript
import { useEffect } from "@odoo/owl";
setup() {
    useEffect(
        (status) => {
            if (status === 'done') { console.log('Thành công') }
        },
        () => [this.props.status] // Dependency Array: Khi `status` thay đổi mới kích hoạt chạy
    );
}
```

---

## 7. Tính Năng QWeb Slots (Khoét lỗ Giao Diện)

Trong nhiều trường hợp, bạn viết một UI Layout (ví dụ `Dialog` có header/body/footer) và bạn muốn tái sử dụng Layout này nhưng các component khác nhau có thể chèn nội dung khác nhau vào thân.
Đây là lúc `Slot` lên tiếng.

**Component Parent (MyDialog.xml)**
```xml
<div class="modal">
    <header><t t-slot="title"/></header>
    <main><t t-slot="default"/></main>
</div>
```

**Component Implementer (UserThaoTac.xml)**
```xml
<MyDialog>
    <t t-set-slot="title">
        <h1>Xác nhận Xóa User!</h1>
    </t>
    <t t-set-slot="default">
        <p>Bạn có chắc muốn xoá ko?</p>
    </t>
</MyDialog>
```

---

## 8. Registry (Hệ Thống Đăng Ký Odoo 16+)

Odoo Frontend sử dụng cơ chế `registry` để ghi danh các thành phần thay vì `export/import` chúng xuyên suốt nhau, giúp cấu trúc Odoo dễ được cài đè và extend ở đa module python mà ko vỡ mảng.

```javascript
import { registry } from "@web/core/registry";

// Bạn tạo component
export class MyDashboard extends Component {...}

// Bạn Đăng ký component đó vào danh mục `actions` với tên là tag "awesome_dashboard"
registry.category("actions").add("awesome_dashboard", MyDashboard);
```

Về sau, khi người dùng bấm Menu XML với `<field name="tag">awesome_dashboard</field>`, Odoo tự động chui vào trong `category("actions")`, lôi module của bạn ra rồi tống lên màn hình.

---

## Tổng kết Lại

-  **OWL** = React Lifecycle + Vue Reactivity + XML QWeb.
- **Thế mạnh:** Siêu nhẹ (vì ko xài Virtual DOM nặng nề, tốc độ siêu tốc), tách biệt Logic và File Views.
-  Cách làm việc: Bọn bạn thiết kế `State`, `Props` rõ ràng, bắt lifecycle ở `onWillStart` gởi yêu cầu Backend, rồi trả về map vào file XML bằng các vòng `t-foreach`, dán các hàm `t-on-click` và thả cho nó tự chạy!

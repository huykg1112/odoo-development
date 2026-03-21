# Trạm 1: Nền tảng JS / Owl Framework (`awesome_owl`)

Chào mừng bạn đến với **Owl**, UI Framework mạnh mẽ đứng sau toàn bộ giao diện của Odoo (từ bản 14 trở đi). Owl được thiết kế rất giống React/Vue với tư tưởng Component-based, nhưng được tối ưu riêng biệt để chạy mượt mà cùng kiến trúc của Odoo.

Bài viết này sẽ mổ xẻ code thực tế của thư mục `tutorials/awesome_owl` và đưa ra bài tập để bạn thực hành.

---

## 1. Dòng Chảy Khởi Chạy (The Lifecycle)

Làm sao để Odoo biết phải load code Javascript của bạn lên màn hình?
Trong module `awesome_owl`, đây là thứ tự xảy ra khi bạn gõ `http://localhost:8069/awesome_owl`:

1. **Trình duyệt** gọi đường dẫn `/awesome_owl`
2. **Controller (Python)** bắt được URL này -> Trả về giao diện HTML trắng (template `awesome_owl.playground`).
3. **Template (XML)** load toàn bộ tài nguyên (CSS, JS) của bộ bundle `assets_playground` (đã khai báo trong `__manifest__.py`).
4. **Main.js (Javascript)** chạy lúc trang web load xong -> Nó *mount* (treo) Component `Playground` vào thẻ `<body>`.
5. **Component `Playground` (JS + XML)** hiện chữ "hello world" ra màn hình.

---

## 2. Giải Phẫu Từng Dòng Code

Và đây là cách chúng được viết ra trong mã nguồn.

### File 1: `controllers/controllers.py`

Đây là nơi nhận request từ trình duyệt. Dùng cú pháp `@http.route`.

```python
from odoo import http
from odoo.http import request, route

class OwlPlayground(http.Controller):
    # Định nghĩa URL (/awesome_owl). type='http' nghĩa là trả về trang web. auth='public' ai cũng xem được
    @http.route(['/awesome_owl'], type='http', auth='public')
    def show_playground(self):
        """ Renders the owl playground page """
        # Gọi engine QWeb của Odoo để vẽ ra file XML có id là 'awesome_owl.playground'
        return request.render('awesome_owl.playground')
```

### File 2: `views/templates.xml`

Đây là bộ khung HTML mà Controller trả về.

```xml
<odoo>
    <data>
          <template id="awesome_owl.playground" name="Awesome T-Shirt thank you">
            <html>
                <head>
                    <!-- Load toàn bộ Code JS và CSS của bundle có tên là 'awesome_owl.assets_playground' -->
                    <t t-call-assets="awesome_owl.assets_playground"/>
                </head>
                <body>
                    <!-- Tạm thời để trống. JS Owl sẽ tự động bơm giao diện vào đây -->
                </body>
            </html>
          </template>
    </data>
</odoo>
```

### File 3: `static/src/main.js`

Đây là entrypoint, file khởi tạo thế giới Owl.

```javascript
/* Import 2 hàm cốt lõi: 1 để chờ trang HTML load xong, 1 để bơm giao diện vào màn hình */
import { whenReady } from "@odoo/owl";
import { mountComponent } from "@web/env";

/* Import Component đầu tay của chúng ta */
import { Playground } from "./playground";

const config = {
    dev: true, // Bật chế độ dev để dễ debug ra console
    name: "Owl Tutorial",
};

// Đợi DOM content load xong (thẻ <body> đã sẵn sàng), thì treo Component Playground vào body.
whenReady(() => mountComponent(Playground, document.body, config));
```

### File 4 & 5: Component `Playground` (Cốt lõi của Framework)

Bất kỳ Component Owl nào cũng thường đi theo Cặp: **1 file JS (tính toán)** và **1 file XML (giao diện)**.

**`static/src/playground.js`** (File Logic)
```javascript
/** @odoo-module **/  // BẮT BUỘC có dòng này ở đầu để Odoo hiểu đây là module JS ES6 mới

import { Component } from "@odoo/owl";

// Định nghĩa 1 Component kế thừa từ khuôn mẫu của Owl
export class Playground extends Component {
    // Trỏ Component này sang file giao diện XML (bên dưới)
    static template = "awesome_owl.playground";
}
```

**`static/src/playground.xml`** (File Giao Diện)
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!-- Tương tự vuejs hay react jsx, đây là file chèn biến HTML -->
<templates xml:space="preserve">
    <!-- Phải khớp với \`static template\` ở file JS -->
    <t t-name="awesome_owl.playground">
        <div class="p-3">
            hello world
        </div>
    </t>
</templates>
```

---

## 3. Bài Tập Nâng Cao: Xây Dựng Todo List Component

> Yêu cầu: Đừng để chữ `hello world` nhàm chán nữa! Biến `Playground` thành một chức năng Quản lý nhắc việc (Todo List) mini.
> 
> **Mục tiêu học tập:** Thêm state (biến), gán sự kiện (`t-on-click`), và dùng vòng lặp (`t-foreach`).

**Tính năng cần có:**
1. Một ô nhập liệu (input) để gõ việc cần làm.
2. Một nút "Thêm".
3. Danh sách hiển thị các việc đã thêm.
4. Bấm vào nút "Xóa" cạnh mỗi việc để làm biến mất nó.

> BẠN HÃY THỬ TỰ VIẾT TRÚT VÀO 2 FILE `playground.js` và `playground.xml` ĐỂ LUYỆN TẬP NHÉ! *Tip: Cần dùng thêm `useState` từ `@odoo/owl`.*

---

## 4. Hướng Dẫn Giải Chi Tiết Bài Tập Todo List

Đây là lời giải hoàn thiện với đầy đủ giải thích để bạn hiểu sức mạnh thao tác với Data trên View của Owl:

### File 1: Sửa lại `static/src/playground.js`
Chúng ta sẽ dùng `useState` (quản lý trạng thái) và `useRef` (lấy dữ liệu input HTML).

```javascript
/** @odoo-module **/

import { Component, useState, useRef } from "@odoo/owl";

export class Playground extends Component {
    static template = "awesome_owl.playground";

    // Hàm setup() dùng để khởi tạo biến sẽ dùng trong Component
    setup() {
        // 1. Dùng useRef để "bắt" dính vào cái thẻ input (giống document.getElementById)
        this.inputRef = useRef("todo_input");
        
        // 2. Dùng useState chứa danh sách Todo. Khi biến này thay đổi, Odoo sẽ tự vẽ lại View
        this.state = useState({
            tasks: [
                { id: 1, text: "Học Owl Component" },
                { id: 2, text: "Viết Hướng Dẫn Odoo" }
            ],
            nextId: 3 // Dùng để đánh số ID cho các task mới
        });
    }

    // Hàm tạo task mới, sẽ được gọi khi bấm nút "Thêm"
    addTask(ev) {
        const text = this.inputRef.el.value; // Lấy chữ người dùng vừa gõ
        if (text) {
            // Đẩy thêm vào mảng tasks
            this.state.tasks.push({ id: this.state.nextId++, text: text });
            // Cập nhật lại list và xóa trắng ô input
            this.inputRef.el.value = "";
        }
    }

    // Hàm xóa task
    removeTask(taskId) {
        // Lọc bỏ cái task mang ID truyền vào
        this.state.tasks = this.state.tasks.filter((t) => t.id !== taskId);
    }
}
```

### File 2: Sửa lại `static/src/playground.xml`

Sử dụng vòng lặp `t-foreach` và bắt sự kiện `t-on-click`. Nếu dùng biến (đã gán trong JS), phải thêm chữ `t-esc` hoặc viết biểu thức trong ngặc nhọn.

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<templates xml:space="preserve">

    <t t-name="awesome_owl.playground">
        <div class="p-3 w-50">
            <h2>Quản lý Công Việc (Odoo Owl)</h2>
            
            <div class="d-flex mb-3">
                <!-- useRef("todo_input") ở JS sẽ kết nối với thẻ có t-ref="todo_input" này -->
                <input t-ref="todo_input" type="text" class="form-control me-2" placeholder="Thêm việc cần làm..."/>
                
                <!-- Bắt sự kiện bấm nút click chuột: t-on-click -->
                <button class="btn btn-primary" t-on-click="addTask">Thêm</button>
            </div>

            <ul class="list-group">
                <!-- t-foreach loop mảng this.state.tasks, đặt tên biến lặp là task -->
                <t t-foreach="state.tasks" t-as="task" t-key="task.id">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        
                        <!-- Hiển thị text của từng task bằng t-esc -->
                        <span t-esc="task.text"/>
                        
                        <!-- Gọi hàm xóa task, truyền vào task.id. Dùng arrow function! -->
                        <button class="btn btn-sm btn-danger" t-on-click="() => this.removeTask(task.id)">Xóa</button>
                    </li>
                </t>
            </ul>
        </div>
    </t>

</templates>
```

> Thật đơn giản phải không? Chỉ với vài chục dòng code, bạn đã nắm vững cách Odoo **nhận diện State Component, render mảng thông minh (qua t-foreach) và thiết lập Event (qua t-on-click)**. Đây là kỹ năng CỐT LÕI nhất để custom mọi giao diện trên Odoo 16+ đấy! 🦉 

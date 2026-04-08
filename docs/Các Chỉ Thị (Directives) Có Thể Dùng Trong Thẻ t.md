# Các Chỉ Thị (Directives) Có Thể Dùng Trong Thẻ `<t>` — QWeb Template Engine

> **Phiên bản:** Odoo 18.0 | **Framework:** OWL 2 (Odoo Web Library)
> **Nguồn tham chiếu:** Source code `odoo/addons/web/static/src/` và OWL documentation

---

## Tổng quan: Thẻ `<t>` là gì?

Thẻ `<t>` trong Odoo QWeb tương tự **React Fragment** (`<>...</>`) — nó là một thẻ **"vô hình"** không tạo ra bất kỳ phần tử DOM nào. Mục đích duy nhất của nó là **làm nơi gắn (host) các directive** khi bạn không muốn sinh thêm thẻ HTML thừa vào DOM.

**Lưu ý quan trọng:** Hầu hết các directive dưới đây **không bắt buộc phải dùng trên thẻ `<t>`**. Bạn hoàn toàn có thể gắn chúng trực tiếp lên thẻ HTML thông thường:

```xml
<!-- Dùng trên thẻ <t> – không tạo thẻ DOM -->
<t t-if="isVisible">
    <span>Hello</span>
</t>

<!-- Dùng trực tiếp trên thẻ HTML – kết quả tương đương nhưng có thẻ <div> bọc ngoài -->
<div t-if="isVisible">
    <span>Hello</span>
</div>
```

---

## 1. Nhóm Khai Báo Template (`t-name`, `t-inherit`)

Các directive dùng để **định nghĩa** và **kế thừa** template.

### `t-name` — Đặt tên cho template

```xml
<t t-name="my_module.MyComponent">
    <div>Nội dung component</div>
</t>
```

- Mỗi component OWL cần một template với `t-name` trùng với giá trị `static template = "..."` trong file JS.
- Quy ước đặt tên: `tên_module.TênComponent`.

### `t-inherit` và `t-inherit-mode` — Kế thừa template

Cho phép một template **kế thừa và sửa đổi** template khác (tương tự template inheritance trong Python Odoo views). Có 2 chế độ:

- **`t-inherit-mode="primary"`**: Tạo template MỚI dựa trên template gốc, template gốc không bị ảnh hưởng.
- **`t-inherit-mode="extension"`** (mặc định): Sửa đổi trực tiếp template gốc, mọi nơi dùng template gốc đều nhận thay đổi.

```xml
<!-- Ví dụ thực tế từ Odoo source: tạo SettingsFormView kế thừa từ FormView -->
<t t-name="web.SettingsFormView" t-inherit="web.FormView" t-inherit-mode="primary">
    <xpath expr="//div[@class='o_form_view']" position="attributes">
        <attribute name="class">o_form_view o_settings_form_view</attribute>
    </xpath>
</t>
```

Bên trong template kế thừa, bạn dùng `<xpath>` giống hệt kế thừa view XML thông thường.

---

## 2. Nhóm Điều Khiển Luồng (Conditionals)

**So sánh React:** Tương đương `{condition && <Component/>}` hoặc toán tử `? :` trong JSX.

### `t-if` — Hiển thị nếu điều kiện đúng (truthy)

```xml
<t t-if="state.isLoading">
    <div class="spinner">Đang tải...</div>
</t>
```

### `t-elif` — Nhánh điều kiện phụ

```xml
<t t-if="state.status === 'success'">
    <span class="text-success">Thành công!</span>
</t>
<t t-elif="state.status === 'error'">
    <span class="text-danger">Có lỗi xảy ra</span>
</t>
```

### `t-else` — Nhánh còn lại (fallback)

```xml
<t t-if="records.length > 0">
    <ul>...</ul>
</t>
<t t-else="">
    <p>Không có dữ liệu</p>
</t>
```

> **Lưu ý:** `t-else` phải viết là `t-else=""` (có giá trị rỗng) — khác với HTML thuần, XML không cho phép thuộc tính không có giá trị.

**Ví dụ thực tế từ Odoo `layout.xml`:**
```xml
<t t-if="env.inDialog" t-portal="'#' + env.dialogId + ' .modal-footer'">
    <t t-slot="layout-buttons"/>
</t>
```

---

## 3. Nhóm Vòng Lặp (Loops)

**So sánh React:** Tương đương `Array.map()` trong JSX.

### `t-foreach` + `t-as` + `t-key` — Lặp qua mảng/object

**Bắt buộc phải có `t-key`** (giống `key` trong React) để OWL tối ưu re-render.

```xml
<ul>
    <t t-foreach="items" t-as="item" t-key="item.id">
        <li><t t-esc="item.name"/></li>
    </t>
</ul>
```

**Các biến ngầm (implicit variables) có sẵn bên trong vòng lặp:**

| Biến | Mô tả | Ví dụ |
|------|--------|-------|
| `item` | Giá trị phần tử hiện tại | `"Hello"` |
| `item_index` | Vị trí (0-based) | `0, 1, 2...` |
| `item_first` | `true` nếu là phần tử đầu tiên | `true/false` |
| `item_last` | `true` nếu là phần tử cuối | `true/false` |
| `item_value` | Giống `item` (dùng khi lặp object) | — |
| `item_size` | Tổng số phần tử | `5` |

> **Ghi chú:** `item` ở đây là tên bạn đặt trong `t-as`. Nếu bạn viết `t-as="record"` thì các biến sẽ là `record_index`, `record_first`, v.v.

**Lặp qua Object:**
```xml
<!-- Khi t-foreach nhận một object, t-as sẽ nhận KEY, dùng _value để lấy VALUE -->
<t t-foreach="{'s': 10, 'm': 20, 'l': 15}" t-as="size" t-key="size">
    <p>Size <t t-esc="size"/>: <t t-esc="size_value"/> chiếc</p>
</t>
<!-- Kết quả: Size s: 10 chiếc, Size m: 20 chiếc, Size l: 15 chiếc -->
```

**Ví dụ thực tế từ Odoo `search_bar.xml`:**
```xml
<t t-foreach="env.searchModel.facets" t-as="facet" t-key="facet_index">
    ...
</t>
```

---

## 4. Nhóm Hiển Thị Dữ Liệu (Data Output)

**So sánh React:** Tương đương `{variable}` trong JSX.

### `t-esc` — In giá trị an toàn (escaped)

Tự động **escape** các ký tự HTML đặc biệt (`<`, `>`, `&`, `"`) để **chống XSS**. Đây là cách hiển thị dữ liệu **khuyến nghị mặc định**.

```xml
<!-- Nếu state.name = "<script>alert('xss')</script>" -->
<p t-esc="state.name"/>
<!-- Kết quả rendered: &lt;script&gt;alert('xss')&lt;/script&gt; (an toàn!) -->
```

Có thể dùng trực tiếp trên thẻ HTML hoặc trên thẻ `<t>`:
```xml
<span t-esc="statistics.total_amount"/>
<!-- hoặc -->
<t t-esc="statistics.total_amount"/>
```

### `t-out` — In giá trị (có thể render HTML thô nếu dùng `markup()`)

`t-out` hoạt động **giống `t-esc`** theo mặc định (escape HTML). Nhưng khi kết hợp với hàm `markup()` trong JavaScript, nó cho phép **render HTML thô**.

```javascript
// Trong file JS:
import { markup } from "@odoo/owl";
this.richContent = markup("<strong>In đậm</strong>");
```

```xml
<!-- Trong template -->
<t t-out="richContent"/>
<!-- Kết quả: <strong>In đậm</strong> (render thành chữ in đậm) -->
```

> **Cảnh báo:** `t-raw` đã bị **xóa bỏ (deprecated)** từ các phiên bản Odoo gần đây vì lý do bảo mật. Thay thế bằng `t-out` + `markup()`.

---

## 5. Nhóm Khai Báo Biến (Variables)

**So sánh React:** Tương đương `const variable = expression;` trong function body.

### `t-set` + `t-value` — Tạo biến cục bộ trong template

```xml
<!-- Gán giá trị expression -->
<t t-set="totalPrice" t-value="item.price * item.quantity"/>
<p>Tổng: <t t-esc="totalPrice"/> VND</p>
```

### `t-set` với nội dung body — Gán nội dung HTML/text

Nếu không dùng `t-value`, nội dung bên trong thẻ `t-set` sẽ trở thành giá trị (dạng chuỗi hoặc DOM fragment):

```xml
<t t-set="greeting">
    <strong>Xin chào!</strong>
</t>
<t t-out="greeting"/>
```

**Ví dụ thực tế từ Odoo (dashboard tutorial):**
```xml
<t t-set="itemProp" t-value="item.props ? item.props(statistics) : {'data': statistics}"/>
<t t-component="item.Component" t-props="itemProp"/>
```

---

## 6. Nhóm Thuộc Tính Động (Dynamic Attributes)

**So sánh React:** Tương đương `className={expr}`, `style={obj}`, `{...props}` trong JSX.

### `t-att-*` — Gán thuộc tính HTML động bằng expression

Thêm tiền tố `t-att-` trước tên thuộc tính bất kỳ. Giá trị là biểu thức JavaScript.

```xml
<!-- Tương đương React: <img src={user.avatarUrl} alt={user.name} /> -->
<img t-att-src="user.avatarUrl" t-att-alt="user.name"/>

<!-- Dùng với class có điều kiện -->
<div t-att-class="{ 'active': isSelected, 'disabled': !isAllowed }"/>
```

> **Đặc biệt cho `t-att-class`:** Nhận cả chuỗi string hoặc object `{ className: boolean }`:
> ```xml
> <!-- Object → thêm/bỏ class dựa trên điều kiện -->
> <div class="btn" t-att-class="{ 'btn-primary': isPrimary, 'btn-disabled': !enabled }"/>
> <!-- String → gán trực tiếp -->
> <div t-att-class="'text-' + color"/>
> ```

**Ví dụ thực tế (Odoo switch_company_item.xml):**
```xml
<span class="btn border-0 px-2" 
      t-att-class="isCompanyAllowed ? 'btn-link text-primary' : 'disabled'">
```

### `t-attf-*` — Gán thuộc tính với Format String (chuỗi nội suy)

Cho phép **nội suy** biến bên trong chuỗi bằng `{{ expression }}` hoặc `#{ expression }`.

```xml
<!-- Format string với {{ }} -->
<div t-attf-class="o_kanban_card bg-{{ color }}"/>

<!-- Format string với #{ } (cú pháp tương đương) -->
<a t-attf-href="/web#action=#{action_id}"/>
```

**Ví dụ thực tế (Odoo list_renderer.xml):**
```xml
<table t-attf-class="o_list_table table table-sm table-hover 
    {{props.list.isGrouped ? 'o_list_table_grouped' : 'o_list_table_ungrouped table-striped'}}"/>
```

**So sánh `t-att-` vs `t-attf-`:**

| Directive | Input | Output ví dụ |
|-----------|-------|-------------|
| `t-att-class="myClass"` | Expression JS trả về string/object | `"btn btn-primary"` |
| `t-attf-class="btn btn-{{ type }}"` | Chuỗi nội suy (interpolation) | `"btn btn-primary"` |
| `t-att-style="{ color: 'red' }"` | ❌ Không hỗ trợ object cho style | Dùng string |
| `t-attf-style="color: {{ myColor }}"` | ✅ Nội suy chuỗi CSS | `"color: red"` |

---

## 7. Nhóm Gọi Template Bổ Sung (Template Composition)

**So sánh React:** Tương đương `import + <ChildComponent/>`.

### `t-call` — Render template khác vào vị trí hiện tại

```xml
<t t-call="website.layout"/>
```

Khi dùng `t-call`, template được gọi sẽ:
1. Kế thừa **tất cả biến** từ scope hiện tại.
2. Có thể nhận biến bổ sung bằng cách đặt `t-set` bên trong body:

```xml
<t t-call="my_module.card_template">
    <t t-set="title" t-value="'Dashboard'"/>
    <t t-set="subtitle" t-value="'Statistics'"/>
</t>
```

Nội dung body (bất cứ thứ gì không phải `t-set`) sẽ được truyền vào biến `0` (zero) bên trong template được gọi:

```xml
<!-- Template được gọi -->
<t t-name="my_module.wrapper">
    <div class="wrapper">
        <t t-out="0"/>  <!-- Nội dung body sẽ xuất hiện ở đây -->
    </div>
</t>

<!-- Nơi gọi -->
<t t-call="my_module.wrapper">
    <p>Nội dung này sẽ được render bên trong div.wrapper</p>
</t>
```

### `t-call-assets` — Load asset bundle (chỉ dùng Server-side)

Dùng để nhúng CSS/JS bundles trong template HTML server-side.

```xml
<!-- Ví dụ thực tế từ webclient_templates.xml -->
<t t-call-assets="web.assets_web" media="screen"/>
<t t-call-assets="web.assets_frontend" t-js="false"/>  <!-- Chỉ load CSS -->
<t t-call-assets="web.assets_frontend_minimal" t-css="false" defer_load="True"/>  <!-- Chỉ load JS -->
```

---

## 8. Nhóm Tương Tác & Reactivity — OWL Specific

### `t-on-*` — Lắng nghe sự kiện DOM (Event Handling)

**So sánh React:** Tương đương `onClick`, `onChange`, `onKeyDown`...

```xml
<button t-on-click="increment">+1</button>
<input t-on-input="onSearch" t-on-keydown="onKeydown"/>
```

#### Event Modifiers (Bộ điều chỉnh sự kiện)

OWL hỗ trợ **modifier** bằng dấu `.` sau tên sự kiện — giúp tránh phải gọi `event.preventDefault()` hay `event.stopPropagation()` bằng code JS:

| Modifier | Tương đương JS | Ví dụ |
|----------|----------------|-------|
| `.prevent` | `event.preventDefault()` | `t-on-click.prevent="onClick"` |
| `.stop` | `event.stopPropagation()` | `t-on-click.stop="onClick"` |
| `.self` | Chỉ khi target === currentTarget | `t-on-click.self="onClick"` |
| `.capture` | Dùng capture phase | `t-on-click.capture="onClick"` |

**Kết hợp nhiều modifiers:**
```xml
<!-- Từ Odoo list_renderer.xml: vừa stop vừa prevent -->
<button t-on-click.stop.prevent="() => this.add({ context: create.context })">
    Add a line
</button>
```

### `t-ref` — Tham chiếu phần tử DOM (References)

**So sánh React:** Tương đương `useRef()`.

```xml
<!-- Template -->
<canvas t-ref="chartCanvas"/>

<!-- Hoặc trên thẻ t -->
<t t-ref="mySection"/>
```

```javascript
// Trong file JS
import { useRef, onMounted } from "@odoo/owl";

setup() {
    this.canvasRef = useRef("chartCanvas");
    onMounted(() => {
        const canvas = this.canvasRef.el; // Truy cập DOM element
        // Vẽ chart lên canvas...
    });
}
```

### `t-key` — Khóa duy nhất cho VirtualDOM diff

**So sánh React:** Tương đương `key={id}` trong `.map()`.

Dùng cùng `t-foreach` để giúp OWL biết phần tử nào bị thêm/xóa/di chuyển:

```xml
<t t-foreach="records" t-as="record" t-key="record.id">
    <RecordCard record="record"/>
</t>
```

`t-key` cũng có thể dùng **ngoài vòng lặp** để ép OWL **phá hủy và tạo lại** component khi key thay đổi:

```xml
<!-- Khi recordId thay đổi, component sẽ bị unmount + mount lại hoàn toàn -->
<FormView t-key="recordId" recordId="recordId"/>
```

### `t-model` — Ràng buộc dữ liệu hai chiều (Two-way Binding)

**So sánh React:** Tương đương Controlled Component (`value` + `onChange`), hoặc `v-model` trong Vue.

```xml
<input type="text" t-model="state.name" placeholder="Nhập tên..."/>
<select t-model="state.selectedOption">
    <option value="a">Option A</option>
    <option value="b">Option B</option>
</select>
<input type="checkbox" t-model="state.isChecked"/>
```

#### `t-model` Modifiers:

| Modifier | Mô tả | Ví dụ |
|----------|--------|-------|
| `.trim` | Tự động `trim()` whitespace đầu/cuối | `t-model.trim="state.name"` |
| `.number` | Tự động convert thành Number | `t-model.number="state.age"` |
| `.lazy` | Chỉ update khi `change` event (thay vì `input`) | `t-model.lazy="state.name"` |

**Ví dụ thực tế (Odoo control_panel.xml):**
```xml
<input type="text" 
       t-model.trim="state.embeddedInfos.newActionName" 
       class="o_input"/>
```

### `t-component` + `t-props` — Component động (Dynamic Component)

**So sánh React:** Tương đương render dynamic component `<ComponentVar {...props} />`.

```xml
<!-- Render component dựa trên biến, không biết trước tên component -->
<t t-component="item.Component" t-props="itemProp"/>
```

`t-component` nhận giá trị là **class/constructor** của component (không phải string tên). Trong tutorial awesome_dashboard:

```xml
<t t-foreach="items" t-as="item" t-key="item.id">
    <DashboardItem size="item.size || 1">
        <t t-set="itemProp" t-value="item.props ? item.props(statistics) : {'data': statistics}"/>
        <t t-component="item.Component" t-props="itemProp"/>
    </DashboardItem>
</t>
```

### `t-portal` — Render ra vị trí khác trên DOM

**So sánh React:** Tương đương `ReactDOM.createPortal(children, container)`.

Hữu ích cho Modal, Dropdown, Tooltip... cần render nội dung ra ngoài cây component hiện tại (thường lên `<body>`).

```xml
<t t-portal="'body'">
    <div class="o_app_menu_sidebar">
        <!-- Sidebar được render trực tiếp vào body, không bị chứa trong component parent -->
    </div>
</t>
```

Giá trị của `t-portal` là **CSS selector string** chỉ định element đích:

**Ví dụ thực tế (Odoo navbar.xml):**
```xml
<!-- Render sidebar app menu vào body -->
<t t-portal="'body'">
    <div class="o_app_menu_sidebar position-fixed ...">
        ...
    </div>
</t>
```

**Ví dụ thực tế (Odoo layout.xml) — portal vào dialog footer:**
```xml
<t t-if="env.inDialog" t-portal="'#' + env.dialogId + ' .modal-footer'">
    <t t-slot="layout-buttons"/>
</t>
```

### `t-slot` + `t-set-slot` — Hệ thống Slot (Content Projection)

**So sánh React:** Tương đương `props.children` hoặc render props pattern.

#### Phía Component con — Khai báo slot bằng `t-slot`:
```xml
<!-- DashboardItem component template -->
<t t-name="awesome_dashboard.DashboardItem">
    <div class="card">
        <div class="card-body">
            <t t-slot="default"/>  <!-- Nội dung mặc định được inject vào đây -->
        </div>
    </div>
</t>
```

#### Phía Component cha — Inject nội dung bằng `t-set-slot`:
```xml
<Layout display="{controlPanel: {}}" className="'o_dashboard h-100'">
    <t t-set-slot="layout-buttons">
        <button class="btn btn-primary" t-on-click="openCustomers">Customers</button>
        <button class="btn btn-primary" t-on-click="openLeads">Leads</button>
    </t>
    <!-- Nội dung không có t-set-slot sẽ được inject vào slot "default" -->
    <div class="content">Hello dashboard</div>
</Layout>
```

#### `t-slot-scope` — Scoped Slot (Slot có dữ liệu)

**So sánh React:** Tương đương render props `(data) => <Component data={data}/>`.

Cho phép component con **truyền dữ liệu ngược lên** cho phần nội dung được inject. Biến `scope` chứa dữ liệu do component con cung cấp:

```xml
<!-- Component cha dùng slot có scope -->
<WithSearch t-props="withSearchProps" t-slot-scope="search">
    <Renderer searchModel="search.searchModel"/>
</WithSearch>
```

**Ví dụ thực tế (Odoo view.xml):**
```xml
<WithSearch t-props="withSearchProps" t-slot-scope="search">
    <!-- Biến 'search' chứa data được truyền từ WithSearch component -->
</WithSearch>
```

---

## 9. Nhóm Tag Động (`t-tag`)

**So sánh React:** Tương đương `const Tag = isHeader ? 'h1' : 'p'; return <Tag>...</Tag>`

### `t-tag` — Render thẻ HTML dựa trên biến

```xml
<!-- Render thành <a> nếu có href, ngược lại render thành <span> -->
<t t-tag="props.attrs and props.attrs.href ? 'a' : 'span'">
    Menu Item
</t>
```

**Ví dụ thực tế (Odoo view_button.xml):**
```xml
<t t-tag="props.tag"
   t-att-type="props.tag === 'button' ? 'button' : undefined"
   t-att-class="classNames"
   t-on-click.stop="onClick">
    <t t-if="icon" t-tag="icon.tag" t-att-class="icon.class" t-att-src="icon.src"/>
    <t t-if="props.string" t-esc="props.string"/>
</t>
```

---

## 10. Nhóm Tối Ưu Hiệu Suất (Server-side Caching)

> ⚠️ Nhóm này **chỉ hoạt động ở Server-side QWeb rendering** (template Python), KHÔNG dùng trong OWL client-side.

### `t-cache` — Cache đoạn HTML đã render

```xml
<footer t-cache="no_footer,no_copyright" t-if="not no_footer" class="bg-light o_footer">
    <!-- Nội dung footer phức tạp, cache theo biến no_footer và no_copyright -->
</footer>
```

Sau lần render đầu tiên, Odoo lưu kết quả HTML vào bộ nhớ đệm. Các lần truy cập sau sẽ dùng cached HTML mà không cần query DB lại. Key cache được tạo từ các biến liệt kê trong `t-cache`.

### `t-nocache` — Đánh dấu đoạn KHÔNG được cache

Dùng bên trong một khối `t-cache` lớn, một đoạn nhỏ **buộc phải render lại mỗi lần** (VD: CSRF token, thông tin user):

```xml
<!-- Ví dụ thực tế: CSRF token luôn phải cập nhật -->
<t t-nocache="The csrf token must always be up to date." t-esc="request.csrf_token(None)"/>

<!-- Session info luôn phải cập nhật -->
<script t-nocache="Session information should always be up to date." type="text/javascript">
    var odoo = { ... };
</script>
```

---

## 11. Bảng Tổng Hợp — Tất Cả Directives

| # | Directive | Loại | Ngữ cảnh | So sánh React/Vue |
|---|-----------|------|----------|-------------------|
| 1 | `t-name` | Khai báo | OWL + Server | — |
| 2 | `t-inherit` | Khai báo | OWL + Server | HOC pattern |
| 3 | `t-inherit-mode` | Khai báo | OWL + Server | — |
| 4 | `t-if` | Điều kiện | OWL + Server | `{cond && <X/>}` |
| 5 | `t-elif` | Điều kiện | OWL + Server | chained ternary |
| 6 | `t-else` | Điều kiện | OWL + Server | `: <Y/>` |
| 7 | `t-foreach` | Vòng lặp | OWL + Server | `.map()` |
| 8 | `t-as` | Vòng lặp | OWL + Server | callback param |
| 9 | `t-key` | Vòng lặp / Diffing | OWL | `key={id}` |
| 10 | `t-esc` | Output | OWL + Server | `{variable}` (escaped) |
| 11 | `t-out` | Output | OWL + Server | `dangerouslySetInnerHTML` (with `markup()`) |
| 12 | `t-set` | Biến | OWL + Server | `const x = ...` |
| 13 | `t-value` | Biến | OWL + Server | expression value |
| 14 | `t-att-*` | Thuộc tính | OWL + Server | `attr={expr}` |
| 15 | `t-attf-*` | Thuộc tính | OWL + Server | Template literal |
| 16 | `t-call` | Composition | OWL + Server | `<Component/>` |
| 17 | `t-call-assets` | Assets | Server only | — |
| 18 | `t-on-*` | Sự kiện | OWL only | `onClick={fn}` |
| 19 | `t-ref` | Reference | OWL only | `useRef()` |
| 20 | `t-model` | Two-way binding | OWL only | `v-model` (Vue) |
| 21 | `t-component` | Dynamic component | OWL only | `<Comp/>` dynamic |
| 22 | `t-props` | Props | OWL only | `{...props}` |
| 23 | `t-portal` | DOM mounting | OWL only | `createPortal()` |
| 24 | `t-slot` | Slot (định nghĩa) | OWL only | `props.children` |
| 25 | `t-set-slot` | Slot (inject) | OWL only | children JSX |
| 26 | `t-slot-scope` | Scoped slot | OWL only | render props |
| 27 | `t-tag` | Dynamic tag | OWL + Server | dynamic JSX element |
| 28 | `t-cache` | Caching | Server only | — |
| 29 | `t-nocache` | Anti-caching | Server only | — |

---

## 12. Lưu Ý Quan Trọng

### Directive trên `<t>` vs trên thẻ HTML thường

- **Dùng `<t>`** khi bạn cần áp dụng logic (if, foreach, set) **mà không muốn tạo thêm thẻ DOM**.
- **Dùng trên thẻ HTML** khi thẻ đó vốn đã cần tồn tại trong DOM.

```xml
<!-- ✅ Tốt: dùng <t> vì không cần thẻ bọc -->
<t t-foreach="items" t-as="item" t-key="item.id">
    <li t-esc="item.name"/>
</t>

<!-- ❌ Thừa: tạo thêm <div> không cần thiết -->
<div t-foreach="items" t-as="item" t-key="item.id">
    <li t-esc="item.name"/>
</div>
```

### Phân biệt OWL (Client-side) vs Server-side QWeb

| Tính năng | OWL (Client) | Server Python |
|-----------|-------------|---------------|
| `t-on-*` | ✅ | ❌ |
| `t-model` | ✅ | ❌ |
| `t-component` | ✅ | ❌ |
| `t-portal` | ✅ | ❌ |
| `t-slot` | ✅ | ❌ |
| `t-cache` | ❌ | ✅ |
| `t-call-assets` | ❌ | ✅ |
| `t-if/foreach/esc/set` | ✅ | ✅ |
| `t-att-*/t-attf-*` | ✅ | ✅ |

### XML vs JSX: Điểm khác biệt cần nhớ

| XML QWeb | JSX React |
|----------|-----------|
| `t-att-class="{ active: true }"` | `className={active ? 'active' : ''}` |
| `t-on-click="methodName"` | `onClick={this.methodName}` |
| `t-else=""` (phải có giá trị rỗng) | Không có tương đương trực tiếp |
| `t-foreach` + `t-as` + `t-key` | `.map((item) => <X key={} />)` |
| Thuộc tính boolean: `t-att-disabled="true"` | `disabled={true}` |

# Hướng Dẫn Thực Hành: Create a Gallery View — Odoo 18.0

> **Tutorial:** [Master the Odoo Web Framework — Chapter 2](https://www.odoo.com/documentation/18.0/developer/tutorials/master_odoo_web_framework/02_create_gallery_view.html)
> **Module:** `awesome_gallery` (tại `tutorials/awesome_gallery/`)
> **Solutions:** [GitHub — odoo/tutorials (18.0-solutions)](https://github.com/odoo/tutorials/commits/18.0-master-odoo-web-framework-solutions/awesome_gallery)

---

## Tổng Quan Kiến Trúc View trong Odoo

Trước khi bắt đầu, hãy hiểu rõ **anatomy** của một custom view trong Odoo. Mỗi view bao gồm các tầng sau:

```
┌─────────────────────────────────────────┐
│              View Object                │  ← gallery_view.js
│  { type, display_name, icon, Ctrl... }  │  Đăng ký vào registry "views"
├─────────────────────────────────────────┤
│              ArchParser                 │  ← gallery_arch_parser.js
│  Đọc thuộc tính từ <gallery .../> arch  │  Chạy một lần khi load view
├─────────────────────────────────────────┤
│              Controller                 │  ← gallery_controller.js/.xml
│  Quản lý lifecycle, kết nối Model/View  │  Component gốc
├──────────────────┬──────────────────────┤
│      Model       │      Renderer        │  ← gallery_model.js
│  Fetch data, ORM │  Hiển thị records    │  ← gallery_renderer.js/.xml
└──────────────────┴──────────────────────┘
```

### Những gì đã có sẵn trong module:

| File | Nội dung |
|------|----------|
| `static/src/gallery_view.js` | Placeholder rỗng (chỉ có comment `// TODO`) |
| `views/views.xml` | Action `contacts.action_contacts` với `view_mode` chưa có `gallery` |
| `models/ir_ui_view.py` | Đã thêm `gallery` vào `type` selection của `ir.ui.view` |
| `models/ir_action.py` | Server-side support cho view type mới |

### Cấu trúc file sẽ tạo:

```
awesome_gallery/
├── models/
│   ├── ir_action.py          # Đã có sẵn
│   ├── ir_ui_view.py         # Đã có sẵn
├── static/src/
│   ├── gallery_view.js       # Đã có sẵn (rỗng) → Bài 1
│   ├── gallery_controller.js # Bài 1
│   ├── gallery_controller.xml# Bài 1
│   ├── gallery_arch_parser.js# Bài 3
│   ├── gallery_model.js      # Bài 6
│   ├── gallery_renderer.js   # Bài 6
│   └── gallery_renderer.xml  # Bài 6
├── views/
│   └── views.xml             # Bài 1: thêm gallery vào view_mode
└── rng/
    └── gallery_view.rng      # Bài 12: validation schema
```

---

## Bài 1: Make a Hello World View

> **Mục tiêu:** Đăng ký view type `gallery` để Odoo nhận ra, hiện thứ "hello world" khi chuyển sang gallery view.
>
> **Kỹ năng:** View registry, view object structure, basic Controller component.

### Lý thuyết

Để tạo một view mới trong Odoo, bạn cần **đăng ký nó vào `registry.category("views")`** với một object mô tả view. Object này có các key:

| Key | Ý nghĩa |
|-----|---------|
| `type` | Tên loại view (phải khớp với `gallery` trong XML arch) |
| `display_name` | Tên hiển thị trong UI |
| `icon` | CSS class của icon trong view switcher |
| `multiRecord` | `true` = hiển thị nhiều record (list/kanban), `false` = single record (form) |
| `Controller` | Component OWL sẽ được render |

### 1.1 Tạo `gallery_controller.js`

```javascript
/** @odoo-module **/

import { Component } from "@odoo/owl";

export class GalleryController extends Component {
    static template = "awesome_gallery.GalleryController";
    static props = ["*"]; // Nhận tất cả props từ framework
}
```

### 1.2 Tạo `gallery_controller.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-name="awesome_gallery.GalleryController">
        <div class="o_gallery_controller">
            <h1>Hello, Gallery View!</h1>
        </div>
    </t>
</templates>
```

### 1.3 Cập nhật `gallery_view.js`

```javascript
/** @odoo-module **/

import { registry } from "@web/core/registry";
import { GalleryController } from "./gallery_controller";

export const galleryView = {
    type: "gallery",
    display_name: "Gallery",
    icon: "oi oi-view-kanban",  // Dùng icon kanban hoặc bất kỳ oi-* nào
    multiRecord: true,
    Controller: GalleryController,
};

registry.category("views").add("gallery", galleryView);
```

### 1.4 Cập nhật `views/views.xml` — Thêm gallery vào action

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
<data>
    <record id="contacts.action_contacts" model="ir.actions.act_window">
        <field name="name">Contacts</field>
        <field name="res_model">res.partner</field>
        <!-- Thêm "gallery" vào danh sách view_mode -->
        <field name="view_mode">kanban,tree,form,activity,gallery</field>
        <field name="search_view_id" ref="base.view_res_partner_filter"/>
        <field name="context">{'default_is_company': True}</field>
        <field name="help" type="html">
          <p class="o_view_nocontent_smiling_face">
            Create a Contact in your address book
          </p><p>
            Odoo helps you track all activities related to your contacts.
          </p>
        </field>
    </record>
</data>
</odoo>
```

### Kiểm tra

1. Restart server và cập nhật module: `--update=awesome_gallery`
2. Mở **Contacts** → Bạn sẽ thấy icon Gallery trong view switcher (góc trên phải).
3. Click vào icon Gallery → Thấy "Hello, Gallery View!".

---

## Bài 2: Use the Layout Component

> **Mục tiêu:** Bọc nội dung trong `Layout` component để có đầy đủ control bar, breadcrumb như các view khác.
>
> **Kỹ năng:** `Layout` component, `display` prop.

### Lý thuyết

`Layout` từ `@web/views/layout` cung cấp cấu trúc chuẩn của một view:
- **Control Panel** (breadcrumb, buttons, pager)
- **Content area** (nơi render records)
- **Search Panel** (bộ lọc bên trái)

Props quan trọng: `display` (nhận từ `this.props.display`) kiểm soát panel nào được hiển thị.

### 2.1 Cập nhật `gallery_controller.js`

```javascript
/** @odoo-module **/

import { Component } from "@odoo/owl";
import { Layout } from "@web/views/layout";

export class GalleryController extends Component {
    static template = "awesome_gallery.GalleryController";
    static components = { Layout };
    static props = ["*"];
}
```

### 2.2 Cập nhật `gallery_controller.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-name="awesome_gallery.GalleryController">
        <Layout display="props.display">
            <!-- Nội dung gallery sẽ đặt ở đây (default slot) -->
            <div class="p-4">
                <h2>Gallery Content</h2>
            </div>
        </Layout>
    </t>
</templates>
```

> **Lưu ý:** `props.display` được framework truyền tự động vào controller, chứa thông tin về các panel nào cần hiển thị.

---

## Bài 3: Parse the Arch

> **Mục tiêu:** Đọc thuộc tính `image_field` từ XML arch definition của gallery view.
>
> **Kỹ năng:** ArchParser pattern, truyền parsed data qua view object.

### Lý thuyết

**Arch** là phần XML mô tả cấu trúc view trong database. Ví dụ:
```xml
<gallery image_field="image_1920"/>
```

**ArchParser** là class chịu trách nhiệm parse XML này thành một JavaScript object để controller có thể sử dụng. Pattern này theo đúng thiết kế của tất cả Odoo views (list, kanban, graph...).

Luồng hoạt động:
```
XML arch string
    → ArchParser.parse(xmlDoc)
    → { imageField: "image_1920", ... }
    → truyền vào Controller dưới dạng props
```

### 3.1 Tạo `gallery_arch_parser.js`

```javascript
/** @odoo-module **/

export class GalleryArchParser {
    /**
     * Parse arch XML element thành object props cho controller
     * @param {Element} xmlDoc - XML element <gallery .../>
     * @returns {Object} parsed arch data
     */
    parse(xmlDoc) {
        const imageField = xmlDoc.getAttribute("image_field");
        if (!imageField) {
            throw new Error("Gallery view: 'image_field' attribute is required in arch");
        }
        return {
            imageField,
        };
    }
}
```

### 3.2 Cập nhật `gallery_view.js` — Kết nối ArchParser

```javascript
/** @odoo-module **/

import { registry } from "@web/core/registry";
import { GalleryController } from "./gallery_controller";
import { GalleryArchParser } from "./gallery_arch_parser";

export const galleryView = {
    type: "gallery",
    display_name: "Gallery",
    icon: "oi oi-view-kanban",
    multiRecord: true,
    Controller: GalleryController,

    // Framework sẽ gọi ArchParser.parse() với arch XML document
    // và kết quả sẽ được merge vào props của Controller
    ArchParser: GalleryArchParser,
};

registry.category("views").add("gallery", galleryView);
```

> **Kỹ thuật:** Khi framework khởi tạo view, nó tự động gọi `new ArchParser().parse(xmlDoc)` và merge kết quả vào các props được truyền cho Controller. Vì vậy, Controller sẽ nhận các props như `imageField` mà không cần tự parse.

### 3.3 Kiểm tra

Trong controller, bạn có thể log để xem:
```javascript
setup() {
    console.log("imageField:", this.props.imageField);
}
```

---

## Bài 4: Load Some Data

> **Mục tiêu:** Fetch records từ database qua ORM service, hiển thị ID và kích thước ảnh.
>
> **Kỹ năng:** `orm.webSearchRead()`, `onWillStart`, `onWillUpdateProps`, `bin_size`.

### Lý thuyết

**`webSearchRead`** là method ORM phía frontend để tìm và đọc records. Khác với `searchRead` thông thường, nó trả thêm `length` (tổng số record phù hợp với domain, dùng cho pagination).

**`bin_size: true` trong context:** Khi fetch binary fields (như image), nếu không có `bin_size`, bạn nhận về chuỗi base64 dài (tốn băng thông). Với `bin_size: true`, bạn nhận kích thước file dạng `"120.50 kb"` thay thế.

### 4.1 Cập nhật `gallery_controller.js`

```javascript
/** @odoo-module **/

import { Component, onWillStart, onWillUpdateProps, useState } from "@odoo/owl";
import { Layout } from "@web/views/layout";
import { useService } from "@web/core/utils/hooks";

export class GalleryController extends Component {
    static template = "awesome_gallery.GalleryController";
    static components = { Layout };
    static props = ["*"];

    setup() {
        this.orm = useService("orm");

        // State để lưu records
        this.state = useState({
            records: [],
        });

        // Fetch data khi view được tạo lần đầu
        onWillStart(() => this.loadImages(this.props.domain));

        // Fetch lại khi domain thay đổi (user filter/search)
        onWillUpdateProps((nextProps) => {
            if (nextProps.domain !== this.props.domain) {
                return this.loadImages(nextProps.domain);
            }
        });
    }

    async loadImages(domain) {
        const { records } = await this.orm.webSearchRead(
            this.props.resModel,    // model name, ví dụ "res.partner"
            domain,                 // search domain
            {
                specification: {
                    // Chỉ fetch các field cần thiết
                    [this.props.imageField]: {},
                    // id luôn được fetch tự động
                },
                context: {
                    bin_size: true, // Nhận kích thước thay vì base64 data
                },
            }
        );
        this.state.records = records;
    }
}
```

### 4.2 Cập nhật `gallery_controller.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-name="awesome_gallery.GalleryController">
        <Layout display="props.display">
            <div class="p-4">
                <h3>Gallery (<t t-esc="state.records.length"/> records)</h3>
                <div class="d-flex flex-wrap gap-3">
                    <t t-foreach="state.records" t-as="record" t-key="record.id">
                        <div class="border rounded p-2">
                            <div>ID: <t t-esc="record.id"/></div>
                            <div>Size: <t t-esc="record[props.imageField]"/></div>
                        </div>
                    </t>
                </div>
            </div>
        </Layout>
    </t>
</templates>
```

> **Cần thêm gallery arch vào views.xml:**
> ```xml
> <record id="contacts_gallery_view" model="ir.ui.view">
>     <field name="name">awesome_gallery.contacts.gallery</field>
>     <field name="model">res.partner</field>
>     <field name="arch" type="xml">
>         <gallery image_field="image_1920"/>
>     </field>
> </record>
> ```

---

## Bài 5: Solve the Concurrency Problem

> **Mục tiêu:** Đảm bảo chỉ response của request cuối cùng được sử dụng.
>
> **Kỹ năng:** `KeepLast` concurrency primitive.

### Lý thuyết

**Vấn đề Race Condition:**
```
User → filter A → request A bắt đầu
User → filter B → request B bắt đầu (mới hơn)
Response B về trước → state = data B ✓
Response A về sau  → state = data A ✗ (OVERRIDE data mới hơn!)
```

**`KeepLast`** giải quyết bằng cách: khi có task mới, nó tự động hủy (reject) promise của task cũ. Chỉ task cuối cùng được resolve.

### 5.1 Cập nhật `gallery_controller.js`

```javascript
/** @odoo-module **/

import { Component, onWillStart, onWillUpdateProps, useState } from "@odoo/owl";
import { Layout } from "@web/views/layout";
import { useService } from "@web/core/utils/hooks";
import { KeepLast } from "@web/core/utils/concurrency";

export class GalleryController extends Component {
    static template = "awesome_gallery.GalleryController";
    static components = { Layout };
    static props = ["*"];

    setup() {
        this.orm = useService("orm");
        this.keepLast = new KeepLast(); // 👈 Khởi tạo KeepLast

        this.state = useState({
            records: [],
        });

        onWillStart(() => this.loadImages(this.props.domain));
        onWillUpdateProps((nextProps) => {
            if (nextProps.domain !== this.props.domain) {
                return this.loadImages(nextProps.domain);
            }
        });
    }

    async loadImages(domain) {
        // Wrap trong keepLast — chỉ resolve nếu đây là call cuối cùng
        const { records } = await this.keepLast.add(
            this.orm.webSearchRead(
                this.props.resModel,
                domain,
                {
                    specification: {
                        [this.props.imageField]: {},
                    },
                    context: { bin_size: true },
                }
            )
        );
        this.state.records = records;
    }
}
```

---

## Bài 6: Reorganize Code

> **Mục tiêu:** Tách code thành 3 lớp như kiến trúc chuẩn Odoo: Controller, Model, Renderer.
>
> **Kỹ năng:** Module decomposition, separation of concerns.

### Lý thuyết về phân tách trách nhiệm:

| Class | Trách nhiệm |
|-------|-------------|
| `GalleryController` | Lifecycle, kết nối Model ↔ Renderer |
| `GalleryModel` | Business logic: fetch data, concurrency, state |
| `GalleryRenderer` | Pure UI: render records thành HTML |

### 6.1 Tạo `gallery_model.js`

```javascript
/** @odoo-module **/

import { KeepLast } from "@web/core/utils/concurrency";

export class GalleryModel {
    constructor(env, { resModel, imageField, orm }) {
        this.env = env;
        this.resModel = resModel;
        this.imageField = imageField;
        this.orm = orm;
        this.keepLast = new KeepLast();
    }

    /**
     * Load records từ server
     * @param {Array} domain - Search domain
     * @returns {Promise<{records: Array, length: number}>}
     */
    async load(domain) {
        const result = await this.keepLast.add(
            this.orm.webSearchRead(this.resModel, domain, {
                specification: {
                    [this.imageField]: {},
                },
                context: { bin_size: true },
            })
        );
        return result;
    }
}
```

### 6.2 Tạo `gallery_renderer.js` và `gallery_renderer.xml`

```javascript
/** @odoo-module **/

import { Component } from "@odoo/owl";

export class GalleryRenderer extends Component {
    static template = "awesome_gallery.GalleryRenderer";
    static props = {
        records: Array,
        imageField: String,
    };
}
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-name="awesome_gallery.GalleryRenderer">
        <div class="o_gallery_renderer d-flex flex-wrap gap-3 p-3">
            <t t-foreach="props.records" t-as="record" t-key="record.id">
                <div class="o_gallery_item border rounded p-2">
                    <div>ID: <t t-esc="record.id"/></div>
                    <div>Size: <t t-esc="record[props.imageField]"/></div>
                </div>
            </t>
        </div>
    </t>
</templates>
```

### 6.3 Cập nhật `gallery_controller.js`

```javascript
/** @odoo-module **/

import { Component, onWillStart, onWillUpdateProps, useState } from "@odoo/owl";
import { Layout } from "@web/views/layout";
import { useService } from "@web/core/utils/hooks";
import { GalleryModel } from "./gallery_model";
import { GalleryRenderer } from "./gallery_renderer";

export class GalleryController extends Component {
    static template = "awesome_gallery.GalleryController";
    static components = { Layout, GalleryRenderer };
    static props = ["*"];

    setup() {
        this.orm = useService("orm");

        // Khởi tạo Model
        this.model = new GalleryModel(this.env, {
            resModel: this.props.resModel,
            imageField: this.props.imageField,
            orm: this.orm,
        });

        this.state = useState({ records: [] });

        onWillStart(() => this.loadImages(this.props.domain));
        onWillUpdateProps((nextProps) => this.loadImages(nextProps.domain));
    }

    async loadImages(domain) {
        const { records } = await this.model.load(domain);
        this.state.records = records;
    }
}
```

### 6.4 Cập nhật `gallery_controller.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-name="awesome_gallery.GalleryController">
        <Layout display="props.display">
            <GalleryRenderer
                records="state.records"
                imageField="props.imageField"
            />
        </Layout>
    </t>
</templates>
```

---

## Bài 7: Make the View Extensible

> **Mục tiêu:** Developer khác có thể extend Gallery bằng cách override Model hoặc Renderer.
>
> **Kỹ năng:** `t-component` dynamic, extensible view pattern.

### Lý thuyết

Vấn đề hiện tại: Model và Renderer được hardcode trong Controller. Nếu developer muốn tạo `MyGalleryRenderer`, họ phải fork toàn bộ Controller.

Giải pháp: Đặt `Model` và `Renderer` vào **view object**, truyền chúng xuống Controller qua props.

```javascript
// Developer khác có thể làm:
import { galleryView } from '@awesome_gallery/gallery_view';
import { MyRenderer } from './my_renderer';

registry.category("views").add("my_gallery", {
    ...galleryView,           // spread toàn bộ config
    Renderer: MyRenderer,     // override chỉ Renderer
});
```

### 7.1 Cập nhật `gallery_view.js`

```javascript
/** @odoo-module **/

import { registry } from "@web/core/registry";
import { GalleryController } from "./gallery_controller";
import { GalleryArchParser } from "./gallery_arch_parser";
import { GalleryModel } from "./gallery_model";
import { GalleryRenderer } from "./gallery_renderer";

export const galleryView = {
    type: "gallery",
    display_name: "Gallery",
    icon: "oi oi-view-kanban",
    multiRecord: true,
    Controller: GalleryController,
    ArchParser: GalleryArchParser,
    // Thêm Model và Renderer vào view object
    Model: GalleryModel,
    Renderer: GalleryRenderer,
};

registry.category("views").add("gallery", galleryView);
```

### 7.2 Cập nhật `gallery_controller.js` — Nhận Model/Renderer từ props

```javascript
/** @odoo-module **/

import { Component, onWillStart, onWillUpdateProps, useState } from "@odoo/owl";
import { Layout } from "@web/views/layout";
import { useService } from "@web/core/utils/hooks";

export class GalleryController extends Component {
    static template = "awesome_gallery.GalleryController";
    static components = { Layout };
    static props = ["*"];

    setup() {
        this.orm = useService("orm");

        // Lấy Model và Renderer từ props thay vì hardcode
        const { Model, Renderer } = this.props;
        this.Renderer = Renderer; // Lưu để dùng t-component

        // Khởi tạo model từ class được truyền vào
        this.model = new Model(this.env, {
            resModel: this.props.resModel,
            imageField: this.props.imageField,
            orm: this.orm,
        });

        this.state = useState({ records: [] });

        onWillStart(() => this.loadImages(this.props.domain));
        onWillUpdateProps((nextProps) => this.loadImages(nextProps.domain));
    }

    async loadImages(domain) {
        const { records } = await this.model.load(domain);
        this.state.records = records;
    }
}
```

### 7.3 Cập nhật `gallery_controller.xml` — Dùng `t-component`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-name="awesome_gallery.GalleryController">
        <Layout display="props.display">
            <!-- t-component: render component động được truyền từ props -->
            <t t-component="Renderer"
               records="state.records"
               imageField="props.imageField"
            />
        </Layout>
    </t>
</templates>
```

> **`t-component`** nhận tên biến chứa component class (không phải string). Đây là cách OWL hỗ trợ dynamic component rendering.

---

## Bài 8: Display Images

> **Mục tiêu:** Hiển thị ảnh thực sự từ records, dùng URL endpoint `/web/image`.
>
> **Kỹ năng:** `url()` utility, conditional rendering, CSS styling.

### Lý thuyết

Odoo có route `/web/image` để serve binary field:
```
/web/image?model=res.partner&id=1&field=image_1920
```

Import `url` từ `@web/core/utils/urls` để tạo URL đúng cách.

### 8.1 Cập nhật `gallery_renderer.js`

```javascript
/** @odoo-module **/

import { Component } from "@odoo/owl";
import { url } from "@web/core/utils/urls";

export class GalleryRenderer extends Component {
    static template = "awesome_gallery.GalleryRenderer";
    static props = {
        records: Array,
        imageField: String,
        resModel: String,
    };

    /**
     * Tạo URL ảnh cho record
     * @param {Object} record - Record object có id và imageField
     * @returns {string|null} - URL ảnh hoặc null nếu không có ảnh
     */
    getImageUrl(record) {
        if (!record[this.props.imageField]) {
            return null; // Không có ảnh
        }
        return url("/web/image", {
            model: this.props.resModel,
            id: record.id,
            field: this.props.imageField,
        });
    }
}
```

### 8.2 Cập nhật `gallery_renderer.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-name="awesome_gallery.GalleryRenderer">
        <div class="o_gallery_renderer d-flex flex-wrap gap-3 p-3">
            <t t-foreach="props.records" t-as="record" t-key="record.id">
                <div class="o_gallery_item"
                     style="width: 150px; height: 150px; cursor: pointer; overflow: hidden; border: 1px solid #ddd; border-radius: 8px;">

                    <!-- Nếu có ảnh: hiển thị ảnh -->
                    <t t-if="getImageUrl(record)">
                        <img
                            t-att-src="getImageUrl(record)"
                            style="width: 100%; height: 100%; object-fit: cover;"
                            t-att-alt="record.id"
                        />
                    </t>

                    <!-- Không có ảnh: hiển thị placeholder -->
                    <t t-else="">
                        <div class="d-flex align-items-center justify-content-center h-100 bg-light text-muted">
                            <i class="fa fa-image fa-2x"/>
                        </div>
                    </t>
                </div>
            </t>
        </div>
    </t>
</templates>
```

### 8.3 Truyền thêm `resModel` xuống Renderer

Cập nhật `gallery_controller.xml`:
```xml
<t t-component="Renderer"
   records="state.records"
   imageField="props.imageField"
   resModel="props.resModel"
/>
```

---

## Bài 9: Switch to Form View on Click

> **Mục tiêu:** Click vào ảnh → mở Form view của record đó.
>
> **Kỹ năng:** `action.switchView()`, event handling.

### 9.1 Cập nhật `gallery_renderer.js`

```javascript
/** @odoo-module **/

import { Component } from "@odoo/owl";
import { url } from "@web/core/utils/urls";
import { useService } from "@web/core/utils/hooks";

export class GalleryRenderer extends Component {
    static template = "awesome_gallery.GalleryRenderer";
    static props = {
        records: Array,
        imageField: String,
        resModel: String,
    };

    setup() {
        this.actionService = useService("action");
    }

    getImageUrl(record) {
        if (!record[this.props.imageField]) return null;
        return url("/web/image", {
            model: this.props.resModel,
            id: record.id,
            field: this.props.imageField,
        });
    }

    /**
     * Click vào ảnh → chuyển sang form view
     */
    openRecord(record) {
        this.actionService.switchView("form", { resId: record.id });
    }
}
```

### 9.2 Cập nhật `gallery_renderer.xml` — Thêm `t-on-click`

```xml
<div class="o_gallery_item"
     style="width: 150px; height: 150px; cursor: pointer; ..."
     t-on-click="() => openRecord(record)">
    <!-- ... ảnh ... -->
</div>
```

---

## Bài 10: Add an Optional Tooltip

> **Mục tiêu:** Hiển thị thông tin thêm khi hover chuột, lấy từ field tùy chọn `tooltip_field`.
>
> **Kỹ năng:** Optional arch attribute, `data-tooltip`, many2one display.

### 10.1 Cập nhật `gallery_arch_parser.js`

```javascript
/** @odoo-module **/

export class GalleryArchParser {
    parse(xmlDoc) {
        const imageField = xmlDoc.getAttribute("image_field");
        if (!imageField) {
            throw new Error("Gallery view: 'image_field' is required");
        }

        // tooltip_field là optional
        const tooltipField = xmlDoc.getAttribute("tooltip_field") || null;

        return {
            imageField,
            tooltipField,
        };
    }
}
```

### 10.2 Cập nhật `gallery_model.js` — Fetch thêm tooltipField

```javascript
async load(domain) {
    const specification = {
        [this.imageField]: {},
    };

    // Nếu có tooltipField, fetch nó luôn
    if (this.tooltipField) {
        specification[this.tooltipField] = {};
    }

    const result = await this.keepLast.add(
        this.orm.webSearchRead(this.resModel, domain, {
            specification,
            context: { bin_size: true },
        })
    );
    return result;
}
```

### 10.3 Cập nhật `gallery_renderer.xml` — Thêm `data-tooltip`

```xml
<div class="o_gallery_item"
     style="..."
     t-att-data-tooltip="props.tooltipField ? getTooltipValue(record) : undefined"
     t-on-click="() => openRecord(record)">
    <!-- ảnh -->
</div>
```

### 10.4 Cập nhật `gallery_renderer.js` — Thêm getTooltipValue

```javascript
/**
 * Lấy giá trị tooltip, xử lý many2one (trả về [id, name])
 */
getTooltipValue(record) {
    const value = record[this.props.tooltipField];
    if (!value) return "";
    // Many2one trả về [id, display_name]
    if (Array.isArray(value)) return value[1];
    return String(value);
}
```

### 10.5 Cập nhật `views/views.xml` — Thêm gallery arch với tooltip_field

```xml
<record id="contacts_gallery_view" model="ir.ui.view">
    <field name="name">awesome_gallery.contacts.gallery</field>
    <field name="model">res.partner</field>
    <field name="arch" type="xml">
        <!-- tooltip_field: hiển thị tên contact khi hover -->
        <gallery image_field="image_1920" tooltip_field="name"/>
    </field>
</record>
```

---

## Bài 11: Add Pagination

> **Mục tiêu:** Thêm pager vào control panel để điều hướng qua nhiều records.
>
> **Kỹ năng:** `usePager` hook, `offset`/`limit` trong webSearchRead.

### Lý thuyết

`usePager` là hook của Odoo quản lý state phân trang và tự động render Pager component vào control panel. Nó nhận:
- `getState()`: hàm trả về `{ offset, limit }` hiện tại
- `update()`: callback khi user thay đổi trang
- `fetch()`: hàm dùng để tính `total` (tổng số records)

### 11.1 Cập nhật `gallery_model.js` — Hỗ trợ offset/limit

```javascript
/** @odoo-module **/

import { KeepLast } from "@web/core/utils/concurrency";

export class GalleryModel {
    constructor(env, { resModel, imageField, tooltipField, orm }) {
        this.env = env;
        this.resModel = resModel;
        this.imageField = imageField;
        this.tooltipField = tooltipField;
        this.orm = orm;
        this.keepLast = new KeepLast();
    }

    async load(domain, { offset = 0, limit = 20 } = {}) {
        const specification = { [this.imageField]: {} };
        if (this.tooltipField) {
            specification[this.tooltipField] = {};
        }

        const result = await this.keepLast.add(
            this.orm.webSearchRead(this.resModel, domain, {
                specification,
                context: { bin_size: true },
                offset,
                limit,
            })
        );
        return result; // { records, length }
    }
}
```

### 11.2 Cập nhật `gallery_controller.js` — Dùng usePager

```javascript
/** @odoo-module **/

import { Component, onWillStart, onWillUpdateProps, useState } from "@odoo/owl";
import { Layout } from "@web/views/layout";
import { useService } from "@web/core/utils/hooks";
import { usePager } from "@web/search/pager_hook";

export class GalleryController extends Component {
    static template = "awesome_gallery.GalleryController";
    static components = { Layout };
    static props = ["*"];

    setup() {
        this.orm = useService("orm");
        const { Model, Renderer } = this.props;
        this.Renderer = Renderer;

        this.model = new Model(this.env, {
            resModel: this.props.resModel,
            imageField: this.props.imageField,
            tooltipField: this.props.tooltipField,
            orm: this.orm,
        });

        this.state = useState({
            records: [],
            total: 0,
        });

        // Cấu hình pager
        this.pager = usePager(() => ({
            offset: this.state.offset || 0,
            limit: this.state.limit || 20,
            total: this.state.total,
            onUpdate: async ({ offset, limit }) => {
                this.state.offset = offset;
                this.state.limit = limit;
                await this.loadImages(this.props.domain);
            },
        }));

        onWillStart(() => this.loadImages(this.props.domain));
        onWillUpdateProps((nextProps) => this.loadImages(nextProps.domain));
    }

    async loadImages(domain) {
        const { records, length } = await this.model.load(domain, {
            offset: this.state.offset || 0,
            limit: this.state.limit || 20,
        });
        this.state.records = records;
        this.state.total = length;
    }
}
```

---

## Bài 12: Validating Views (RNG Schema)

> **Mục tiêu:** Validate arch XML của Gallery view so với schema RNG để phát hiện lỗi sớm.
>
> **Kỹ năng:** RelaxNG validation, Python server-side view validation.

### Lý thuyết

Odoo dùng **RelaxNG (RNG)** — một XML schema language — để validate arch của các views. Khi ai đó tạo gallery view với arch sai, server sẽ báo lỗi ngay.

### 12.1 Tạo `rng/gallery_view.rng`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rng:grammar xmlns:rng="http://relaxng.org/ns/structure/1.0"
             datatypeLibrary="http://www.w3.org/2001/XMLSchema-datatypes">

    <rng:start>
        <rng:ref name="gallery"/>
    </rng:start>

    <rng:define name="gallery">
        <rng:element name="gallery">
            <!-- image_field: BẮT BUỘC, phải là chuỗi không rỗng -->
            <rng:attribute name="image_field">
                <rng:text/>
            </rng:attribute>

            <!-- tooltip_field: TÙY CHỌN -->
            <rng:optional>
                <rng:attribute name="tooltip_field">
                    <rng:text/>
                </rng:attribute>
            </rng:optional>

            <!-- Không cho phép child tags -->
            <rng:empty/>
        </rng:element>
    </rng:define>

</rng:grammar>
```

### 12.2 Tạo `models/gallery_view_validation.py`

```python
# -*- coding: utf-8 -*-
import logging
import os
from lxml import etree
from odoo.loglevels import ustr
from odoo.tools import misc, view_validation

_logger = logging.getLogger(__name__)
_gallery_validator = None


@view_validation.validate('gallery')
def schema_gallery(arch, **kwargs):
    """Validate gallery view arch against RNG schema."""
    global _gallery_validator

    if _gallery_validator is None:
        with misc.file_open(
            os.path.join('awesome_gallery', 'rng', 'gallery_view.rng')
        ) as f:
            _gallery_validator = etree.RelaxNG(etree.parse(f))

    if _gallery_validator.validate(arch):
        return True

    for error in _gallery_validator.error_log:
        _logger.error(ustr(error))
    return False
```

### 12.3 Cập nhật `models/__init__.py`

```python
from . import ir_ui_view
from . import ir_action
from . import gallery_view_validation  # Thêm dòng này
```

> **Lưu ý:** Sau khi thêm file Python mới, cần restart server. Odoo sẽ tự validate mọi gallery arch khi load.

---

## Bài 13: Uploading an Image

> **Mục tiêu:** Cho phép upload ảnh trực tiếp từ Gallery view.
>
> **Kỹ năng:** `FileUploader` component, `orm.webSave()`, cache busting với `write_date`.

### Lý thuyết

`FileUploader` là component Odoo có sẵn cho phép chọn file từ máy tính. Nó nhận prop `onUploaded` là callback được gọi khi user chọn file xong.

**Cache busting:** Sau khi upload, URL ảnh không đổi → browser dùng cache cũ. Giải pháp: thêm `write_date` vào URL → URL thay đổi → browser re-fetch.

### 13.1 Cập nhật `gallery_model.js` — Fetch thêm write_date

```javascript
async load(domain, { offset = 0, limit = 20 } = {}) {
    const specification = {
        [this.imageField]: {},
        write_date: {}, // Cần cho cache busting sau khi upload
    };
    if (this.tooltipField) {
        specification[this.tooltipField] = {};
    }
    // ...
}
```

### 13.2 Cập nhật `gallery_renderer.js`

```javascript
/** @odoo-module **/

import { Component } from "@odoo/owl";
import { url } from "@web/core/utils/urls";
import { useService } from "@web/core/utils/hooks";
import { FileUploader } from "@web/core/file_uploader/file_uploader";

export class GalleryRenderer extends Component {
    static template = "awesome_gallery.GalleryRenderer";
    static components = { FileUploader };
    static props = {
        records: Array,
        imageField: String,
        resModel: String,
        tooltipField: { type: String, optional: true },
        onImageUploaded: Function,
    };

    setup() {
        this.actionService = useService("action");
        this.orm = useService("orm");
    }

    getImageUrl(record) {
        if (!record[this.props.imageField]) return null;
        return url("/web/image", {
            model: this.props.resModel,
            id: record.id,
            field: this.props.imageField,
            // Thêm write_date để bust cache sau khi upload
            unique: record.write_date,
        });
    }

    openRecord(record) {
        this.actionService.switchView("form", { resId: record.id });
    }

    getTooltipValue(record) {
        if (!this.props.tooltipField) return "";
        const value = record[this.props.tooltipField];
        if (!value) return "";
        if (Array.isArray(value)) return value[1];
        return String(value);
    }

    /**
     * Upload ảnh mới cho record
     */
    async onUploaded(record, { data, name }) {
        await this.orm.webSave(
            this.props.resModel,
            [record.id],
            { [this.props.imageField]: data } // data là base64 string
        );
        // Thông báo controller reload data
        this.props.onImageUploaded();
    }
}
```

### 13.3 Cập nhật `gallery_renderer.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-name="awesome_gallery.GalleryRenderer">
        <div class="o_gallery_renderer d-flex flex-wrap gap-3 p-3">
            <t t-foreach="props.records" t-as="record" t-key="record.id">
                <div class="o_gallery_item position-relative"
                     style="width: 150px; height: 150px; ..."
                     t-att-data-tooltip="props.tooltipField ? getTooltipValue(record) : undefined"
                     t-on-click="() => openRecord(record)">

                    <t t-if="getImageUrl(record)">
                        <img t-att-src="getImageUrl(record)"
                             style="width: 100%; height: 100%; object-fit: cover;"/>
                    </t>
                    <t t-else="">
                        <div class="d-flex align-items-center justify-content-center h-100 bg-light text-muted">
                            <i class="fa fa-image fa-2x"/>
                        </div>
                    </t>

                    <!-- Upload button — dùng .stop để không trigger openRecord -->
                    <div class="position-absolute bottom-0 end-0 p-1"
                         t-on-click.stop="">
                        <FileUploader
                            onUploaded="(info) => this.onUploaded(record, info)"
                            acceptedFileExtensions="'.jpg,.jpeg,.png,.gif,.svg,.webp'"
                        >
                            <button class="btn btn-sm btn-light opacity-75">
                                <i class="fa fa-camera"/>
                            </button>
                        </FileUploader>
                    </div>
                </div>
            </t>
        </div>
    </t>
</templates>
```

### 13.4 Cập nhật controller để xử lý reload sau upload

```javascript
// Trong gallery_controller.xml — truyền callback
<t t-component="Renderer"
   records="state.records"
   imageField="props.imageField"
   resModel="props.resModel"
   tooltipField="props.tooltipField"
   onImageUploaded="() => this.loadImages(this.props.domain)"
/>
```

---

## Bài 14: Advanced Tooltip Template

> **Mục tiêu:** Cho phép định nghĩa OWL template tùy chỉnh cho tooltip thay vì chỉ dùng text field.
>
> **Kỹ năng:** `visitXML`, dynamic OWL template registration với `xml`, `useTooltip` hook.

### Lý thuyết

Arch mới sẽ hỗ trợ:
```xml
<gallery image_field="image_1920" tooltip_field="name">
    <field name="email"/>
    <field name="name"/>
    <tooltip-template>
        <p>Name: <field name="name"/></p>
        <p>Email: <field name="email"/></p>
    </tooltip-template>
</gallery>
```

**`visitXML`**: Utility để walk qua XML tree, gọi callback cho cada element.

**Luồng xử lý:**
1. ArchParser dùng `visitXML` để tìm `<field>` và `<tooltip-template>`
2. `<field name="email"/>` → được chuyển thành `<t t-esc="record.email"/>`
3. Template được đăng ký vào OWL với `xml`
4. Renderer dùng `useTooltip` để render template này với data của record

### 14.1 Cập nhật `gallery_arch_parser.js`

```javascript
/** @odoo-module **/

import { visitXML } from "@web/core/utils/xml";
import { xml } from "@odoo/owl";

let tooltipTemplateId = 0; // Counter để tạo unique template name

export class GalleryArchParser {
    parse(xmlDoc) {
        const imageField = xmlDoc.getAttribute("image_field");
        if (!imageField) {
            throw new Error("Gallery view: 'image_field' is required");
        }

        const tooltipField = xmlDoc.getAttribute("tooltip_field") || null;
        const fieldNames = new Set();
        let tooltipTemplate = null;

        // visitXML walk qua toàn bộ child elements
        visitXML(xmlDoc, (node) => {
            if (node.tagName === "field") {
                fieldNames.add(node.getAttribute("name"));
            }
            if (node.tagName === "tooltip-template") {
                tooltipTemplate = this.parseTooltipTemplate(node);
            }
        });

        return {
            imageField,
            tooltipField,
            fieldNames: [...fieldNames],
            tooltipTemplate,
        };
    }

    /**
     * Chuyển <tooltip-template> thành OWL template đã đăng ký
     * @param {Element} templateNode
     * @returns {string} tên template đã đăng ký
     */
    parseTooltipTemplate(templateNode) {
        // Clone để không mutate original
        const template = templateNode.cloneNode(true);

        // Thay thế <field name="x"/> → <t t-esc="record.x"/>
        for (const fieldEl of template.querySelectorAll("field")) {
            const fieldName = fieldEl.getAttribute("name");
            const tEl = document.createElement("t");
            tEl.setAttribute("t-esc", `record.${fieldName}`);
            fieldEl.replaceWith(tEl);
        }

        // Tạo tên template unique
        const templateName = `awesome_gallery.tooltip_${tooltipTemplateId++}`;

        // Đăng ký template vào OWL runtime
        xml`<t t-name="${templateName}">${template.innerHTML}</t>`;

        return templateName;
    }
}
```

### 14.2 Cập nhật `gallery_renderer.js` — Dùng useTooltip

```javascript
/** @odoo-module **/

import { Component } from "@odoo/owl";
import { url } from "@web/core/utils/urls";
import { useService } from "@web/core/utils/hooks";
import { useTooltip } from "@web/core/tooltip/tooltip_hook";
import { FileUploader } from "@web/core/file_uploader/file_uploader";

export class GalleryItem extends Component {
    static template = "awesome_gallery.GalleryItem";
    static components = { FileUploader };
    static props = {
        record: Object,
        imageField: String,
        resModel: String,
        tooltipField: { type: String, optional: true },
        tooltipTemplate: { type: String, optional: true },
        onImageUploaded: Function,
        openRecord: Function,
    };

    setup() {
        this.orm = useService("orm");

        // Sử dụng useTooltip nếu có template tùy chỉnh
        if (this.props.tooltipTemplate) {
            useTooltip("root", {
                template: this.props.tooltipTemplate,
                info: () => ({ record: this.props.record }),
            });
        }
    }

    getImageUrl() {
        const record = this.props.record;
        if (!record[this.props.imageField]) return null;
        return url("/web/image", {
            model: this.props.resModel,
            id: record.id,
            field: this.props.imageField,
            unique: record.write_date,
        });
    }

    async onUploaded({ data }) {
        await this.orm.webSave(
            this.props.resModel,
            [this.props.record.id],
            { [this.props.imageField]: data }
        );
        this.props.onImageUploaded();
    }
}

export class GalleryRenderer extends Component {
    static template = "awesome_gallery.GalleryRenderer";
    static components = { GalleryItem };
    static props = {
        records: Array,
        imageField: String,
        resModel: String,
        tooltipField: { type: String, optional: true },
        tooltipTemplate: { type: String, optional: true },
        onImageUploaded: Function,
        openRecord: Function,
    };
}
```

### 14.3 Cập nhật RNG để chấp nhận tooltip-template

```xml
<!-- Trong gallery_view.rng -->
<rng:element name="gallery">
    <rng:attribute name="image_field"><rng:text/></rng:attribute>
    <rng:optional>
        <rng:attribute name="tooltip_field"><rng:text/></rng:attribute>
    </rng:optional>

    <!-- Cho phép zero hoặc nhiều <field> elements -->
    <rng:zeroOrMore>
        <rng:element name="field">
            <rng:attribute name="name"><rng:text/></rng:attribute>
        </rng:element>
    </rng:zeroOrMore>

    <!-- Tooltip template tùy chọn -->
    <rng:optional>
        <rng:ref name="tooltip-template"/>
    </rng:optional>
</rng:element>

<!-- Define cho tooltip-template — chấp nhận bất kỳ child nào -->
<rng:define name="tooltip-template">
    <rng:element name="tooltip-template">
        <rng:zeroOrMore>
            <rng:choice>
                <rng:text/>
                <rng:ref name="any"/>
            </rng:choice>
        </rng:zeroOrMore>
    </rng:element>
</rng:define>

<rng:define name="any">
    <rng:element>
        <rng:anyName/>
        <rng:zeroOrMore>
            <rng:choice>
                <rng:attribute><rng:anyName/></rng:attribute>
                <rng:text/>
                <rng:ref name="any"/>
            </rng:choice>
        </rng:zeroOrMore>
    </rng:element>
</rng:define>
```

---

## Bảng Tổng Hợp — Tất Cả Kỹ Năng

| Bài | Khái niệm | Import chính |
|-----|-----------|--------------|
| 1 | View registry, view object | `registry.category("views")` |
| 2 | Layout component | `@web/views/layout` |
| 3 | ArchParser, arch parsing | Custom class, `xmlDoc.getAttribute()` |
| 4 | ORM webSearchRead, hooks | `useService("orm")`, `onWillStart`, `onWillUpdateProps` |
| 5 | Race condition, KeepLast | `@web/core/utils/concurrency` |
| 6 | MVC pattern, separation | Tách Model / Renderer / Controller |
| 7 | Extensible views, t-component | `t-component` directive |
| 8 | Image URL generation | `url` from `@web/core/utils/urls` |
| 9 | View navigation | `action.switchView()` |
| 10 | Optional tooltip, data-tooltip | `data-tooltip` attribute |
| 11 | Pagination | `usePager` from `@web/search/pager_hook` |
| 12 | RNG validation (Python) | `view_validation.validate()`, RelaxNG |
| 13 | File upload, webSave, cache | `FileUploader`, `orm.webSave()`, `write_date` |
| 14 | Dynamic templates, visitXML | `visitXML`, `xml`, `useTooltip` |

---

## Lưu Ý Debug

1. **Sau khi sửa Python file:** Luôn restart Odoo server.
2. **Sau khi sửa JS/XML:** `Ctrl+Shift+R` hoặc dùng `?debug=assets` để không dùng cache.
3. **Update module:** Dùng `--update=awesome_gallery` khi có thay đổi trong `views.xml` hoặc Python models.
4. **Xem lỗi arch:** Lỗi RNG validation xuất hiện trong server log khi install/update module.
5. **Kiểm tra props:** Thêm `console.log(this.props)` trong `setup()` của controller để xem framework truyền gì.
6. **`bin_size: true` quan trọng:** Nếu quên, bạn sẽ nhận chuỗi base64 dài thay vì kích thước file — gây chậm và lỗi hiển thị.

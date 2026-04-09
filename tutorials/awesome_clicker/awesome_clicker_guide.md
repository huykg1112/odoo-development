# Hướng Dẫn Thực Hành: Build a Clicker Game — Odoo 18.0

> **Tutorial:** [Master the Odoo Web Framework — Chapter 1](https://www.odoo.com/documentation/18.0/developer/tutorials/master_odoo_web_framework/01_build_clicker_game.html)
> **Module:** `awesome_clicker` (tại `tutorials/awesome_clicker/`)
> **Solutions:** [GitHub — odoo/tutorials (18.0-solutions)](https://github.com/odoo/tutorials/commits/18.0-master-odoo-web-framework-solutions/awesome_clicker)

---

## Mục Tiêu Tổng Quan

Xây dựng một **Clicker Game** hoàn chỉnh tích hợp trong Odoo Web Client. Game cho phép người dùng tích lũy clicks, mua robots tự động, trồng cây, nhận thưởng ngẫu nhiên — tất cả đều tích hợp vào giao diện Odoo.

### Kỹ năng sẽ học qua 21 bài tập:

| Nhóm | Bài | Kỹ năng |
|------|-----|---------|
| **Cơ bản** | 1-3 | Systray registry, OWL components, Client actions |
| **State Management** | 4-5 | Custom services, reactive state, custom hooks |
| **UI Enhancement** | 6-7 | humanNumber, ClickValue component, tooltips |
| **Game Logic** | 8-12 | Click bots, class model, event bus, effects, power multiplier |
| **Rewards** | 13-14 | Random rewards, patching FormController |
| **Integration** | 15-18 | Command palette, Dropdown, Notebook component |
| **Persistence** | 19-21 | LocalStorage, state migration system |

---

## Chuẩn Bị

### Cấu trúc file cuối cùng (sau khi hoàn thành tất cả bài):

```
awesome_clicker/
├── __init__.py
├── __manifest__.py                    # Đã có sẵn
└── static/src/
    ├── clicker_systray_item.js        # Bài 1
    ├── clicker_systray_item.xml       # Bài 1
    ├── client_action.js               # Bài 3
    ├── client_action.xml              # Bài 3
    ├── clicker_service.js             # Bài 4
    ├── clicker_model.js               # Bài 9
    ├── click_value.js                 # Bài 6
    ├── click_value.xml                # Bài 6
    ├── click_rewards.js               # Bài 13
    ├── utils.js                       # Bài 13
    └── patch_form_controller.js       # Bài 14
```

### `__manifest__.py` (đã có sẵn — không cần sửa):
Manifest đã có cấu hình `'awesome_clicker/static/src/**/*'` nên mọi file JS/XML trong `static/src/` sẽ tự động được load.

---

## Bài 1: Create a Systray Item

> **Mục tiêu:** Hiển thị một component trên thanh systray (góc phải trên cùng navbar).
>
> **Kỹ năng:** Registry `systray`, OWL component cơ bản, `useState`.

### Lý thuyết

**Systray** là khu vực chứa các icon nhỏ ở góc phải trên cùng (user menu, company switch...). Odoo dùng `registry.category("systray")` để quản lý danh sách các item.

Mỗi systray item đăng ký là một object `{ Component: MyComponent }`, Odoo sẽ tự động render nó vào navbar.

### 1.1 Tạo file `clicker_systray_item.js`

```javascript
/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";

export class ClickerSystrayItem extends Component {
    static template = "awesome_clicker.ClickerSystrayItem";

    setup() {
        this.state = useState({ clicks: 0 });
    }

    increment() {
        this.state.clicks += 1;
    }
}

// Đăng ký vào systray registry
// sequence càng cao → hiển thị càng bên trái
registry.category("systray").add("awesome_clicker.ClickerSystrayItem", {
    Component: ClickerSystrayItem,
});
```

### 1.2 Tạo file `clicker_systray_item.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-name="awesome_clicker.ClickerSystrayItem">
        <div class="d-flex align-items-center gap-2 px-2">
            <span>Clicks: <t t-esc="state.clicks"/></span>
            <button class="btn btn-sm btn-primary" t-on-click="increment">
                +1
            </button>
        </div>
    </t>
</templates>
```

### Kiểm tra

1. Refresh trình duyệt (có thể cần xóa cache `Ctrl+Shift+R`).
2. Bạn sẽ thấy `Clicks: 0` và nút `+1` ở thanh trên cùng bên phải.
3. Click vào nút → số sẽ tăng.

---

## Bài 2: Count External Clicks

> **Mục tiêu:** Mỗi click bất kỳ trên trang Odoo đều tăng counter +1. Click vào nút chính tăng +10.
>
> **Kỹ năng:** `useExternalListener`, event capture, `stopPropagation`.

### Lý thuyết

`useExternalListener` là OWL hook cho phép lắng nghe sự kiện trên bất kỳ DOM element nào bên ngoài component. Khi component bị destroy, listener tự động bị remove.

### 2.1 Cập nhật `clicker_systray_item.js`

```javascript
/** @odoo-module **/

import { Component, useState,useExternalListener } from "@odoo/owl";
import { registry } from "@web/core/registry";

export class ClickerSystrayItem extends Component {
    static template = "awesome_clicker.ClickerSystrayItem";

    setup() {
        this.state = useState({ clicks: 0 });

        // Lắng nghe TẤT CẢ click từ body (capture phase để đảm bảo không miss)
        useExternalListener(document.body, "click", this.onExternalClick, { capture: true });
    }

    onExternalClick() {
        this.state.clicks += 1;
    }

    increment(ev) {
        // Ngăn external listener bắt event này
        ev.stopPropagation();
        // Click vào nút chính → +10
        this.state.clicks += 10;
    }
}

registry.category("systray").add("awesome_clicker.ClickerSystrayItem", {
    Component: ClickerSystrayItem,
});
```

> **Tại sao dùng `capture: true`?** Event capture phase chạy từ trên xuống (body → child), trước khi bubble phase (child → body). Nếu một child element gọi `stopPropagation()`, event ở bubble phase sẽ bị chặn nhưng capture phase vẫn bắt được.

---

## Bài 3: Create a Client Action

> **Mục tiêu:** Tạo trang game chính (mở dạng dialog/popover).
>
> **Kỹ năng:** `actions` registry, `useService("action")`, `doAction`.

### 3.1 Tạo file `client_action.js`

```javascript
/** @odoo-module **/

import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";

export class ClickerClientAction extends Component {
    static template = "awesome_clicker.ClickerClientAction";
    static props = ["*"];  // Client action nhận nhiều props từ framework
}

// Đăng ký vào action registry
registry.category("actions").add("awesome_clicker.client_action", ClickerClientAction);
```

### 3.2 Tạo file `client_action.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-name="awesome_clicker.ClickerClientAction">
        <div class="p-4">
            <h1>🎮 Clicker Game</h1>
            <p>Hello World! Game content coming soon...</p>
        </div>
    </t>
</templates>
```

### 3.3 Thêm nút "Open" vào systray

Cập nhật `clicker_systray_item.js` — thêm `useService`:

```javascript
import { useService } from "@web/core/utils/hooks";

// Trong setup():
setup() {
    // ... code cũ ...
    this.actionService = useService("action");
}

openClientAction() {
    this.actionService.doAction({
        type: "ir.actions.client",
        tag: "awesome_clicker.client_action",
        target: "new",      // Mở dạng dialog (không full screen)
        name: "Clicker Game",
    });
}
```

Cập nhật template thêm nút Open:

```xml
<t t-name="awesome_clicker.ClickerSystrayItem">
    <div class="d-flex align-items-center gap-2 px-2">
        <span>Clicks: <t t-esc="state.clicks"/></span>
        <button class="btn btn-sm btn-primary" t-on-click="increment">+1</button>
        <button class="btn btn-sm btn-secondary" t-on-click="openClientAction">Open</button>
    </div>
</t>
```

---

## Bài 4: Move the State to a Service

> **Mục tiêu:** State được dùng chung giữa systray và client action (single source of truth).
>
> **Kỹ năng:** Custom service, `reactive`, `useState` từ service.

### Lý thuyết

Service trong Odoo là **singleton** — chỉ tạo 1 lần, dùng chung cho toàn bộ web client. Hoàn hảo cho shared state.

- `reactive(obj)` → biến obj thành reactive (thay đổi sẽ trigger re-render ở component dùng `useState`).
- Component dùng `useState(reactiveObj)` để "subscribe" vào thay đổi.

### 4.1 Tạo file `clicker_service.js`

```javascript
/** @odoo-module **/

import { reactive } from "@odoo/owl";
import { registry } from "@web/core/registry";

const clickerService = {
    start() {
        const state = reactive({ clicks: 0 });

        function increment(amount) {
            state.clicks += amount;
        }

        return { state, increment };
    },
};

registry.category("services").add("awesome_clicker.clicker", clickerService);
```

### 4.2 Cập nhật `clicker_systray_item.js`

```javascript
/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useExternalListener, useService } from "@web/core/utils/hooks";

export class ClickerSystrayItem extends Component {
    static template = "awesome_clicker.ClickerSystrayItem";

    setup() {
        // Lấy service — state là reactive object
        this.clicker = useService("awesome_clicker.clicker");
        // useState để component re-render khi state thay đổi
        this.state = useState(this.clicker.state);
        this.actionService = useService("action");

        useExternalListener(document.body, "click", this.onExternalClick, { capture: true });
    }

    onExternalClick() {
        this.clicker.increment(1);
    }

    openClientAction() {
        this.actionService.doAction({
            type: "ir.actions.client",
            tag: "awesome_clicker.client_action",
            target: "new",
            name: "Clicker Game",
        });
    }
}

registry.category("systray").add("awesome_clicker.ClickerSystrayItem", {
    Component: ClickerSystrayItem,
});
```

### 4.3 Cập nhật `client_action.js`

```javascript
/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

export class ClickerClientAction extends Component {
    static template = "awesome_clicker.ClickerClientAction";
    static props = ["*"];

    setup() {
        this.clicker = useService("awesome_clicker.clicker");
        this.state = useState(this.clicker.state);
    }
}

registry.category("actions").add("awesome_clicker.client_action", ClickerClientAction);
```

### 4.4 Cập nhật `client_action.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-name="awesome_clicker.ClickerClientAction">
        <div class="p-4">
            <h1>🎮 Clicker Game</h1>
            <h2>Clicks: <t t-esc="state.clicks"/></h2>
            <button class="btn btn-lg btn-primary" t-on-click="() => this.clicker.increment(10)">
                +10 Clicks!
            </button>
        </div>
    </t>
</templates>
```

---

## Bài 5: Use a Custom Hook

> **Mục tiêu:** Đơn giản hóa code với custom hook `useClicker()`.
>
> **Kỹ năng:** Custom OWL hooks.

### 5.1 Thêm vào `clicker_service.js`

```javascript
// Thêm ở cuối file, sau registry.add(...)

import { useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

/**
 * Custom hook — thay vì gọi useService + useState mỗi lần
 * @returns {Object} clicker (bao gồm state reactive + increment function)
 */
export function useClicker() {
    const clicker = useService("awesome_clicker.clicker");
    // useState ở đây để component tự re-render khi state thay đổi
    useState(clicker.state);
    return clicker;
}
```

### 5.2 Dùng trong component

```javascript
// Thay thế cả useService + useState bằng:
import { useClicker } from "./clicker_service";

setup() {
    this.clicker = useClicker();
    // this.clicker.state.clicks → giá trị
    // this.clicker.increment(10) → update
}
```

---

## Bài 6: Humanize the Displayed Value

> **Mục tiêu:** Hiển thị số lớn dạng `1.2k`, `3.4M`, tạo component `ClickValue` tái sử dụng.
>
> **Kỹ năng:** `humanNumber` utility, reusable components.

### 6.1 Tạo `click_value.js` và `click_value.xml`

```javascript
/** @odoo-module **/

import { Component } from "@odoo/owl";
import { humanNumber } from "@web/core/utils/numbers";

export class ClickValue extends Component {
    static template = "awesome_clicker.ClickValue";
    static props = {
        value: Number,
    };

    get formattedValue() {
        return humanNumber(this.props.value);
    }
}
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-name="awesome_clicker.ClickValue">
        <!-- Bài 7 sẽ thêm tooltip ở đây -->
        <t t-esc="formattedValue"/>
    </t>
</templates>
```

### 6.2 Sử dụng trong template

```xml
<!-- Trong systray item hoặc client action -->
<ClickValue value="state.clicks"/>
```

Nhớ đăng ký component:
```javascript
import { ClickValue } from "./click_value";

// Trong ClickerSystrayItem hoặc ClickerClientAction:
static components = { ClickValue };
```

---

## Bài 7: Add a Tooltip in ClickValue

> **Mục tiêu:** Hover vào số humanized → hiển thị giá trị thực chính xác.
>
> **Kỹ năng:** `data-tooltip` attribute.

### 7.1 Cập nhật `click_value.xml`

```xml
<t t-name="awesome_clicker.ClickValue">
    <span t-att-data-tooltip="props.value">
        <t t-esc="formattedValue"/>
    </span>
</t>
```

Odoo có built-in tooltip service lắng nghe `data-tooltip` attribute — chỉ cần thêm attribute là tự hiển thị tooltip khi hover.

---

## Bài 8: Buy ClickBots

> **Mục tiêu:** Mở khóa tính năng mua robots tự động click mỗi 10 giây.
>
> **Kỹ năng:** Level system, `setInterval`, conditional rendering.

### 8.1 Cập nhật `clicker_service.js`

```javascript
const clickerService = {
    start() {
        const state = reactive({
            clicks: 0,
            level: 0,
            clickBots: 0,
        });

        function increment(amount) {
            state.clicks += amount;
            // Check level up
            if (state.clicks >= 1000 && state.level < 1) {
                state.level = 1;
            }
        }

        function buyClickBot() {
            if (state.clicks >= 1000) {
                state.clicks -= 1000;
                state.clickBots += 1;
            }
        }

        // ClickBots tự động +10 mỗi 10s
        setInterval(() => {
            if (state.clickBots > 0) {
                state.clicks += 10 * state.clickBots;
                // Check level up sau khi bots thêm clicks
                if (state.clicks >= 1000 && state.level < 1) {
                    state.level = 1;
                }
            }
        }, 10000);

        return { state, increment, buyClickBot };
    },
};
```

### 8.2 Cập nhật `client_action.xml`

```xml
<t t-name="awesome_clicker.ClickerClientAction">
    <div class="p-4">
        <h1>🎮 Clicker Game</h1>
        <h2>Clicks: <ClickValue value="state.clicks"/></h2>
        <button class="btn btn-lg btn-primary" t-on-click="() => this.clicker.increment(10)">
            +10 Clicks!
        </button>

        <!-- ClickBots section - chỉ hiện khi level >= 1 -->
        <div t-if="state.level gte 1" class="mt-4">
            <h3>🤖 ClickBots: <t t-esc="state.clickBots"/></h3>
            <p class="text-muted">Each bot produces 10 clicks every 10 seconds</p>
            <button class="btn btn-warning"
                    t-att-disabled="state.clicks lt 1000"
                    t-on-click="() => this.clicker.buyClickBot()">
                Buy ClickBot (Cost: 1,000 clicks)
            </button>
        </div>
    </div>
</t>
```

> **Lưu ý XML với `<` và `>`:** Trong XML template, ký tự `<` và `>` xung đột với parser XML. Dùng alias: `lt` (less than), `lte` (≤), `gt` (greater than), `gte` (≥).

---

## Bài 9: Refactor to a Class Model

> **Mục tiêu:** Tách business logic ra class riêng, service chỉ khởi tạo và export.
>
> **Kỹ năng:** `Reactive` class, OOP pattern.

### 9.1 Tạo `clicker_model.js`

```javascript
/** @odoo-module **/

import { EventBus } from "@odoo/owl";
import { Reactive } from "@web/core/utils/reactive";

export class ClickerModel extends Reactive {
    // EventBus cho bài 10
    bus = new EventBus();

    // State
    clicks = 0;
    level = 0;
    clickBots = 0;

    constructor() {
        super();
        // Tick mỗi 10 giây
        setInterval(() => this.tick(), 10000);
    }

    increment(amount) {
        this.clicks += amount;
        this.checkLevelUp();
    }

    buyClickBot() {
        if (this.clicks >= 1000) {
            this.clicks -= 1000;
            this.clickBots += 1;
        }
    }

    tick() {
        if (this.clickBots > 0) {
            this.clicks += 10 * this.clickBots;
            this.checkLevelUp();
        }
    }

    checkLevelUp() {
        if (this.clicks >= 1000 && this.level < 1) {
            this.level = 1;
            this.bus.trigger("MILESTONE_1k");
        }
    }
}
```

### 9.2 Đơn giản hóa `clicker_service.js`

```javascript
/** @odoo-module **/

import { useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { ClickerModel } from "./clicker_model";

const clickerService = {
    start() {
        return new ClickerModel();
    },
};

registry.category("services").add("awesome_clicker.clicker", clickerService);

export function useClicker() {
    const clicker = useService("awesome_clicker.clicker");
    useState(clicker);  // Reactive class → useState trực tiếp lên model
    return clicker;
}
```

> **Tại sao kế thừa `Reactive`?** Class `Reactive` từ Odoo tự động wrap instance vào `reactive()` proxy. Nên khi bạn gán `this.clicks = 5`, bất kỳ component nào đang `useState(clicker)` sẽ tự re-render.

---

## Bài 10: Notify When a Milestone is Reached

> **Mục tiêu:** Khi đạt 1000 clicks lần đầu → hiển thị rainbow man effect.
>
> **Kỹ năng:** `EventBus`, `effect` service.

### 10.1 Model đã có bus (bài 9)

Trong `checkLevelUp()` đã trigger `this.bus.trigger("MILESTONE_1k")`.

### 10.2 Lắng nghe trong service

```javascript
const clickerService = {
    dependencies: ["effect"],  // Khai báo dependency
    start(env, { effect }) {
        const clicker = new ClickerModel();

        clicker.bus.addEventListener("MILESTONE_1k", () => {
            effect.add({
                type: "rainbow_man",
                message: "🎉 Milestone reached! You can now buy ClickBots!",
            });
        });

        return clicker;
    },
};
```

---

## Bài 11: Add BigBots

> **Mục tiêu:** Thêm loại bot mạnh hơn: BigBot (100 clicks/10s, giá 5000).
>
> **Kỹ năng:** Mở rộng state và UI.

### 11.1 Cập nhật `clicker_model.js`

```javascript
// Thêm thuộc tính
bigBots = 0;

// Trong checkLevelUp():
checkLevelUp() {
    if (this.clicks >= 1000 && this.level < 1) {
        this.level = 1;
        this.bus.trigger("MILESTONE", { level: 1 });
    }
    if (this.clicks >= 5000 && this.level < 2) {
        this.level = 2;
        this.bus.trigger("MILESTONE", { level: 2 });
    }
}

buyBigBot() {
    if (this.clicks >= 5000) {
        this.clicks -= 5000;
        this.bigBots += 1;
    }
}

tick() {
    const botClicks = 10 * this.clickBots + 100 * this.bigBots;
    if (botClicks > 0) {
        this.clicks += botClicks;
        this.checkLevelUp();
    }
}
```

### 11.2 Cập nhật `client_action.xml`

```xml
<!-- Thêm sau phần ClickBots -->
<div t-if="state.level gte 2" class="mt-4">
    <h3>🦾 BigBots: <t t-esc="state.bigBots"/></h3>
    <p class="text-muted">Each BigBot produces 100 clicks every 10 seconds</p>
    <button class="btn btn-danger"
            t-att-disabled="state.clicks lt 5000"
            t-on-click="() => this.clicker.buyBigBot()">
        Buy BigBot (Cost: 5,000 clicks)
    </button>
</div>
```

---

## Bài 12: Add Power Multiplier

> **Mục tiêu:** Power multiplier nhân hiệu suất bots. Level 3 tại 100k clicks.
>
> **Kỹ năng:** Mở rộng game mechanics.

### 12.1 Cập nhật `clicker_model.js`

```javascript
// Thêm thuộc tính
power = 1;

// Trong checkLevelUp():
if (this.clicks >= 100000 && this.level < 3) {
    this.level = 3;
    this.bus.trigger("MILESTONE", { level: 3 });
}

buyPower() {
    if (this.clicks >= 50000) {
        this.clicks -= 50000;
        this.power += 1;
    }
}

// Cập nhật tick() — bots dùng multiplier
tick() {
    const botClicks = (10 * this.clickBots + 100 * this.bigBots) * this.power;
    if (botClicks > 0) {
        this.clicks += botClicks;
        this.checkLevelUp();
    }
}
```

---

## Bài 13: Define Random Rewards

> **Mục tiêu:** Tạo hệ thống phần thưởng ngẫu nhiên.
>
> **Kỹ năng:** Module design, utility functions.

### 13.1 Tạo `utils.js`

```javascript
/** @odoo-module **/

/**
 * Chọn ngẫu nhiên 1 phần tử từ mảng
 */
export function choose(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
```

### 13.2 Tạo `click_rewards.js`

```javascript
/** @odoo-module **/

import { choose } from "./utils";

export const rewards = [
    {
        description: "🎁 Get 100 free clicks!",
        apply(clicker) {
            clicker.increment(100);
        },
        maxLevel: 2,
    },
    {
        description: "🤖 Get 1 free ClickBot!",
        apply(clicker) {
            clicker.clickBots += 1;
        },
        minLevel: 1,
        maxLevel: 3,
    },
    {
        description: "🤖🤖 Get 5 free ClickBots!",
        apply(clicker) {
            clicker.clickBots += 5;
        },
        minLevel: 2,
    },
    {
        description: "🦾 Get 1 free BigBot!",
        apply(clicker) {
            clicker.bigBots += 1;
        },
        minLevel: 2,
    },
    {
        description: "⚡ Power up! Multiplier +1",
        apply(clicker) {
            clicker.power += 1;
        },
        minLevel: 3,
    },
    {
        description: "💰 Jackpot! Get 10,000 clicks!",
        apply(clicker) {
            clicker.increment(10000);
        },
        minLevel: 2,
    },
];

/**
 * Chọn ngẫu nhiên 1 reward phù hợp với level hiện tại
 */
export function getReward(level) {
    const eligible = rewards.filter((r) => {
        if (r.minLevel !== undefined && level < r.minLevel) return false;
        if (r.maxLevel !== undefined && level >= r.maxLevel) return false;
        return true;
    });
    return choose(eligible);
}
```

### 13.3 Thêm method `getReward` vào `clicker_model.js`

```javascript
import { getReward } from "./click_rewards";

// Trong class ClickerModel:
claimReward() {
    const reward = getReward(this.level);
    if (reward) {
        reward.apply(this);
        return reward;
    }
}
```

---

## Bài 14: Provide a Reward When Opening a Form View

> **Mục tiêu:** 1% chance nhận reward khi mở form view. Dùng `patch` trên FormController.
>
> **Kỹ năng:** `patch()`, `notification` service.

### 14.1 Tạo `patch_form_controller.js`

```javascript
/** @odoo-module **/

import { FormController } from "@web/views/form/form_controller";
import { patch } from "@web/core/utils/patch";
import { useService } from "@web/core/utils/hooks";

patch(FormController.prototype, {
    setup() {
        super.setup(...arguments);

        // 1% chance khi mở form view
        if (Math.random() < 0.01) {
            const clicker = useService("awesome_clicker.clicker");
            const notificationService = useService("notification");
            const actionService = useService("action");

            const reward = clicker.claimReward();
            if (reward) {
                notificationService.add(
                    `🎉 Reward found: ${reward.description}`,
                    {
                        type: "success",
                        sticky: true,     // Không tự biến mất
                        buttons: [
                            {
                                name: "Collect!",
                                primary: true,
                                onClick: () => {
                                    actionService.doAction({
                                        type: "ir.actions.client",
                                        tag: "awesome_clicker.client_action",
                                        target: "new",
                                        name: "Clicker Game",
                                    });
                                },
                            },
                        ],
                    }
                );
            }
        }
    },
});
```

> **`patch()`** thay đổi một class/prototype đã tồn tại mà **không cần sửa source gốc**. Đây là pattern chính để customize Odoo mà không fork code.

---

## Bài 15: Add Commands in Command Palette

> **Mục tiêu:** Thêm lệnh vào Command Palette (mở bằng `Ctrl+K`).
>
> **Kỹ năng:** `command_provider` registry.

### 15.1 Thêm vào `clicker_service.js`

```javascript
const clickerService = {
    dependencies: ["effect"],
    start(env, { effect }) {
        const clicker = new ClickerModel();

        // ... milestone listener ...

        // Đăng ký command providers
        registry.category("command_provider").add("awesome_clicker", {
            provide: (env, options) => [
                {
                    name: "Open Clicker Game",
                    action: () => {
                        env.services.action.doAction({
                            type: "ir.actions.client",
                            tag: "awesome_clicker.client_action",
                            target: "new",
                            name: "Clicker Game",
                        });
                    },
                },
                {
                    name: "Buy 1 ClickBot",
                    action: () => {
                        clicker.buyClickBot();
                    },
                },
            ],
        });

        return clicker;
    },
};
```

---

## Bài 16: Add Trees Resource

> **Mục tiêu:** Thêm loại tài nguyên mới: cây ăn quả (pear/cherries). Level 4 tại 1M clicks.
>
> **Kỹ năng:** Complex state, computed values.

### 16.1 Cập nhật `clicker_model.js`

```javascript
// Thêm thuộc tính state
trees = {
    ppiear: 0,
    cherry: 0,
};
fruits = {
    pear: 0,
    cherry: 0,
};

// Computed getters
get totalTrees() {
    return this.trees.pear + this.trees.cherry;
}

get totalFruits() {
    return this.fruits.pear + this.fruits.cherry;
}

// Level 4 tại 1M clicks
checkLevelUp() {
    // ... levels 1-3 ...
    if (this.clicks >= 1000000 && this.level < 4) {
        this.level = 4;
        this.bus.trigger("MILESTONE", { level: 4 });
    }
}

buyTree(type) {
    if (this.clicks >= 1000000) {
        this.clicks -= 1000000;
        this.trees[type] += 1;
    }
}

// Thêm vào constructor hoặc tick interval
// Mỗi tree cho 1 fruit mỗi 30 giây
constructor() {
    super();
    setInterval(() => this.tick(), 10000);
    setInterval(() => this.fruitTick(), 30000);
}

fruitTick() {
    for (const type of ["pear", "cherry"]) {
        this.fruits[type] += this.trees[type];
    }
}
```

---

## Bài 17: Use a Dropdown Menu for Systray

> **Mục tiêu:** Thay thế systray bằng Dropdown hiển thị thông tin chi tiết.
>
> **Kỹ năng:** `Dropdown`, `DropdownItem` component.

### 17.1 Cập nhật `clicker_systray_item.js`

```javascript
import { Dropdown } from "@web/core/dropdown/dropdown";
import { DropdownItem } from "@web/core/dropdown/dropdown_item";

export class ClickerSystrayItem extends Component {
    static template = "awesome_clicker.ClickerSystrayItem";
    static components = { Dropdown, DropdownItem, ClickValue };
    // ...
}
```

### 17.2 Cập nhật `clicker_systray_item.xml`

```xml
<t t-name="awesome_clicker.ClickerSystrayItem">
    <Dropdown>
        <button class="btn">
            <span>🎮 <ClickValue value="state.clicks"/></span>
            <span t-if="state.level gte 4" class="ms-2">
                🌳 <t t-esc="clicker.totalTrees"/>
            </span>
        </button>

        <t t-set-slot="content">
            <DropdownItem class="'text-muted'" closingMode="'none'">
                <strong>Clicks:</strong> <ClickValue value="state.clicks"/>
            </DropdownItem>
            <DropdownItem t-if="state.level gte 1" class="'text-muted'" closingMode="'none'">
                🤖 ClickBots: <t t-esc="state.clickBots"/>
            </DropdownItem>
            <DropdownItem t-if="state.level gte 2" class="'text-muted'" closingMode="'none'">
                🦾 BigBots: <t t-esc="state.bigBots"/>
            </DropdownItem>
            <div t-if="state.level gte 4" class="dropdown-divider"/>
            <DropdownItem t-if="state.level gte 4" class="'text-muted'" closingMode="'none'">
                🍐 Pear Trees: <t t-esc="state.trees.pear"/> (Fruits: <t t-esc="state.fruits.pear"/>)
            </DropdownItem>
            <DropdownItem t-if="state.level gte 4" class="'text-muted'" closingMode="'none'">
                🍒 Cherry Trees: <t t-esc="state.trees.cherry"/> (Fruits: <t t-esc="state.fruits.cherry"/>)
            </DropdownItem>
            <div class="dropdown-divider"/>
            <DropdownItem onSelected.bind="openClientAction">
                Open Clicker Game
            </DropdownItem>
            <DropdownItem t-if="state.level gte 1"
                          t-att-class="{ 'text-muted': state.clicks lt 1000 }"
                          onSelected.bind="() => this.clicker.buyClickBot()">
                Buy ClickBot (1,000)
            </DropdownItem>
        </t>
    </Dropdown>
</t>
```

---

## Bài 18: Use a Notebook Component

> **Mục tiêu:** Tổ chức UI client action thành tabs.
>
> **Kỹ năng:** `Notebook` component, slots.

### 18.1 Cập nhật `client_action.js`

```javascript
import { Notebook } from "@web/core/notebook/notebook";

export class ClickerClientAction extends Component {
    static components = { ClickValue, Notebook };
    // ...
}
```

### 18.2 Cập nhật `client_action.xml`

```xml
<t t-name="awesome_clicker.ClickerClientAction">
    <div class="p-4">
        <h1>🎮 Clicker Game</h1>
        <Notebook>
            <t t-set-slot="Clicks" title="'Clicks'">
                <div class="p-3">
                    <h2>Clicks: <ClickValue value="state.clicks"/></h2>
                    <button class="btn btn-primary" t-on-click="() => this.clicker.increment(10)">
                        +10 Clicks
                    </button>

                    <div t-if="state.level gte 1" class="mt-3">
                        <h4>🤖 ClickBots: <t t-esc="state.clickBots"/></h4>
                        <button class="btn btn-warning" t-att-disabled="state.clicks lt 1000"
                                t-on-click="() => this.clicker.buyClickBot()">
                            Buy ClickBot (1,000)
                        </button>
                    </div>

                    <div t-if="state.level gte 2" class="mt-3">
                        <h4>🦾 BigBots: <t t-esc="state.bigBots"/></h4>
                        <button class="btn btn-danger" t-att-disabled="state.clicks lt 5000"
                                t-on-click="() => this.clicker.buyBigBot()">
                            Buy BigBot (5,000)
                        </button>
                    </div>

                    <div t-if="state.level gte 3" class="mt-3">
                        <h4>⚡ Power: x<t t-esc="state.power"/></h4>
                        <button class="btn btn-info" t-att-disabled="state.clicks lt 50000"
                                t-on-click="() => this.clicker.buyPower()">
                            Buy Power (50,000)
                        </button>
                    </div>
                </div>
            </t>

            <t t-set-slot="Trees" title="'Trees'" t-if="state.level gte 4">
                <div class="p-3">
                    <h3>🌳 Trees: <t t-esc="clicker.totalTrees"/></h3>
                    <h3>🍎 Fruits: <t t-esc="clicker.totalFruits"/></h3>

                    <div class="mt-3">
                        <h4>🍐 Pear Trees: <t t-esc="state.trees.pear"/>
                            (Fruits: <t t-esc="state.fruits.pear"/>)</h4>
                        <button class="btn btn-success" t-att-disabled="state.clicks lt 1000000"
                                t-on-click="() => this.clicker.buyTree('pear')">
                            Buy Pear Tree (1M)
                        </button>
                    </div>

                    <div class="mt-3">
                        <h4>🍒 Cherry Trees: <t t-esc="state.trees.cherry"/>
                            (Fruits: <t t-esc="state.fruits.cherry"/>)</h4>
                        <button class="btn btn-success" t-att-disabled="state.clicks lt 1000000"
                                t-on-click="() => this.clicker.buyTree('cherry')">
                            Buy Cherry Tree (1M)
                        </button>
                    </div>
                </div>
            </t>
        </Notebook>
    </div>
</t>
```

---

## Bài 19: Persist the Game State

> **Mục tiêu:** Lưu game state vào localStorage mỗi 10 giây.
>
> **Kỹ năng:** `browser.localStorage`, serialization.

### 19.1 Cập nhật `clicker_model.js`

```javascript
import { browser } from "@web/core/browser/browser";

const STORAGE_KEY = "awesome_clicker.state";

export class ClickerModel extends Reactive {
    // ...

    constructor() {
        super();
        this.loadState();
        setInterval(() => {
            this.tick();
            this.saveState();
        }, 10000);
        setInterval(() => this.fruitTick(), 30000);
    }

    saveState() {
        const data = {
            clicks: this.clicks,
            level: this.level,
            clickBots: this.clickBots,
            bigBots: this.bigBots,
            power: this.power,
            trees: { ...this.trees },
            fruits: { ...this.fruits },
        };
        browser.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    loadState() {
        const raw = browser.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                const data = JSON.parse(raw);
                Object.assign(this, data);
            } catch (e) {
                console.warn("Failed to load clicker state", e);
            }
        }
    }
}
```

> **Tại sao `browser.localStorage` thay vì `window.localStorage`?** Odoo wrap `window` trong `browser` object để dễ mock trong unit tests.

---

## Bài 20: Introduce State Migration System

> **Mục tiêu:** Thêm version number và hệ thống migration khi cấu trúc state thay đổi.
>
> **Kỹ năng:** Data migration pattern, versioning.

### 20.1 Thêm version và migrations

```javascript
const CURRENT_VERSION = 1;

const migrations = [
    // Ví dụ migration sẽ thêm ở bài 21
    // { fromVersion: 1, toVersion: 2, apply(state) { state.trees.peach = 0; state.fruits.peach = 0; } }
];

export class ClickerModel extends Reactive {
    // ...

    saveState() {
        const data = {
            version: CURRENT_VERSION,
            clicks: this.clicks,
            level: this.level,
            clickBots: this.clickBots,
            bigBots: this.bigBots,
            power: this.power,
            trees: { ...this.trees },
            fruits: { ...this.fruits },
        };
        browser.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    loadState() {
        const raw = browser.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                let data = JSON.parse(raw);
                data = this.migrateState(data);
                Object.assign(this, data);
            } catch (e) {
                console.warn("Failed to load clicker state", e);
            }
        }
    }

    migrateState(data) {
        let version = data.version || 0;
        // Áp dụng migrations tuần tự
        while (version < CURRENT_VERSION) {
            const migration = migrations.find((m) => m.fromVersion === version);
            if (migration) {
                migration.apply(data);
                version = migration.toVersion;
            } else {
                // Không tìm thấy migration path → reset
                console.warn(`No migration from v${version}, resetting state`);
                return {};
            }
        }
        data.version = CURRENT_VERSION;
        return data;
    }
}
```

---

## Bài 21: Add Peach Trees (Test Migration)

> **Mục tiêu:** Thêm cây đào + viết migration thực tế.
>
> **Kỹ năng:** Thực hành migration system.

### 21.1 Tăng version và thêm migration

```javascript
const CURRENT_VERSION = 2;  // Tăng từ 1 lên 2

const migrations = [
    {
        fromVersion: 1,
        toVersion: 2,
        apply(state) {
            // State cũ v1 không có peach → thêm vào
            state.trees.peach = 0;
            state.fruits.peach = 0;
        },
    },
];
```

### 21.2 Cập nhật model

```javascript
trees = {
    pear: 0,
    cherry: 0,
    peach: 0,    // Mới
};
fruits = {
    pear: 0,
    cherry: 0,
    peach: 0,    // Mới
};

get totalTrees() {
    return this.trees.pear + this.trees.cherry + this.trees.peach;
}
get totalFruits() {
    return this.fruits.pear + this.fruits.cherry + this.fruits.peach;
}
```

### 21.3 Thêm UI cho peach trees (trong `client_action.xml`)

```xml
<div class="mt-3">
    <h4>🍑 Peach Trees: <t t-esc="state.trees.peach"/>
        (Fruits: <t t-esc="state.fruits.peach"/>)</h4>
    <button class="btn btn-success" t-att-disabled="state.clicks lt 1000000"
            t-on-click="() => this.clicker.buyTree('peach')">
        Buy Peach Tree (1M)
    </button>
</div>
```

---

## Bảng Tổng Hợp — Tất Cả Kỹ Năng Đã Học

| Bài | Khái niệm | Import chính |
|-----|-----------|--------------|
| 1 | Systray registry | `registry.category("systray")` |
| 2 | External listeners | `useExternalListener` |
| 3 | Client actions | `registry.category("actions")`, `useService("action")` |
| 4 | Custom services | `reactive`, `registry.category("services")` |
| 5 | Custom hooks | `useService` + `useState` wrapped |
| 6 | Utility functions | `humanNumber` from `@web/core/utils/numbers` |
| 7 | Tooltips | `data-tooltip` attribute |
| 8 | setInterval, conditions | `setInterval`, XML `gte/lt` aliases |
| 9 | Class model (Reactive) | `Reactive` from `@web/core/utils/reactive` |
| 10 | Event Bus + Effects | `EventBus`, effect service |
| 11-12 | Expanding game state | OOP, computed getters |
| 13 | Module design | Separate reward/utils files |
| 14 | Patching classes | `patch()` from `@web/core/utils/patch` |
| 15 | Command palette | `registry.category("command_provider")` |
| 16 | Complex state | Nested objects, computed values |
| 17 | Dropdown component | `Dropdown`, `DropdownItem` |
| 18 | Notebook (tabs) | `Notebook`, slots |
| 19 | LocalStorage | `browser.localStorage` |
| 20-21 | State migration | Versioning, migration functions |

---

## Lưu Ý Quan Trọng

1. **Xóa cache thường xuyên**: `Ctrl+Shift+R` khi sửa JS/XML.
2. **Debug mode**: Thêm `?debug=assets` vào URL để xem file gốc trong DevTools.
3. **XML comparisons**: Không dùng `<` hoặc `>` trực tiếp — dùng `lt`, `lte`, `gt`, `gte`.
4. **Import paths**: Odoo dùng alias `@web/...` thay cho đường dẫn tuyệt đối. Tra cứu trong `__manifest__.py` của module `web`.
5. **Testing**: Chạy từng bài, kiểm tra hoạt động trước khi chuyển sang bài tiếp theo.

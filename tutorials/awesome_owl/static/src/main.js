import { whenReady } from "@odoo/owl"; // là hàm dùng để đợi khi document.body sẵn sàng
import { mountComponent } from "@web/env"; // là hàm dùng để mount component
import { Playground } from "./playground"; // là component cần mount

const config = {
    dev: true, // dev: true là bật chế độ development, dev: false là tắt chế độ development
    name: "Owl Tutorial", // name là tên của app
};

// Mount the Playground component when the document.body is ready
// mountComponent là hàm dùng để mount component, Playground là component cần mount, document.body là element cần mount, config là config của app
whenReady(() => mountComponent(Playground, document.body, config));

/** @odoo-module **/

import { whenReady } from "@odoo/owl";
import { mountComponent } from "@web/env";
import { TaskManager } from "./task_manager";

const config = {
    dev: true,
    name: "TaskFlow ERP",
};

whenReady(() => mountComponent(TaskManager, document.body, config));

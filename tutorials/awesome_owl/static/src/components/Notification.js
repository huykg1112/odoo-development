/** @odoo-module **/

import { Component, useState } from "@odoo/owl";

export class Notification extends Component {
    static template = "awesome_owl.Notification";
    static props = {
        notifications: { type: Array },
    };
}

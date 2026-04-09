import { Component } from "@odoo/owl";
import { humanNumber } from "@web/core/utils/numbers";


export class ClickValue extends Component {
    static template = "awesome_clicker.ClickValue";
    static props = {
        value: Number,
    };

    get formatValue() {
        const value = this.props.value ?? 0; // Dùng 0 nếu value là undefined hoặc null
        return humanNumber(value,{ decimals: 1, minDigits: 1 });
    }
}
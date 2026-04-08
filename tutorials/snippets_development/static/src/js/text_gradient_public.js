/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.TextGradient = publicWidget.Widget.extend({
    selector: '.o_snippet_gradient',
    disabledInEditMode: false,

    start() {
        const result = this._super.apply(this, arguments);
        this._applyGradientStyle();
        return result;
    },

    async _applyGradientStyle() {
        const el = this.el.querySelector('.gradient-text');
        if (!el) {
            return;
        }

        if (!el.style.getPropertyValue('--g-color-1')) {
            el.style.setProperty('--g-color-1', '#00ff00');
        }
        if (!el.style.getPropertyValue('--g-color-2')) {
            el.style.setProperty('--g-color-2', '#ff0000');
        }
        if (!el.style.getPropertyValue('--g-direction')) {
            el.style.setProperty('--g-direction', '45deg');
        }

        el.style.setProperty('display', 'inline-block');
        el.style.setProperty('width', 'fit-content');
        el.style.setProperty('margin', '0');
        el.style.setProperty('padding', '0');
        el.style.setProperty('background-image', 'linear-gradient(var(--g-direction), var(--g-color-1), var(--g-color-2))');
        el.style.setProperty('background-clip', 'text');
        el.style.setProperty('-webkit-background-clip', 'text');
        el.style.setProperty('color', 'transparent');
        el.style.setProperty('-webkit-text-fill-color', 'transparent');
    },
});

export default publicWidget.registry.TextGradient;
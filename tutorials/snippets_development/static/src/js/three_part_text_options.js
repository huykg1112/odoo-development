/** @odoo-module **/

import options from "@web_editor/js/editor/snippets.options";

options.registry.ThreePartText = options.Class.extend({
    /**
     * @override
     */
    async _computeWidgetState(methodName, params) {
        return this._super(...arguments);
    },
});

export default {
    ThreePartText: options.registry.ThreePartText,
};

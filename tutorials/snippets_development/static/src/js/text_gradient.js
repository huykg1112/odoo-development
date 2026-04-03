/** @odoo-module **/

import options from "@web_editor/js/editor/snippets.options";

options.registry.TextGradient = options.Class.extend({
    /**
     * @override
     */
    start() {
        return this._super(...arguments);
    },
});

export default {
    TextGradient: options.registry.TextGradient,
};

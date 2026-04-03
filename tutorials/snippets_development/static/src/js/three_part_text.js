/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.ThreePartText = publicWidget.Widget.extend({
    selector: '.o_snippet_three_text',
    disabledInEditMode: false,

    start() {
        // Snippet logic if any (e.g. animation)
        return this._super.apply(this, arguments);
    },
});

export default publicWidget.registry.ThreePartText;

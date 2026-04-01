/** @odoo-module **/

import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { xml } from "@odoo/owl";
import { useState } from "@odoo/owl";

export class RatingWidget extends Component {
    // ✅ Use xml tagged template literal
    static template = xml`
        <div class="o_rating_widget">
            <span t-foreach="this.stars" t-as="star" t-key="star"
                t-on-click="() => this.setRating(star)" 
                style="cursor:pointer;font-size:32px;margin-right:4px;display:inline-block;transition:all 0.2s ease;">
                <t t-if="this.state.value &gt;= star">★</t>
                <t t-else=""><span style="color:#ddd;">★</span></t>
            </span>
            <span style="margin-left:8px;font-weight:bold;display:inline-block;">
                <t t-if="this.state.value">
                    <t t-out="this.state.value" /> / 5
                </t>
                <t t-else="">No rating</t>
            </span>
        </div>
    `;

    setup() {
        this.stars = [1, 2, 3, 4, 5];
        // ✅ Create reactive state for the rating value
        this.state = useState({
            value: this.props.value || 0,
        });
        console.log("RatingWidget setup - initial value:", this.state.value);
    }

    isActive(star) {
        return this.state.value && star <= this.state.value;
    }

    async setRating(value) {
        if (this.props.readonly) {
            console.log("Field is readonly, cannot change rating");
            return;
        }
        
        console.log("Setting rating to:", value);
        try {
            // ✅ Immediately update the reactive state (UI updates instantly)
            this.state.value = value;
            console.log("State updated to:", this.state.value);
            
            // ✅ Then persist to Odoo backend
            await this.props.update(value);
            console.log("Rating persisted to database");
        } catch (error) {
            console.error("Error updating rating:", error);
            // Revert state on error
            this.state.value = this.props.value || 0;
        }
    }
}

registry.category("fields").add("rating_stars", {
    component: RatingWidget,
    supportedTypes: ["integer"],
    extractProps: (fieldInfo) => {
        console.log("=== RatingWidget extractProps ===");
        console.log("fieldInfo keys:", Object.keys(fieldInfo));
        console.log("fieldInfo:", fieldInfo);
        
        // Log all properties on fieldInfo
        for (let key in fieldInfo) {
            if (fieldInfo.hasOwnProperty(key)) {
                console.log(`fieldInfo.${key}:`, fieldInfo[key]);
            }
        }
        
        // The actual way to update in Odoo 18
        return {
            value: fieldInfo.value || 0,
            readonly: fieldInfo.readonly || false,
            update: async (value) => {
                console.log("=== Update function called ===");
                console.log("New value:", value);
                console.log("fieldInfo.record:", fieldInfo.record);
                console.log("fieldInfo.name:", fieldInfo.name);
                
                try {
                    // ✅ Odoo 18: Use record.update() or write()
                    if (fieldInfo.record && typeof fieldInfo.record.write === 'function') {
                        console.log("Using record.write()");
                        await fieldInfo.record.write({ [fieldInfo.name]: value });
                    }
                    // Fallback: direct update through the record's onchange system
                    else if (fieldInfo.record && typeof fieldInfo.record.update === 'function') {
                        console.log("Using record.update()");
                        await fieldInfo.record.update({ [fieldInfo.name]: value });
                    }
                    // Another fallback: use field's __update if available
                    else if (fieldInfo._setValue) {
                        console.log("Using _setValue()");
                        await fieldInfo._setValue(value);
                    }
                    else {
                        console.log("No record methods found, trying direct value assignment");
                        fieldInfo.value = value;
                    }
                    
                    console.log("✅ Field value updated successfully");
                    return true;
                } catch (error) {
                    console.error("❌ Error in update:", error);
                    throw error;
                }
            },
        };
    },
});
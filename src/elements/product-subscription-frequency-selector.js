import { WWAIBaseProductElement } from './base-product-element.js';
import { SUBSCRIPTION_FREQUENCY_SELECTOR } from '../constants/elements/subscription-frequency-selector-constants.js';
import {updateSubscriptionPlanForGroup} from '../product_group/input_update_utils/subscription_update_utils.js';
import { SELECTORS } from '../constants/selector-constants.js';

export class ProductSubscriptionFrequencySelector extends WWAIBaseProductElement {
    constructor() {
        super();
        this.sellingPlans = [];
        this.selectElement = null;
    }

    getElementName() {
        return "subscription frequency selector"
    }

    connectedCallback() {
        // ✅ Find the existing select element using the selector constant
        const allSelectElements = this.querySelectorAll(SUBSCRIPTION_FREQUENCY_SELECTOR);

        if (allSelectElements.length === 0) {
            console.error(`WWAI-ERROR ❌ No <select> element found with selector ${SUBSCRIPTION_FREQUENCY_SELECTOR}`);
            return;
        }

        if (allSelectElements.length > 1) {
            console.warn(`⚠️ Multiple <select> elements found for subscription frequency. Only the first one will be used.`);
        }

        // Only use the first found select
        this.selectElement = allSelectElements[0];

        // Listen for changes
        this.selectElement.addEventListener('change', (event) => {
            this.handleSubscriptionPlanChange(this.getCurrentSelectedPlan());
        });
    }

    handleSubscriptionPlanChange(plan) {
        updateSubscriptionPlanForGroup(plan, this.sectionId, this.productGroup);
    }

    /* Renders the options in the select dropdown */
    updateSubscriptionOptions(subscriptionOptions) {
        if (!Array.isArray(subscriptionOptions)) {
            console.error("WWAI-ERROR ❌ Invalid subscription options received.");
            return;
        }

        // Clear existing options
        this.selectElement.innerHTML = '';

        // Populate options
        subscriptionOptions.forEach((option) => {
            const optionElement = document.createElement('option');
            optionElement.value = option.selling_plan_id;
            optionElement.textContent = option.option_name;

            // Store additional data as attributes
            optionElement.dataset.beforePrice = option.before_price;
            optionElement.dataset.afterPrice = option.after_price;
            optionElement.dataset.discountPercent = option.discount_percent;

            this.selectElement.appendChild(optionElement);
        });

        console.log("✅ Subscription options updated:", JSON.stringify(subscriptionOptions, null, 2));
    }

    /* Get the currently selected selling plan ID */
    getSelectedPlanId() {
        return this.selectElement.value || null;
    }

    getCurrentSelectedPlan() {
        const selectedOption = this.selectElement.options[this.selectElement.selectedIndex];
        if (selectedOption) {
            // 🔄 Construct the selected plan object
            return {
                option_name: selectedOption.textContent.trim(),
                selling_plan_id: selectedOption.value.trim(),
                before_price: selectedOption.dataset.beforePrice?.trim(),
                after_price: selectedOption.dataset.afterPrice?.trim(),
                discount_percent: selectedOption.dataset.discountPercent?.trim(),
            };
        }
        console.warn("⚠️ No plan currently selected.");
        return null;
    }
}

customElements.define(SELECTORS.PRODUCT_GROUP.SUBSCRIPTION_FREQUENCY, ProductSubscriptionFrequencySelector);
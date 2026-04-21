import { showPopup } from './journey_helpers/show_popup.js';

export class WWAIBaseProductElement extends HTMLElement {
    constructor() {
        super();

        this.sectionId = this.getAttribute('section_id');
        this.productGroup = this.getAttribute('product_group');

        this.registryKey = `${this.sectionId}__${this.productGroup}`;
    }

    initPricingConfig(config) {
        if (!config) {
            console.error("WWAI-ERROR ❌ Pricing Config is missing or invalid.");
            return;
        }
        this.pricingConfig = config;
    }

    initFlowConfig(config) {
        if (!config || !config.destination) {
            console.error("WWAI-ERROR ❌ Flow Config is missing or invalid.");
            // Optionally showPopup if available in context
            if (typeof showPopup === 'function') {
                showPopup("⚠️ Error: Flow Config is not set!", "error", true);
            }
            return;
        }
        this.flowConfig = config;
    }

    initUXConfig(config) {
        if (!config) {
            console.error("WWAI-ERROR ❌ UI Config is missing or invalid.");
            return;
        }
        this.uxConfig = config;
    }
}
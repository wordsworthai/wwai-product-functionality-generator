import { SELECTORS } from '../constants/selector-constants.js';

/**
 * Defines a set of validation rules for product group elements.
 * Each rule specifies a selector and its requirements (e.g., required, min/max count).
*/
export const REQUIRED_SELECTOR_RULES = [
    { selector: SELECTORS.PRODUCT_GROUP.PURCHASE_TYPE, required: false, max: 1, name: 'Purchase Type Selector' },
    { selector: SELECTORS.PRODUCT_GROUP.SUBSCRIPTION_FREQUENCY, required: false, max: 1, name: 'Subscription Frequency Selector' },
    { selector: SELECTORS.PRODUCT_GROUP.ADD_TO_CART, required: false, max: 2, name: 'Add to Cart Button' },
    { selector: SELECTORS.PRODUCT_GROUP.SUBMIT_INTERCEPTOR, required: false, max: 2, name: 'Submit Interceptor' },
    { selector: SELECTORS.PRODUCT_GROUP.PRODUCT_MEDIA_GALLERY_FOR_GRIDS, required: false, max: 1, name: 'Media Gallery for Grids' },
    { selector: SELECTORS.PRODUCT_GROUP.CAROUSEL, required: false, max: 1, name: 'Carousel Media' }
];

/**
 * Defines a set of conditional validation assertions.
 * Each assertion specifies a group name, conditions (logical OR of ANDed selectors), and a message.
*/
export const CONDITIONAL_ASSERTION_RULES = [
    {
        groupName: "Variant Selector",
        conditions: [
            [SELECTORS.PRODUCT_GROUP.VARIANT],
            [SELECTORS.PRODUCT_GROUP.VARIANT_PURCHASE_TYPE_COMBO]
        ],
        message: `Either [${SELECTORS.PRODUCT_GROUP.VARIANT}] or [${SELECTORS.PRODUCT_GROUP.VARIANT_PURCHASE_TYPE_COMBO}] must be present.`,
        enabled: true // Add an 'enabled' flag
    },
    {
        groupName: "Price Selector",
        conditions: [
            [SELECTORS.PRODUCT_GROUP.PRICE],
            [SELECTORS.PRODUCT_GROUP.PRICE_STATIC]
        ],
        message: `Either [${SELECTORS.PRODUCT_GROUP.PRICE}] or [${SELECTORS.PRODUCT_GROUP.PRICE_STATIC}] must be present.`,
        enabled: true // Add an 'enabled' flag
    },
    {
        groupName: "Add to Cart Config",
        conditions: [
            [SELECTORS.PRODUCT_GROUP.ADD_TO_CART, SELECTORS.PRODUCT_GROUP.SUBMIT_INTERCEPTOR],
            [SELECTORS.PRODUCT_GROUP.GRID_SMART_INTERACTION]
        ],
        message: `Either both [${SELECTORS.PRODUCT_GROUP.ADD_TO_CART} and ${SELECTORS.PRODUCT_GROUP.SUBMIT_INTERCEPTOR}] or [${SELECTORS.PRODUCT_GROUP.GRID_ICON_SMART_ADD_TO_CART}] must be present.`,
        enabled: true // Add an 'enabled' flag
    },
    {
        groupName: "Media Display Config",
        conditions: [
            [SELECTORS.PRODUCT_GROUP.CAROUSEL],
            [SELECTORS.PRODUCT_GROUP.PRODUCT_MEDIA_GALLERY_FOR_GRIDS]
        ],
        message: `Either [${SELECTORS.PRODUCT_GROUP.CAROUSEL}] or [${SELECTORS.PRODUCT_GROUP.PRODUCT_MEDIA_GALLERY_FOR_GRIDS}] must be present.`,
        enabled: true // Add an 'enabled' flag
    }
];

// A way to modify rules globally or create rule sets
class ValidationRuleManager {
    constructor(requiredRules, conditionalRules) {
        this.requiredRules = requiredRules;
        this.conditionalRules = conditionalRules;
    }

    // Get all rules
    getAllRules() {
        return {
            required: this.requiredRules,
            conditional: this.conditionalRules.filter(rule => rule.enabled) // Only return enabled conditional rules
        };
    }

    // Example: Modify a specific rule (e.g., disable a conditional check)
    disableConditionalAssertion(groupName) {
        const rule = this.conditionalRules.find(r => r.groupName === groupName);
        if (rule) {
            rule.enabled = false;
            console.log(`Validation: Disabled conditional assertion "${groupName}"`);
        } else {
            console.warn(`Validation: Conditional assertion "${groupName}" not found.`);
        }
    }

    // Example: Enable a specific rule
    enableConditionalAssertion(groupName) {
        const rule = this.conditionalRules.find(r => r.groupName === groupName);
        if (rule) {
            rule.enabled = true;
            console.log(`Validation: Enabled conditional assertion "${groupName}"`);
        } else {
            console.warn(`Validation: Conditional assertion "${groupName}" not found.`);
        }
    }

    // You could add methods to add/remove rules dynamically too
}

// Export an instance of the manager for global use
export const validationRuleManager = new ValidationRuleManager(
    [...REQUIRED_SELECTOR_RULES], // Use spread to allow modification of the instance without affecting original
    [...CONDITIONAL_ASSERTION_RULES]
);
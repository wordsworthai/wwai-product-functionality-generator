import { validationRuleManager } from './validation_rules_registry.js'; // Import the rule manager

export function validateProductGroupRegistry(PRODUCT_GROUP_REGISTRY) {
    console.group('[WWAI] 🧪 Validating Product Group Registry');

    Object.entries(PRODUCT_GROUP_REGISTRY).forEach(([registryKey, group]) => {
        const { sectionId, productGroup, elements } = group;
        const { required: requiredSelectors, conditional: conditionalAssertions } = validationRuleManager.getAllRules();
        const errors = [];

        // ✅ Validate Required Selectors
        requiredSelectors.forEach(({ selector, required, exact, min, max }) => {
        const elList = elements[selector] || [];
        const count = elList.length;

        if (required && count === 0) {
            errors.push(`Missing required selector: ${selector}`);
        }
        if (exact !== undefined && count !== exact) {
            errors.push(`Selector "${selector}" must have exactly ${exact}, found ${count}`);
        }
        if (min !== undefined && count < min) {
            errors.push(`Selector "${selector}" must have at least ${min}, found ${count}`);
        }
        if (max !== undefined && count > max) {
            errors.push(`Selector "${selector}" must have at most ${max}, found ${count}`);
        }
        });

        // ✅ Validate Conditional Assertions
        conditionalAssertions.forEach(({ groupName, conditions, message }) => {
        const isValid = conditions.some(conditionGroup =>
            conditionGroup.every(selector => (elements[selector] || []).length > 0)
        );

        if (!isValid) {
            errors.push(`❌ [${groupName}]: ${message}`);
        }
        });

        // ✅ Display Results
        if (errors.length > 0) {
            console.group(`❌ [${registryKey}] (${sectionId} / ${productGroup})`);
            errors.forEach(msg => console.warn(msg));
            console.groupEnd();
        }
    });

    console.groupEnd();
}
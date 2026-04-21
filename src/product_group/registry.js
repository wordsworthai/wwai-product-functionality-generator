import { validateProductGroupRegistry } from './validate_registry.js';
import { SELECTORS } from '../constants/selector-constants.js';

// 🌐 Global registry
export const PRODUCT_GROUP_REGISTRY = {};
  
const ALL_CUSTOM_SELECTORS = Object.values(SELECTORS.PRODUCT_GROUP); // This dynamically gets all values from the PRODUCT_GROUP object

export function buildProductGroupRegistry() {
    // Clear existing
    Object.keys(PRODUCT_GROUP_REGISTRY).forEach(key => delete PRODUCT_GROUP_REGISTRY[key]);

    ALL_CUSTOM_SELECTORS.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
        const sectionId = el.getAttribute('section_id')?.trim();
        const productGroup = el.getAttribute('product_group')?.trim();

        if (!sectionId || !productGroup) {
            console.error(`WWAI-ERROR ❌ Skipping <${el.tagName.toLowerCase()}> — Missing ${!sectionId ? '`section_id`' : ''}${!sectionId && !productGroup ? ' and ' : ''}${!productGroup ? '`product_group`' : ''}.`, el);
            return;
        }

        const key = `${sectionId}__${productGroup}`;
        PRODUCT_GROUP_REGISTRY[key] = PRODUCT_GROUP_REGISTRY[key] || {
            sectionId,
            productGroup,
            elements: {}
        };

        PRODUCT_GROUP_REGISTRY[key].elements[selector] = PRODUCT_GROUP_REGISTRY[key].elements[selector] || [];
        PRODUCT_GROUP_REGISTRY[key].elements[selector].push(el);
        });
    });

    // 📦 Output clean summary
    const sectionToGroupsMap = {};
    for (const key of Object.keys(PRODUCT_GROUP_REGISTRY)) {
        const { sectionId, productGroup } = PRODUCT_GROUP_REGISTRY[key];
        sectionToGroupsMap[sectionId] = sectionToGroupsMap[sectionId] || new Set();
        sectionToGroupsMap[sectionId].add(productGroup);
    }

    const summary = {};
    for (const [sectionId, groupSet] of Object.entries(sectionToGroupsMap)) {
        summary[sectionId] = Array.from(groupSet);
    }

    console.group('[WWAI] 🧱 Product Group Registry');
    console.table(summary);
    console.groupEnd();

    validateProductGroupRegistry(PRODUCT_GROUP_REGISTRY);
    return PRODUCT_GROUP_REGISTRY;
}

export function getAllSectionProductGroupPairs() {
    return Object.values(PRODUCT_GROUP_REGISTRY).map(({ sectionId, productGroup }) => ({
        sectionId,
        productGroup
    }));
}
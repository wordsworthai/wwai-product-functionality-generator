/**
 * Returns all elements of a given selector for a product group from the registry.
 */
import {PRODUCT_GROUP_REGISTRY} from './registry.js';

export function getElementsForSelectorInGroup(sectionId, productGroup, selector) {
    const registryKey = `${sectionId}__${productGroup}`;
    const groupEntry = PRODUCT_GROUP_REGISTRY[registryKey];

    if (!groupEntry || !groupEntry.elements || !groupEntry.elements[selector]) {
        return [];
    }

    return groupEntry.elements[selector];
}

export function getUniqueElementForSelectorInGroup(sectionId, productGroup, selector) {
    const elements = getElementsForSelectorInGroup(sectionId, productGroup, selector);
  
    if (elements.length === 0) {
      console.warn(`⚠️ No element found for selector="${selector}" in group [${sectionId} / ${productGroup}]`);
      return null;
    }
  
    if (elements.length > 1) {
      console.error(`WWAI-ERROR ❌ Expected only one element for selector="${selector}" but found ${elements.length} in group [${sectionId} / ${productGroup}]`);
      return null;
    }
  
    return elements[0];
}

export function getScopeForUniqueSelectorInGroup(sectionId, productGroup, selector) {
    const el = getUniqueElementForSelectorInGroup(sectionId, productGroup, selector);

    if (!el) {
        throw new Error(`❌ No unique element found for selector="${selector}" in [${sectionId} / ${productGroup}]`);
    }

    if (!el.scope) {
        throw new Error(`❌ Unique element for selector="${selector}" in [${sectionId} / ${productGroup}] does not have a .scope property`);
    }

    return el.scope;
}

export function getAllSelectorsInGroup(sectionId, productGroup) {
    const registryKey = `${sectionId}__${productGroup}`;
    const groupEntry = PRODUCT_GROUP_REGISTRY[registryKey];

    if (!groupEntry || !groupEntry.elements) {
        return [];
    }

    return Object.keys(groupEntry.elements);
}
  
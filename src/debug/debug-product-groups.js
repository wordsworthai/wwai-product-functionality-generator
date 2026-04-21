import { SELECTORS } from '../constants/selector-constants.js';
  
import { injectFloatingDebugLayer, removeFloatingDebugLayer } from '../highlighter/product-variant-selector/element-highlighter.js';
import { setupFunctionalityDebugToggle } from '../utils/debug-callbacks-setup.js';

export function enableSectionDebugging(sectionElements) {
    if (!sectionElements || !sectionElements.length) return;

    setupFunctionalityDebugToggle((debugMode, { isFirstSet }) => {
        sectionElements.forEach((el) => {
        if (debugMode === true) {
            injectFloatingDebugLayer(el);
        } else if (debugMode === false && !isFirstSet) {
            removeFloatingDebugLayer(el);
        }
        });
    });
}

const ALL_CUSTOM_SELECTORS = Object.values(SELECTORS.PRODUCT_GROUP); // This dynamically gets all values from the PRODUCT_GROUP object

/**
 * 🧪 Validates selectors for required attributes and builds section-productGroup mapping.
 */
export function validateSelectorsAndBuildMapping() {
    const mapping = {};

    ALL_CUSTOM_SELECTORS.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
        const sectionId = el.getAttribute('section_id')?.trim();
        const productGroup = el.getAttribute('product_group')?.trim();
        const sectionExists = sectionId && !!document.getElementById(sectionId);

        const messages = [];
        let hasError = false;

        if (!sectionId) {
            hasError = true;
            messages.push('Missing `section_id` attribute.');
        } else if (!sectionExists) {
            hasError = true;
            messages.push(`No element found in DOM with id="${sectionId}".`);
        }

        if (!productGroup) {
            hasError = true;
            messages.push('Missing `product_group` attribute.');
        }

        const previousMessages = (() => {
            try {
            return JSON.parse(el.getAttribute('debug_message')) || [];
            } catch {
            return [];
            }
        })();

        const previousStatus = el.getAttribute('debug_status') || 'valid';
        const newStatus = hasError || previousStatus === 'error' ? 'error' : previousStatus;

        const mergedMessages = Array.from(new Set([...previousMessages, ...messages]));

        el.setAttribute('debug_status', newStatus);
        el.setAttribute('debug_message', JSON.stringify(mergedMessages));

        if (!hasError && sectionId && productGroup) {
            mapping[sectionId] = mapping[sectionId] || new Set();
            mapping[sectionId].add(productGroup);
        }
        });
    });

    return mapping;
}
  
/**
 * 🧾 Updates section-level debug messages based on mapping and triggers visual debug overlay.
 */
export function finalizeSectionDebugMessages(mapping) {
    const sectionElementsToDebug = [];

    for (const [sectionId, groupSet] of Object.entries(mapping)) {
        const sectionEl = document.getElementById(sectionId);
        if (!sectionEl) continue;

        const groupList = Array.from(groupSet);
        const message = `✅ Product groups in this section: ${groupList.length} /  ${groupList.join(', ')}`;

        const existingMessages = (() => {
        try {
            return JSON.parse(sectionEl.getAttribute('debug_message')) || [];
        } catch {
            return [];
        }
        })();

        const mergedMessages = Array.from(new Set([...existingMessages, message]));

        sectionEl.setAttribute('debug_status', 'valid');
        sectionEl.setAttribute('debug_message', JSON.stringify(mergedMessages));

        sectionElementsToDebug.push(sectionEl);
    }

    enableSectionDebugging(sectionElementsToDebug);
}
  
/**
 * 🚀 Main function to run validation and summary.
 */
export function validateSectionProductGroupsAndAddSectionDebug() {
    const rawMapping = validateSelectorsAndBuildMapping();

    // Trigger section-level debug overlays and messages.
    finalizeSectionDebugMessages(rawMapping);

    // Convert sets to arrays for return value
    const finalMapping = {};
    for (const [sectionId, groupSet] of Object.entries(rawMapping)) {
        finalMapping[sectionId] = Array.from(groupSet);
    }

    return finalMapping;
}
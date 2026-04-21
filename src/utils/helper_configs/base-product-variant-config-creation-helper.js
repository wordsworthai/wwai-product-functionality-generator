import {buildProductHierarchyFromSelector} from '../../utils/element-selector-utils/product-variant-selector-utils.js';
import {
    VARIANT_CUSTOM_LABEL_VALUE_ATTR,
    VARIANT_CUSTOM_LABEL_SELECTOR
} from '../../constants/elements/variant-custom-label-constants.js';
import { SELECTORS } from '../../constants/selector-constants.js';

export function generateProductVariantOverrides() {
    const selectors = [
        SELECTORS.PRODUCT_GROUP.VARIANT,
        SELECTORS.PRODUCT_GROUP.VARIANT_PURCHASE_TYPE_COMBO
    ].filter(Boolean).join(', ');
      
    const allVariantSelectors = document.querySelectorAll(selectors);

    const allLabelSelectors = document.querySelectorAll('product-variant-custom-labeled-text-selector');
    const OUTPUT = {};

    allVariantSelectors.forEach(selector => {
        const productGroup = selector.getAttribute('product_group');
        const rawSectionId = selector.sectionId;

        let sectionId = rawSectionId;
        if (rawSectionId.includes("__")) {
            sectionId = rawSectionId.split("__")[1];
        }
        else if (rawSectionId.includes("--")) {
            sectionId = rawSectionId.split("--")[1];
        }
        
        const hierarchy = buildProductHierarchyFromSelector(selector);

        if (!OUTPUT[sectionId]) OUTPUT[sectionId] = {};
        if (!OUTPUT[sectionId][productGroup]) OUTPUT[sectionId][productGroup] = {};

        hierarchy.productLabels.forEach(productLabel => {
        const variantMap = hierarchy.variants[productLabel] || {};
        if (!OUTPUT[sectionId][productGroup][productLabel]) {
            OUTPUT[sectionId][productGroup][productLabel] = {};
        }

        const variantKeys = [];
        (variantMap.option1 || []).forEach(o1 => {
            const option2s = variantMap.option2?.length ? variantMap.option2 : [""];
            const option3s = variantMap.option3?.length ? variantMap.option3 : [""];

            option2s.forEach(o2 => {
            option3s.forEach(o3 => {
                const key = [o1, o2, o3]
                .filter(Boolean)          // ✅ Remove falsy values (null, undefined, empty strings)
                .map(item => item.trim()) // ✅ Trim spaces from each item
                .join(" | ");             // ✅ Join with separator

                variantKeys.push(key);
            });
            });
        });

        const customLabelTextMap = {};
        const matchingLabelSelector = Array.from(allLabelSelectors).find(el => {
            let elSectionId = el.getAttribute('section_id') || '';
            if (elSectionId.includes('__')) {
                elSectionId = elSectionId.split('__')[1];
            }
            else if (elSectionId.includes('--')) {
                elSectionId = elSectionId.split('--')[1];
            }
        
            return elSectionId === sectionId && el.getAttribute('product_group') === productGroup;
        });

        if (matchingLabelSelector) {
            const labelEls = matchingLabelSelector.querySelectorAll(VARIANT_CUSTOM_LABEL_SELECTOR);
            labelEls.forEach(el => {
            const label = el.getAttribute(VARIANT_CUSTOM_LABEL_VALUE_ATTR);
            const text = el.textContent.trim();
            if (label) {
                customLabelTextMap[label] = text;
            }
            });
        }

        variantKeys.forEach(variantKey => {
            OUTPUT[sectionId][productGroup][productLabel][variantKey] = {
            customMediaLabel: null,
            redirectToMediaIndex: null,
            customLabelText: { ...customLabelTextMap }
            };
        });
        });
    });

    return OUTPUT;
}
  
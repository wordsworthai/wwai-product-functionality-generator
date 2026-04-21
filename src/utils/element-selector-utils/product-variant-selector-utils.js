import {
    VARIANT_ATTR_OPTION_TYPE,
    VARIANT_ATTR_PRODUCT_LABEL,
    VARIANT_ATTR_VARIANT_LABEL,
    VARIANT_OPTION_TYPE_VALUES,
    VARIANT_ATTR_VARIANT_LABEL_LEVEL
} from '../../constants/elements/variant-selector-constants.js';
    

export function getCheckedInputs(inputsNodeList) {
    return [...inputsNodeList].filter(input => input.checked);
}
  
export function getProductLabelFromInputs(selectedInputs) {
    return selectedInputs.find(
        input => input.getAttribute(VARIANT_ATTR_OPTION_TYPE) === VARIANT_OPTION_TYPE_VALUES.PRODUCT
      )?.getAttribute(VARIANT_ATTR_PRODUCT_LABEL);
}
  
export function buildVariantOptionsFromInputs(selectedInputs, productLabel) {
    const options = {};
    const seenLevels = {};

    selectedInputs.forEach(input => {
        if (
            input.getAttribute(VARIANT_ATTR_OPTION_TYPE) === VARIANT_OPTION_TYPE_VALUES.PRODUCT_VARIANT &&
            input.getAttribute(VARIANT_ATTR_PRODUCT_LABEL) === productLabel
        ) {
        const level = input.getAttribute(VARIANT_ATTR_VARIANT_LABEL_LEVEL) || 'option1';
        const value = input.getAttribute(VARIANT_ATTR_VARIANT_LABEL);

        if (seenLevels[level]) {
            console.warn(`❌ Multiple variant options selected for "${level}" in product "${productLabel}"`);
        } else {
            options[level] = value;
            seenLevels[level] = true;
        }
        }
    });

    if (Object.keys(options).length === 0) {
        console.warn(`❌ No variant options found for product "${productLabel}", Returning default option "__wwai_first__"`);
        return {"option1": "__wwai_first__"};
    }

    return options;
}
  
export function selectProductRadio(productRadios, productLabel, sectionId) {
    let found = false;
    productRadios.forEach(input => {
        const label = input.getAttribute(VARIANT_ATTR_PRODUCT_LABEL)?.trim();
        const match = label === productLabel.trim();
        input.checked = match;
        if (match) found = true;
    });

    if (!found) {
        console.warn(`❌ No radio input matched product label: "${productLabel}" in <product-variant-selector> [${sectionId}].`);
    }

    return found;
}
export function buildVariantMapForProduct(variantRadios, productLabel) {
    const map = {};
    variantRadios.forEach(input => {
        const label = input.getAttribute(VARIANT_ATTR_PRODUCT_LABEL)?.trim();
        const level = input.getAttribute(VARIANT_ATTR_VARIANT_LABEL_LEVEL) || 'option1';
        const value = input.getAttribute(VARIANT_ATTR_VARIANT_LABEL)?.trim();

        if (label === productLabel.trim()) {
        if (!map[level]) map[level] = new Set();
        map[level].add(value);
        }
    });
    return map;
}
  
export function validateRequiredVariantLevels(productLabel, variantMap, optionsObject) {
    let valid = true;
    Object.entries(variantMap).forEach(([level, values]) => {
        if (values.size > 1 && !(level in optionsObject)) {
        console.warn(`❌ Missing required variant option for "${level}" (multiple options exist) in product "${productLabel}"`);
        valid = false;
        }
    });
    return valid;
}
  
export function applyVariantSelections(variantRadios, productLabel, optionsObject) {
    let allMatched = true;

    Object.entries(optionsObject).forEach(([level, value]) => {
        let matched = false;

        // 🔍 Trim the value once before looping
        const trimmedValue = value.trim();

        variantRadios.forEach(input => {
            const label = input.getAttribute(VARIANT_ATTR_PRODUCT_LABEL)?.trim();
            const inputLevel = input.getAttribute(VARIANT_ATTR_VARIANT_LABEL_LEVEL) || 'option1';
            const inputValue = input.getAttribute(VARIANT_ATTR_VARIANT_LABEL)?.trim();

            if (label === productLabel.trim() && inputLevel === level) {
                input.checked = inputValue === trimmedValue;
                if (inputValue === trimmedValue) {
                    matched = true;
                }
            }
            else if (label !== productLabel.trim()) {
                input.checked = false;
            }
        });

        if (!matched) {
            console.warn(`⚠️ No match for [${level} = "${trimmedValue}"] in product "${productLabel.trim()}"`);
            allMatched = false;
        }
    });

    return allMatched;
}
  
export function buildProductHierarchyFromSelector(productVariantSelector) {
    const inputs = productVariantSelector ? productVariantSelector.inputs : null;
    if (!inputs || inputs.length === 0) {
        console.error(`WWAI-ERROR [buildProductHierarchyFromSelector] ❌ No inputs found on selector: ${productVariantSelector}`);
        return null; // Safely return null instead of crashing
    }    

    const productLabels = new Set();
    const variants = {};

    inputs.forEach(input => {
    const type = input.getAttribute(VARIANT_ATTR_OPTION_TYPE);

    const productLabel = input.getAttribute(VARIANT_ATTR_PRODUCT_LABEL);

    if (!productLabel) return;

    productLabels.add(productLabel);

    if (!variants[productLabel]) {
        variants[productLabel] = {};
    }

    if (type === 'product_variant') {
        const variantLabel = input.getAttribute(VARIANT_ATTR_VARIANT_LABEL);
        const level = input.getAttribute(VARIANT_ATTR_VARIANT_LABEL_LEVEL) || 'option1';

        if (!variants[productLabel][level]) {
        variants[productLabel][level] = new Set();
        }

        variants[productLabel][level].add(variantLabel);
    }
    });

    // Convert Sets to arrays
    const hierarchy = {
    productLabels: [...productLabels],
    variants: {}
    };

    Object.entries(variants).forEach(([productLabel, levelMap]) => {
    hierarchy.variants[productLabel] = {};
    Object.entries(levelMap).forEach(([level, valueSet]) => {
        hierarchy.variants[productLabel][level] = [...valueSet];
    });
    });

    return hierarchy;
}
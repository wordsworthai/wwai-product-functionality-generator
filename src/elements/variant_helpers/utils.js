import {
    VARIANT_ATTR_VARIANT_LABEL_LEVEL, 
    VARIANT_ATTR_VARIANT_LABEL, 
    VARIANT_ATTR_VARIANT_LABEL_KEY
  } from '../../constants/elements/variant-selector-constants.js';

import {buildProductHierarchyFromSelector, 
    getCheckedInputs,
    getProductLabelFromInputs
} from '../../utils/element-selector-utils/product-variant-selector-utils.js';
  
export function hideSingleSizeVariantOptions(
    variantRadios, 
    productLabel, 
    hierarchy, 
    hideSingleSizeVariants
) {
if (!hideSingleSizeVariants) return;
    console.log(`🛠️ Hiding single size variants for product: ${productLabel}`);
    // Fetch the variant hierarchy for this product
    const variantHierarchy = hierarchy.variants[productLabel];

    // Loop through each level (option1, option2, etc.)
    Object.entries(variantHierarchy).forEach(([level, values]) => {
        if (values.length === 1) {
            console.log(`🔍 Single variant detected at ${level}: ${values[0]}`);
            const singleValue = values[0].trim();

            variantRadios.forEach((input) => {
                const inputLevel = input.getAttribute(VARIANT_ATTR_VARIANT_LABEL_LEVEL) || 'option1';
                const inputValue = input.getAttribute(VARIANT_ATTR_VARIANT_LABEL)?.trim();

                if (inputLevel === level && inputValue === singleValue) {
                    console.log(`🙈 Hiding input for ${level} = ${singleValue}`);
                    input.parentElement.style.display = "none"; // Hide the input wrapper
                    input.checked = true; // Automatically select it

                    // ✅ Search for `data-wwai-product-variant-option-wrapper` in top 5 parent nodes
                    let currentNode = input.parentElement;
                    let foundWrapper = false;

                    for (let i = 0; i < 5; i++) {
                        if (!currentNode) break;
                        if (currentNode.hasAttribute('data-wwai-product-variant-option-wrapper')) {
                            console.log("🎯 Found wrapper, setting display to none");
                            currentNode.style.display = "none";
                            foundWrapper = true;
                            break;
                        }
                        currentNode = currentNode.parentElement;
                    }

                    if (!foundWrapper) {
                        console.log(`⚠️ No wrapper found for ${singleValue}`);
                    }
                }
            });
        }
    });
}

export function hideAllExceptMatchingVariant(variantRadios, valueToKeep) {
    if (!valueToKeep) return;

    // Normalize the value to keep
    const normalizedValue = valueToKeep.trim().toLowerCase();

    // Loop through each variant radio
    variantRadios.forEach((input) => {
        const variantKey = input.getAttribute(VARIANT_ATTR_VARIANT_LABEL_KEY)?.trim().toLowerCase();

        if (variantKey && variantKey.includes(normalizedValue)) {
            // ✅ Only update if it is explicitly set to "none"
            if (input.parentElement.style.display === "none") {
                input.parentElement.style.display = ""; // Revert to original state
            }

            // Search for `data-wwai-product-variant-option-wrapper` in top 5 parent nodes
            let currentNode = input.parentElement;
            for (let i = 0; i < 5; i++) {
                if (!currentNode) break;
                if (currentNode.hasAttribute('data-wwai-product-variant-option-wrapper')) {
                    if (currentNode.style.display === "none") {
                        console.log(`↪️ Display was 'none', reverting back to original`);
                        currentNode.style.display = ""; // Revert to original state
                    }
                    break;
                }
                currentNode = currentNode.parentElement;
            }
        } else {
            input.parentElement.style.display = "none";

            // Hide the wrapper if it exists
            let currentNode = input.parentElement;
            for (let i = 0; i < 5; i++) {
                if (!currentNode) break;
                if (currentNode.hasAttribute('data-wwai-product-variant-option-wrapper')) {
                    currentNode.style.display = "none";
                    break;
                }
                currentNode = currentNode.parentElement;
            }
        }
    });
}

export function getValidOptionCount(hierarchy, hideSingleSizeVariants) {
    if (!hierarchy || !hierarchy.variants) return { count: 0, lastValidOption: null };

    const productLabel = Object.keys(hierarchy.variants)[0]; // Get the product label
    if (!productLabel) return { count: 0, lastValidOption: null };

    const variantOptions = hierarchy.variants[productLabel];

    // Loop through each option (option1, option2, option3, ...)
    let count = 0;
    let lastValidOption = null;

    Object.entries(variantOptions).forEach(([key, values]) => {
        if (values && values.length > 0) {
            if (hideSingleSizeVariants && values.length === 1) {
                console.log(`🙈 Ignoring single-size variant for ${key}`);
            } else {
                count++;
                lastValidOption = key; // Update the last valid option
            }
        }
    });

    return {
        count,
        lastValidOption
    };
}

export function handleVariantUXConfig({
    rootElement,
    variantRadios,
    inputs,
    sectionId,
    productGroup,
    uxConfig = {}
  }) {
    if (!uxConfig) {
        console.warn("⚠️ No variant UX config provided.");
        return;
    }

    const {
        hideSingleLengthVariants,
        onlyShowVariantsWithLabelContains,
    } = uxConfig;

    if (!variantRadios || !variantRadios.length) {
        console.warn(`⚠️ No variant radios found in <product-variant-selector> [${sectionId}].`);
        return;
    }

    const selectedInputs = getCheckedInputs(inputs);
    const productLabel = getProductLabelFromInputs(selectedInputs);
    const hierarchy = buildProductHierarchyFromSelector(rootElement);

    if (hideSingleLengthVariants) {
        console.log(`🔧 Hiding single-length variants for [${productGroup}, ${sectionId}]`);
        hideSingleSizeVariantOptions(
        variantRadios,
        productLabel,
        hierarchy,
        hideSingleLengthVariants
        );
    }

    if (onlyShowVariantsWithLabelContains) {
        console.log(`🔧 Showing only variants matching "${onlyShowVariantsWithLabelContains}" for [${productGroup}, ${sectionId}]`);
        hideAllExceptMatchingVariant(
        variantRadios,
        onlyShowVariantsWithLabelContains
        );
    }
}
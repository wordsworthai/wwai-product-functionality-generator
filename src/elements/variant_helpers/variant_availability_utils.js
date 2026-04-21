import {
    VARIANT_ATTR_OPTION_TYPE, 
    VARIANT_ATTR_VARIANT_LABEL, 
    VARIANT_OPTION_TYPE_VALUES, 
    VARIANT_ATTR_VARIANT_LABEL_LEVEL,
    VARIANT_ATTR_PRODUCT_LABEL
  } from '../../constants//elements/variant-selector-constants.js';

import { getProductFromGroup } from '../../utils/product-lookup/product-object-utils.js';


export function disableUnavailableOptions(inputs, availableOptions, numVariants) {
    console.log("🔄 Disabling unavailable options:", inputs, availableOptions);
    inputs.forEach((input) => {
        // Only consider inputs for product variant options
        if (input.getAttribute(VARIANT_ATTR_OPTION_TYPE) === VARIANT_OPTION_TYPE_VALUES.PRODUCT_VARIANT) {
            const level = input.getAttribute(VARIANT_ATTR_VARIANT_LABEL_LEVEL) || "option1";
            
            // check if this variant option is available or not and 
            // if the input should be disabled or not.
            const value = input.getAttribute(VARIANT_ATTR_VARIANT_LABEL);
            let isAvailable = availableOptions[level]?.has(value.trim());
            
            // If number of variants is 1, then one available options exists in list 
            // and we should not disable the input. In this case, the label might not match
            // since we might have one option with default title.
            if (numVariants == 1 && availableOptions[level].size == 1) {
                isAvailable = true;
            }

            const inputLabel = document.querySelector(`label[for="${input.id}"]`);

            input.disabled = !isAvailable;
            input.style.opacity = isAvailable ? "" : "0.5";
            input.style.pointerEvents = isAvailable ? "" : "none";
            input.style.cursor = isAvailable ? "" : "not-allowed";

            if (inputLabel) {
                inputLabel.style.color = isAvailable ? "" : "#aaa";
                inputLabel.style.cursor = isAvailable ? "" : "not-allowed";
            }
        }
    });
}

/**
 * Randomly removes either the first or last option from option3 set.
 * This is typically used for testing or mocking unavailable options.
 */
export function randomlyRemoveOptions(availableOptions, log = true) {
    const option3Set = availableOptions?.option3;

    if (!option3Set || option3Set.size <= 1) return;

    const option3Array = Array.from(option3Set);
    const removeIndex = Math.random() > 0.5 ? 0 : option3Array.length - 1;
    const removedOption = option3Array[removeIndex];

    option3Set.delete(removedOption);

    if (log) {
        console.log(`🔄 Removed "${removedOption}" from option3`);
    }
}

function createAvailableOptions(variants) {
    // Initialize the sets for each option level
    const availableOptions = {
        option1: new Set(),
        option2: new Set(),
        option3: new Set()
    };

    // Loop through the variants to populate the sets
    variants.forEach((variant) => {
        if (variant.available) {
            if (variant.option1) {
            availableOptions.option1.add(variant.option1.trim());
            }
            if (variant.option2) {
                availableOptions.option2.add(variant.option2.trim());
            }
            if (variant.option3) {
                availableOptions.option3.add(variant.option3.trim());
            }
        }
    });

    return availableOptions;
}
  
export function updateVariantSelectionInputsForAvailability(
    productGroup,
    variantSelectorElement,
    config_options = {}
  ) {
    const { mock = false } = config_options;

    if (!variantSelectorElement || !variantSelectorElement.inputs) {
        console.warn("⚠️ Invalid or missing variant selector element.");
        return;
    }

    let variantAvailableProductLabels = [];
    variantSelectorElement.inputs.forEach(input => {
        variantAvailableProductLabels.push(input.getAttribute(VARIANT_ATTR_PRODUCT_LABEL));
    });
    variantAvailableProductLabels = [...new Set(variantAvailableProductLabels)];

    console.log("🔄 Variant available product labels:", variantAvailableProductLabels);

    for (const productLabel of variantAvailableProductLabels) {
        console.log("🔄 Variant Availability Product label:", productLabel);
        const productObject = getProductFromGroup(productGroup, productLabel);
        
        if (!productObject?.variants || !Array.isArray(productObject.variants)) {
            console.warn("⚠️ Product object does not contain variants.");
            return;
        }

        const availableOptions = createAvailableOptions(productObject.variants);
        let numVariants = productObject.variants.length;
        console.log("🔄 Available options:", availableOptions);

        if (mock) {
            randomlyRemoveOptions(availableOptions, true);
        }
        console.log("🔄 Available options after mock:", availableOptions);

        let filterdVariantOptions = [];
        variantSelectorElement.inputs.forEach(input => {
            if (input.getAttribute(VARIANT_ATTR_PRODUCT_LABEL) === productLabel) {
                filterdVariantOptions.push(input);
            }
        });
        console.log("🔄 Variant options for selected product:", productLabel, filterdVariantOptions, availableOptions);
        disableUnavailableOptions(filterdVariantOptions, availableOptions, numVariants);
    }
}

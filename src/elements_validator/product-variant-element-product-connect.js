import { getProductFromGroup } from '../utils/product-lookup/product-object-utils.js';
import {
  DEFAULT_VARIANT_NAME,
  VARIANT_TREE_KEYS
} from '../constants/elements/variant-selector-constants.js';

function isDefaultSingleVariant(variantOptions) {
  return (
    variantOptions.length === 1 &&
    variantOptions[0].length === 1 &&
    variantOptions[0][0] === DEFAULT_VARIANT_NAME
  );
}

function isSingleWwaiFirstOption(variantOptions, optionTree) {
  return (
    Array.isArray(variantOptions) &&
    variantOptions.length === 1 &&
    optionTree &&
    Object.keys(optionTree).length === 1 &&
    Array.isArray(optionTree.option1) &&
    optionTree.option1.length === 1 &&
    optionTree.option1[0] === '__wwai_first__'
  );
}

export function validateExhaustiveOptionsAgainstVariants(productGroup, productHierarchy) {
    const mismatches = [];

    for (const productLabel of productHierarchy.productLabels) {
      const product = getProductFromGroup(productGroup, productLabel);
      if (!product || !product.variants || product.variants.length === 0) {
        mismatches.push(`Product "${productLabel}" has no variants in product data.`);
        continue;
      }
  
      const variantOptions = product.variants.map(v =>
        [v.option1, v.option2, v.option3].filter(Boolean).map(opt => opt.trim())
      );

      if (isDefaultSingleVariant(variantOptions)) {
        console.warn(`Skipping exhaustive check for product "${productLabel}" — single default variant.`);
        continue;
    }

      const optionTree = productHierarchy.variants[productLabel];
      if (!optionTree || Object.keys(optionTree).length === 0) {
        mismatches.push(`Product "${productLabel}" has no variant options defined in html hierarchy.`);
        continue;
      }
  
      const option1Values = optionTree.option1 || [];
      const option2Values = optionTree.option2 || [null];
      const option3Values = optionTree.option3 || [null];

      for (const o1 of option1Values) {
        for (const o2 of option2Values) {
          for (const o3 of option3Values) {
            const currentCombo = [o1, o2, o3].filter(Boolean).map(opt => opt.trim());
            const exists = variantOptions.some(
              variantCombo =>
                currentCombo.length === variantCombo.length &&
                currentCombo.every((val, idx) => val === variantCombo[idx])
            );
  
            if (!exists) {
              if (isSingleWwaiFirstOption(variantOptions, optionTree)) {
                console.warn('WWAI-WARN: Single variant option with special label __wwai_first__ detected. Skipping mismatch push.');
              } else {
                mismatches.push(
                  `Variant [${currentCombo.join(', ')}] missing for product "${productLabel}" in product data.`
                );
              }
            }
          }
        }
      }
    }
    return mismatches;
}
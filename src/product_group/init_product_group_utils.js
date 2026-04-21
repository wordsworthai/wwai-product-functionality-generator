import { resolveProductGroupConfig } from "../utils/product-config-lookup-utils.js";
import { initAllConfigsForGroup } from './init_configs.js';
import { resolveProductDataAndConfigForLabel } from "./input_update_utils/update_utils.js";
import { updateVariantSelectionInputsForAvailability } from "../elements/variant_helpers/variant_availability_utils.js";
import { applyDiscountCodeOnce } from "../elements/journey_helpers/discount_utils.js";

// Extract variant options from dispatch config.
export function extractVariantOptionsFromDispatchConfig(dispatchConfig) {
  const options = {};

  if (dispatchConfig.defaultVariantOption1) {
    options.option1 = dispatchConfig.defaultVariantOption1;
  }

  if (dispatchConfig.defaultVariantOption2) {
    options.option2 = dispatchConfig.defaultVariantOption2;
  }

  if (dispatchConfig.defaultVariantOption3) {
    options.option3 = dispatchConfig.defaultVariantOption3;
  }

  return options;
}

// Apply discount codes (if present)
export function applyDiscountCodesFromConfig(config) {
  const codes = config?.pricingConfig?.discountCodeToApply || [];
  codes
    .filter(code => typeof code === "string" && code.trim())
    .forEach(code => applyDiscountCodeOnce(code.trim(), false));
}

// Get product label and variant options from config
export function getProductLabelAndVariantOptions(config, sectionId, productGroup) {
  if (!config || !config.variantDispatchConfig) {
    console.error("WWAI-ERROR ❌ No config found for sectionId:", sectionId, "productGroup:", productGroup);
    return { productLabel: null, variantOptions: null };
  }

  const productLabel = config.variantDispatchConfig.defaultProduct;
  const variantOptions = extractVariantOptionsFromDispatchConfig(config.variantDispatchConfig);
  
  return { productLabel, variantOptions };
}

// Resolve configs and perform setup
export function resolveAndApplyConfigsDiscountCodeAndAvailability({ 
  sectionId, 
  productGroup, 
  variantSelector
}) {
  const config = resolveProductGroupConfig(sectionId, productGroup);
  
  const { productLabel, variantOptions } = getProductLabelAndVariantOptions(config, sectionId, productGroup);
  
  if (!productLabel || !variantOptions) {
    return {
      config: null,
      variant_config: null,
      product_object: null,
      variant_object: null,
      productLabel: null,
      variantOptions: null
    };
  }

  const {
    config: resolvedConfig,
    variant_config,
    product_object,
    variant_object
  } = resolveProductDataAndConfigForLabel(sectionId, productGroup, productLabel, variantOptions);
  
  // Initialize all configs for the group.
  // This should be loaded before the discount codes are applied, since UI might depend on the configs.
  initAllConfigsForGroup({ sectionId, productGroup, config: resolvedConfig });

  // Apply discount codes (if present)
  applyDiscountCodesFromConfig(resolvedConfig);

  // Update variant option availability for all product labels in the product group.
  updateVariantSelectionInputsForAvailability(
    productGroup,
    variantSelector, 
    { mock: true }
  );

  return {
    config: resolvedConfig,
    variant_config,
    product_object,
    variant_object,
    productLabel,
    variantOptions
  };
} 
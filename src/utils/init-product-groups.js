import {resolveProductGroupConfig} from './product-config-lookup-utils.js';

export function applyDefaultVariantConfigToSelector(selector) {
    const config = resolveProductGroupConfig(selector.sectionId, selector.productGroup).variantDispatchConfig;
    if (!config) {
      console.warn("⚠️ No variant config found for selector.");
      return;
    }
  
    const options = {};
    if (config.defaultVariantOption1) options.option1 = config.defaultVariantOption1;
    if (config.defaultVariantOption2) options.option2 = config.defaultVariantOption2;
    if (config.defaultVariantOption3) options.option3 = config.defaultVariantOption3;
  
    selector.setSelectedProductAndOptions(config.defaultProduct, options);
    console.log(`✅ Applied default variant for "${selector.productGroup}" in section "${selector.sectionId}"`);
}
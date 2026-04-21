import { getScopeForUniqueSelectorInGroup } from "./registry-utils.js";
import { SELECTORS } from "../constants/selector-constants.js";
import { resolveProductGroupConfig } from "../utils/product-config-lookup-utils.js";
import { getProductLabelAndVariantOptions, applyDiscountCodesFromConfig } from "./init_product_group_utils.js";
import { resolveProductDataAndConfigForLabel } from "./input_update_utils/update_utils.js";
import { initAllConfigsForGroup } from './init_configs.js';
import { 
    updateProductGroupUIFlatVariantAndSubscription, 
    initStaticSelectorsForGroup 
} from "./input_update_utils/variant_subscription_combo_update_utils.js";


function handleProductGroupByScope({
    scope,
    sectionId,
    productGroup,
    productLabel,
    variantOptions,
    product_object,
    variant_object,
    variant_config,
    config
  }) {
    switch (scope) {
        case "pdp":
          updateProductGroupUIFlatVariantAndSubscription({
            sectionId,
            productGroup,
            productLabel,
            variantOptions,
            productObject: product_object,
            variantObject: variant_object,
            variantConfig: variant_config,
            config,
          });
          initStaticSelectorsForGroup({
            sectionId,
            productGroup
          });
          break;
        default:
          throw new Error("WWAI-ERROR ❌ Unknown scope type:", scope);
      }
}

export function handleVariantPurchaseTypeComboSelector(
    sectionId, 
    productGroup, 
    variantPurchaseTypeComboSelector, 
    index
) {
    const scope = getScopeForUniqueSelectorInGroup(
        sectionId, 
        productGroup, 
        SELECTORS.PRODUCT_GROUP.VARIANT_PURCHASE_TYPE_COMBO
    );
    
    const config = resolveProductGroupConfig(sectionId, productGroup);  
    const { productLabel, variantOptions } = getProductLabelAndVariantOptions(
        config, 
        sectionId, 
        productGroup
    );

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

    
    if (!resolvedConfig || !variant_config || !product_object || !variant_object) {
        console.error("WWAI-ERROR ❌ No config, variant_config, product_object, or variant_object found for sectionId:", sectionId, "productGroup:", productGroup);
        return;
    }
      
    // Handle the product group by scope. This includes:
    // 1. Updating the UI for the group
    // 2. Setting the bundle payload for the add to cart form
    handleProductGroupByScope({
        scope,
        sectionId,
        productGroup,
        productLabel,
        variantOptions,
        product_object,
        variant_object,
        variant_config,
        config
    });
}
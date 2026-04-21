import { calculateOneTimePriceWithConfig } from '../utils/product-data/pricing.js';
import {getResolvedMediaForVariant, getMediaIndexForVariantConfig} from '../utils/product-data/media.js'
import {buildAddToCartPayload} from '../utils/product-data/add_to_cart.js';

import {
    updatePricesForGroup, 
    setVariantSelectionForGroup
} from './update_selectors.js';
import { resolveProductDataAndConfigForLabel } from './update_utils.js';
  
export function updateProductGroupUIForGrid({
    sectionId,
    productGroup,
    productLabel,
    variantOptions,
    productObject,
    variantObject,
    variantConfig,
    config
  }) {    
    // ✅ Compute Prices and Media
    const variant_one_time_price = calculateOneTimePriceWithConfig(
      productLabel, 
      variantObject, 
      config.pricingConfig
    );
    const variant_images = getResolvedMediaForVariant(productObject, variantConfig);
    const variant_image_index = getMediaIndexForVariantConfig(variantConfig);
        
    // ✅ Initialize UI Components
    updatePricesForGroup({
      sectionId,
      productGroup,
      oneTimePrice: variant_one_time_price,
      subscriptionPrice: null,
      purchaseType: 'onetime'
    });
  
    setVariantSelectionForGroup({
      sectionId,
      productGroup,
      productLabel,
      variantOptions
    });
}

export function reinitializeProductGroupOnVariantChangeForGrid(sectionId, productGroup, productLabel, variantOptions) {
    console.log(`🔄 Reinitializing Product Group on Variant Change: [${productGroup}] - ${productLabel}`);
    
    const {
        config,
        variant_config,
        product_object,
        variant_object
    } = resolveProductDataAndConfigForLabel(sectionId, productGroup, productLabel, variantOptions);

    if (!product_object || !variant_object) {
        console.error(`WWAI-ERROR ❌ Unable to reinitialize product group for ${productGroup}`);
        return;
    }

    // ✅ Re-initialize UI
    updateProductGroupUIForGrid({
        sectionId,
        productGroup,
        productLabel,
        variantOptions,
        productObject: product_object,
        variantObject: variant_object,
        variantConfig: variant_config,
        config
    });

    console.log(`✅ Reinitialized Product Group: ${productGroup} for Variant ${productLabel}`);
}  
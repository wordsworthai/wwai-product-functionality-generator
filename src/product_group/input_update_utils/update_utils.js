/* Resolve Product Data and Config for a Given Label and Options */
import {  
    resolveProductGroupConfig, 
    resolveProductGroupVariantConfig
} from '../../utils/product-config-lookup-utils.js';

import {
    resolveProductAndVariantFromWindowProductObject
} from '../../utils/product-lookup/product-object-utils';


export function resolveProductDataAndConfigForLabel(
    sectionId, 
    productGroup, 
    productLabel, 
    variantOptions
) {
    console.log(`🔄 Resolving Product Data for: [${productGroup}] - ${productLabel}`);

    // ✅ Resolve the config
    const config = resolveProductGroupConfig(sectionId, productGroup);

    // ✅ Resolve the variant configuration
    const variant_config = resolveProductGroupVariantConfig(sectionId, productGroup, productLabel, variantOptions);

    // ✅ Resolve the product and variant objects from window
    const { product: product_object, variant: variant_object } = resolveProductAndVariantFromWindowProductObject(
        productGroup, 
        productLabel, 
        variantOptions
    );

    if (!product_object || !variant_object) {
        console.error(`WWAI-ERROR ❌ Failed to resolve product or variant data for ${productLabel}`);
        return {
            config: config,
            variant_config: variant_config,
            product_object: null,
            variant_object: null
        };
    }

    return {
        config,
        variant_config,
        product_object,
        variant_object
    };
}
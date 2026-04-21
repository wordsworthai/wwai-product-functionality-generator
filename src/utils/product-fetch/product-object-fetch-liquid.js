export function initializeWWAIProductAvailabilityFromLiquidString(mappingArray) {
    window.__WWAI_PRODUCT_AVAILABILITY__ = window.__WWAI_PRODUCT_AVAILABILITY__  || {};
    mappingArray.forEach(item => {
        const parts = item.split(':').map(x => x.trim());
        const handle = parts[2];
        if (handle) {
            window.__WWAI_PRODUCT_AVAILABILITY__[handle] = true;
        }
    });
}

export function bootstrapWWAIProductsAndAvailabilityFromLiquid(has_static_loaded_products = true) {

    if (Array.isArray(window.__WWAI__LIQUID_STATIC_PRODUCT_MAPPING_ARRAY__) && window.__WWAI__LIQUID_STATIC_PRODUCT_MAPPING_ARRAY__.length > 0) {
        console.log('⚡ Using preloaded window.__WWAI__LIQUID_STATIC_PRODUCT_MAPPING_ARRAY__ to init product availability.');
        initializeWWAIProductAvailabilityFromLiquidString(window.__WWAI__LIQUID_STATIC_PRODUCT_MAPPING_ARRAY__);
        return;
    }
      
    if (Array.isArray(window.__WWAI__LIQUID_STATIC_PRODUCT_MAPPING_ARRAY__) && window.__WWAI__LIQUID_STATIC_PRODUCT_MAPPING_ARRAY__.length === 0) {
        if (has_static_loaded_products) {
          console.warn('⚠️ Detected has_static_loaded_products is set but window.__WWAI__LIQUID_STATIC_PRODUCT_MAPPING_ARRAY__ is defined and empty.');
          console.warn('💡 This likely means your Liquid block did not assign `product_mapping_array` correctly.');
        }
        return;
    }

    console.log('[ERROR]: window.__WWAI__LIQUID_STATIC_PRODUCT_MAPPING_ARRAY__ undefined');
}
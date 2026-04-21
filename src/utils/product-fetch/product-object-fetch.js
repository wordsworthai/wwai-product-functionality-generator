import {getMergedProductGroupsAcrossSections} from '../product-object-connection-utils.js';
import {hydrateStoreDataFromProductMap} from './product-object-fetch-js.js';
import {bootstrapWWAIProductsAndAvailabilityFromLiquid} from './product-object-fetch-liquid.js';

// Declare it safely on window
window._storeDataApiInitialized = window._storeDataApiInitialized || false;

export async function handleProductLoad(
    connectorType,
    has_static_loaded_liquid_products,
    has_js_loaded_products
) {
    // Initialize the product availability for static loaded liquid data.
    bootstrapWWAIProductsAndAvailabilityFromLiquid(has_static_loaded_liquid_products);

    if (_storeDataApiInitialized) {
        console.info("⚠️ initializeStoreDataViaApiCall() skipped (already initialized).");
        return;
    }

    // Step 2: If there are any JS-loaded product groups, fetch them
    window._storeDataApiInitialized = true;

    if (has_js_loaded_products) {
        console.log(`Hydrating product group(s) via JS...`);
        await hydrateStoreDataFromProductMap(connectorType, has_js_loaded_products);
        return;
    }
    console.log('No additional JS-based product groups to hydrate.');    
}
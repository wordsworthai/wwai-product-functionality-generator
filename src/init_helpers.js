import { hydrateProductDataFromJSONScripts } from "./hydrate_static_product_data.js";
import { validateWWAIConfig, getWWAIConfig } from "./wwai_config.js";
import { validateAllElementInstances, enableAllDebugging } from "./debug/debug-init.js";
import { buildDebugSelectorRegistry } from "./debug/debug-registry.js";
import { setupConfigIntegrationPopupToggle } from "./debug/debug.js";
import { validateSectionProductGroupsAndAddSectionDebug } from "./debug/debug-product-groups.js";
import { SELECTORS } from "./constants/selector-constants.js";

import { getProductLoadFlags } from "./utils/product-object-connection-utils.js";
import { handleProductLoad } from "./utils/product-fetch/product-object-fetch.js";
import { validateProductVariantSelectorProductObjectConnection } from "./elements_validator/product-variant-selector.js";
import { buildProductGroupRegistry } from "./product_group/registry.js";
import { initProductGroups } from "./product_group/init_product_group.js";


// ✅ Initialize static product data and configurations
export function initializeStaticProductDataAndConfigs() {
  console.log("🔄 Initializing product data from JSON scripts...");
  hydrateProductDataFromJSONScripts();
  validateWWAIConfig();
  console.log("✅ Product data initialization complete");
}


// ✅ Enable functionality debug mode based on configuration
export function enableFunctionalityDevMode() {
  // ✅ Validate all element instances
  validateAllElementInstances();

  // ✅ Build the debug selector registry
  const debug_registry = buildDebugSelectorRegistry();
  enableAllDebugging(debug_registry);

  // ✅ Setup the config integration popup toggle
  setupConfigIntegrationPopupToggle(getWWAIConfig().RENDER_WITH_LIQUID);

  // ✅ Validate the section product groups and add section debug
  validateSectionProductGroupsAndAddSectionDebug();

  const config = getWWAIConfig();
  window.FUNCTIONALITY_DEBUG_MODE = config.MODE && config.MODE == "dev";
  
  if (window.FUNCTIONALITY_DEBUG_MODE) {
    console.log("🔧 Functionality Debug Mode Enabled");
  }
}

export function runDispatchAndInitProductGroups() {
    console.log("🚀 Running Dispatch Logic...");
  
    // 1️⃣ Build the Product Group Registry
    buildProductGroupRegistry();
  
    // 2️⃣ Get the Variant Selector
    const selector = document.querySelector(SELECTORS.PRODUCT_VARIANT_SELECTOR);
  
    // 3️⃣ Start Async Handling
    (async () => {
      const { has_static_loaded_liquid_products, has_js_loaded_products } =
        getProductLoadFlags(getWWAIConfig().RENDER_WITH_LIQUID);
  
      await handleProductLoad(
        getWWAIConfig().CONNECTOR_TYPE,
        has_static_loaded_liquid_products,
        has_js_loaded_products
      );
  
      // ✅ Validate the connection with the product object
      validateProductVariantSelectorProductObjectConnection(selector);
  
      // ✅ Initialize product groups
      initProductGroups();
  
      // Apply cached height in case of grid equalization.
      console.log("Running Grid equalization from cache.");
      window.applyCachedHeightsOnLoad();
  
      console.log("✅ Product Groups Initialized Successfully");
    })();
};
// Imports
import { getAllSectionProductGroupPairs } from "./registry.js";
import { updateProductGroupUI } from "./input_update_utils/variant_update_utils.js";
import { setBundlePayloadAddToCartFormForGroup } from "./input_update_utils/update_selectors.js";
import { getUniqueElementForSelectorInGroup, getScopeForUniqueSelectorInGroup } from "./registry-utils.js";
import { SELECTORS } from "../constants/selector-constants.js";
import { initLoaderCleanupListeners } from "../elements/journey_helpers/add_to_cart_loaders.js";
import { handleVariantPurchaseTypeComboSelector } from "./init_product_group_variant_subscription_selector.js";
import { resolveAndApplyConfigsDiscountCodeAndAvailability } from "./init_product_group_utils.js";

// Equalize grid heights
function runHeightEqualization() {
  console.log("🔄 Starting height equalization on load.");
  document.querySelectorAll(SELECTORS.OTHER.PRODUCT_GRID_HEIGHT_EQUALIZER).forEach((el) => {
    const rect = el.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (isVisible) {
      console.log(`[${el.sectionId}] 🟢 Detected in view, running equalize now.`);
      el.equalize("immediate-on-load");
    }
  });
}

// Handle update logic based on scope type
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
    case "collection":
    case "pdp":
      updateProductGroupUI({
        sectionId,
        productGroup,
        productLabel,
        variantOptions,
        productObject: product_object,
        variantObject: variant_object,
        variantConfig: variant_config,
        config,
      });
      break;
    case "virtual_bundle":
      // For now, we only support virtual bundles with a single button and no other selectors.
      // Hence we only need to set the bundle payload for the add to cart form.
      setBundlePayloadAddToCartFormForGroup({
        sectionId,
        productGroup,
        bundlePayload: variant_object,
      });
      break;
    default:
      throw new Error("WWAI-ERROR ❌ Unknown scope type:", scope);
  }
}

// Initialize each product group
function initializeSingleProductGroup({ sectionId, productGroup }, index) {
  console.group(`✅ [${index + 1}] Init: section="${sectionId}", product_group="${productGroup}"`);

  const variantSelector = getUniqueElementForSelectorInGroup(sectionId, productGroup, SELECTORS.PRODUCT_GROUP.VARIANT);

  const variantPurchaseTypeComboSelector = getUniqueElementForSelectorInGroup(
    sectionId, 
    productGroup, 
    SELECTORS.PRODUCT_GROUP.VARIANT_PURCHASE_TYPE_COMBO
  );

  if (variantSelector && variantPurchaseTypeComboSelector) {
    throw new Error("WWAI-ERROR ❌ Both variant and variant purchase type combo selectors found for sectionId:", sectionId, "productGroup:", productGroup);
  }
  else if (variantPurchaseTypeComboSelector) {
    handleVariantPurchaseTypeComboSelector(
      sectionId, 
      productGroup, 
      variantPurchaseTypeComboSelector,
      index
    );
    return;
  }
  else {
    // We follow the regular flow.
    ;
  }

  const scope = getScopeForUniqueSelectorInGroup(sectionId, productGroup, SELECTORS.PRODUCT_GROUP.VARIANT);

  
  // Resolve configs and apply them to the group. This include:
  // 1. Discount codes
  // 2. Variant option availability
  // 3. All configs for the group
  const {
    config,
    variant_config,
    product_object,
    variant_object,
    productLabel,
    variantOptions
  } = resolveAndApplyConfigsDiscountCodeAndAvailability(
    { 
      sectionId, 
      productGroup, 
      variantSelector
    });

  if (!config || !variant_config || !product_object || !variant_object) {
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

  console.groupEnd();
}

// Main init function
export function initProductGroups() {
  initLoaderCleanupListeners();
  console.group("[WWAI] 🔧 Initializing Product Groups");

  const pairs = getAllSectionProductGroupPairs();
  pairs.forEach((pair, index) => initializeSingleProductGroup(pair, index));

  runHeightEqualization();
  console.groupEnd();
}
import { getProductOptionsOverlaySelector, getProductVariantSelector } from './utils.js';
import { addCurrentVariantToCart, createLambdaForAddToCart } from './add_to_cart_handler.js';
import { redirectToProductPage, redirectToCustomUrl, createLambdaForUrlRedirect } from './redirect_handler.js';

export function handleDirectAdd(sectionId, productGroup, flowConfig) {
    console.log("🟩 [Direct Add Handler]");
    console.log("Section ID:", sectionId);
    console.log("Product Group:", productGroup);
    addCurrentVariantToCart(sectionId, productGroup, flowConfig);
}

export function handleRedirect(sectionId, productGroup, flowConfig) {
    console.log("🔁 [Redirect Handler]");
    console.log("Section ID:", sectionId);
    console.log("Product Group:", productGroup);
    redirectToProductPage(sectionId, productGroup, flowConfig);
}

export function handleCustomRedirect(
  sectionId, 
  productGroup, 
  flowConfig, 
  postSelectionActionParams
) {
  console.log("🔁 [Custom Redirect Handler]");
  console.log("Section ID:", sectionId);
  console.log("Product Group:", productGroup);
  redirectToCustomUrl(
    sectionId, 
    productGroup, 
    flowConfig, 
    postSelectionActionParams['custom_url']
  );
}

export function handleOverlay(
    sectionId, 
    productGroup, 
    flowConfig, 
    postSelectionAction, 
    postSelectionActionParams
  ) {
    console.log("🟦 [Overlay Handler]");
    console.log("Section ID:", sectionId);
    console.log("Product Group:", productGroup);
    console.log("Post-Selection Action:", postSelectionAction, postSelectionActionParams);
  
    const product_options_overlay_selector = getProductOptionsOverlaySelector(sectionId, productGroup);
    if (product_options_overlay_selector) {
      console.log("✅ Found overlay, opening now...");
      product_options_overlay_selector.openOverlay();
    } else {
      console.error(`WWAI-ERROR ❌ Cannot open overlay — no matching element found for sectionId=${sectionId}, productGroup=${productGroup}`);
      throw new Error("Overlay not found. Cannot proceed with interaction.");
    }
  
    let variant_added_handler = null;
    if (postSelectionAction === 'redirect') {
      console.log("⏭ Will redirect after selection.");
      const labelsToKeepList = postSelectionActionParams['redirect_variant_options'];
      variant_added_handler = createLambdaForUrlRedirect(sectionId, productGroup, flowConfig, labelsToKeepList);
    } else if (postSelectionAction === 'add-to-cart') {
      console.log("✅ Add to cart after selection.");
      variant_added_handler = createLambdaForAddToCart(sectionId, productGroup, flowConfig);
    } else if (postSelectionAction === 'na') {
      console.log("✅ No post-selection action required.");
    } else {
      console.warn("⚠️ Unknown postSelectionAction:", postSelectionAction);
    }
  
    // ✅ Register handler only once using a global registry
    if (variant_added_handler) {
      window.__WWAI_HANDLER_REGISTRY = window.__WWAI_HANDLER_REGISTRY || {};
      const handlerKey = `${sectionId}_${productGroup}_variantChange`;
  
      if (!window.__WWAI_HANDLER_REGISTRY[handlerKey]) {
        const product_variant_selector = getProductVariantSelector(sectionId, productGroup);
        if (product_variant_selector) {
          product_variant_selector.registerHandler('variantChange', variant_added_handler);
          window.__WWAI_HANDLER_REGISTRY[handlerKey] = true;
          console.log(`🔁 Registered variantChange handler for key: ${handlerKey}`);
        } else {
          console.warn(`⚠️ Cannot register handler — variant selector not found for sectionId=${sectionId}, productGroup=${productGroup}`);
        }
      }
    }
  }
  
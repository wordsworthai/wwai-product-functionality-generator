import {
  ProductVariantSelectorHighlighter,
  ProductCustomPriceSelectorHighlighter,
  ProductPurchaseTypeSelectorHighlighter,
  ProductSubscriptionFrequencySelectorHighlighter,
  ProductCustomVariantLabelTextHighlighter,
  ProductCustomCarouselMediaSelectorHighlighter,
  ProductCustomAddToCartButtonHighlighter,
  ProductCustomSubmitInterceptorHighlighter,
  ProductMediaGalleryForGridsHighlighter,
  ProductGridIconSmartInteractionButtonHighlighter,
  ProductGridIconSmartSubscriptionButtonHighlighter,
  ProductStaticSubscriptionFrequencySelectorHighlighter,
  ProductStaticPriceSelectorHighlighter
} from '../highlighter/index.js';

import {
  validateProductVariantSelector,
  validateCustomPriceSelector,
  validatePurchaseTypeSelector,
  validateSubscriptionFrequencySelector,
  validateCustomVariantLabelTextSelector,
  validateCustomCarouselMediaSelector,
  validateCustomAddToCartButton,
  validateProductCustomSubmitInterceptor,
  validateProductMediaGalleryForGrids,
  validateProductGridIconSmartInteractionButton,
  validateProductGridIconSmartSubscriptionButton,
  validateStaticSubscriptionFrequencySelector,
  validateStaticPriceSelector
} from '../elements_validator/index.js';

import {
  triggerProductIntegrationWithVariantDebugPopup,
  cleanupVariantDebugPopupUI
} from '../highlighter/config/config-overlay.js';

import { setupFunctionalityDebugToggle } from '../utils/debug-callbacks-setup.js';


export function setupConfigIntegrationPopupToggle(renderWithLiquid = false) {
  setupFunctionalityDebugToggle((debugMode, { isFirstSet }) => {
    if (debugMode === true) {
      triggerProductIntegrationWithVariantDebugPopup(renderWithLiquid);
    } else if (debugMode === false && !isFirstSet) {
      cleanupVariantDebugPopupUI();
    }
  });
}

function makeDebugHandler({ HighlighterClass, validateFn, extraOnEnable = null, extraOnDisable = null }) {
  return function (selector) {
    if (!selector) {
      console.warn("⚠️ makeDebugHandler was called with an empty or invalid selector.", selector);
      return;
    }
    
    const highlighter = new HighlighterClass(selector);
    validateFn(selector);

    setupFunctionalityDebugToggle((debugMode, { isFirstSet }) => {
      if (debugMode === true) {
        highlighter.enableDebugging();
        if (extraOnEnable) extraOnEnable();
      } else if (debugMode === false && !isFirstSet) {
        highlighter.disableDebugging();
        if (extraOnDisable) extraOnDisable();
      } else {
        console.log("FUNCTIONALITY_DEBUG_MODE is null. Skipping debug action.");
      }
    });
  };
}

export const enableVariantSelectorDebugging = makeDebugHandler({
  HighlighterClass: ProductVariantSelectorHighlighter,
  validateFn: validateProductVariantSelector
});

export const enablePriceSelectorDebugging = makeDebugHandler({
  HighlighterClass: ProductCustomPriceSelectorHighlighter,
  validateFn: validateCustomPriceSelector
});

export const enablePurchaseTypeSelectorDebugging = makeDebugHandler({
  HighlighterClass: ProductPurchaseTypeSelectorHighlighter,
  validateFn: validatePurchaseTypeSelector
});

export const enableSubscriptionFrequencySelectorDebugging = makeDebugHandler({
  HighlighterClass: ProductSubscriptionFrequencySelectorHighlighter,
  validateFn: validateSubscriptionFrequencySelector
});

export const enableStaticSubscriptionFrequencySelectorDebugging = makeDebugHandler({
  HighlighterClass: ProductStaticSubscriptionFrequencySelectorHighlighter,
  validateFn: validateStaticSubscriptionFrequencySelector  
});

export const enableStaticPriceSelectorDebugging = makeDebugHandler({
  HighlighterClass: ProductStaticPriceSelectorHighlighter,
  validateFn: validateStaticPriceSelector
});

export const enableCustomVariantLabelTextSelectorDebugging = makeDebugHandler({
  HighlighterClass: ProductCustomVariantLabelTextHighlighter,
  validateFn: validateCustomVariantLabelTextSelector
});

export const enableCustomCarouselMediaSelectorDebugging = makeDebugHandler({
  HighlighterClass: ProductCustomCarouselMediaSelectorHighlighter,
  validateFn: validateCustomCarouselMediaSelector
});

export const enableCustomAddToCartButtonDebugging = makeDebugHandler({
  HighlighterClass: ProductCustomAddToCartButtonHighlighter,
  validateFn: validateCustomAddToCartButton
});

export const enableCustomSubmitInterceptorDebugging = makeDebugHandler({
  HighlighterClass: ProductCustomSubmitInterceptorHighlighter,
  validateFn: validateProductCustomSubmitInterceptor
});

export const enableProductMediaGalleryForGridsSelectorDebugging = makeDebugHandler({
  HighlighterClass: ProductMediaGalleryForGridsHighlighter,
  validateFn: validateProductMediaGalleryForGrids
});

export const enableGridIconSmartInteractionButtonDebugging = makeDebugHandler({
  HighlighterClass: ProductGridIconSmartInteractionButtonHighlighter,
  validateFn: validateProductGridIconSmartInteractionButton
});

export const enableGridIconSmartSubscriptionButtonDebugging = makeDebugHandler({
  HighlighterClass: ProductGridIconSmartSubscriptionButtonHighlighter,
  validateFn: validateProductGridIconSmartSubscriptionButton
});
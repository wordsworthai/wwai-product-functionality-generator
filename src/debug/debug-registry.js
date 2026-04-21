// debug-registry.js

import { SELECTORS } from '../constants/selector-constants.js';
  
import {
  enableVariantSelectorDebugging,
  enablePriceSelectorDebugging,
  enablePurchaseTypeSelectorDebugging,
  enableSubscriptionFrequencySelectorDebugging,
  enableCustomVariantLabelTextSelectorDebugging,
  enableCustomCarouselMediaSelectorDebugging,
  enableCustomAddToCartButtonDebugging,
  enableCustomSubmitInterceptorDebugging,
  enableProductMediaGalleryForGridsSelectorDebugging,
  enableGridIconSmartInteractionButtonDebugging,
  enableStaticSubscriptionFrequencySelectorDebugging,
  enableStaticPriceSelectorDebugging
} from './debug.js';

const DEBUG_FUNCTION_MAP = {
  [SELECTORS.PRODUCT_GROUP.VARIANT]: (el) => enableVariantSelectorDebugging(el),
  [SELECTORS.PRODUCT_GROUP.PRICE]: enablePriceSelectorDebugging,
  [SELECTORS.PRODUCT_GROUP.PURCHASE_TYPE]: enablePurchaseTypeSelectorDebugging,
  [SELECTORS.PRODUCT_GROUP.SUBSCRIPTION_FREQUENCY]: enableSubscriptionFrequencySelectorDebugging,
  [SELECTORS.PRODUCT_GROUP.VARIANT_CUSTOM_LABEL]: enableCustomVariantLabelTextSelectorDebugging,
  [SELECTORS.PRODUCT_GROUP.CAROUSEL]: enableCustomCarouselMediaSelectorDebugging,
  [SELECTORS.PRODUCT_GROUP.ADD_TO_CART]: enableCustomAddToCartButtonDebugging,
  [SELECTORS.PRODUCT_GROUP.SUBMIT_INTERCEPTOR]: enableCustomSubmitInterceptorDebugging,
  [SELECTORS.PRODUCT_GROUP.PRODUCT_MEDIA_GALLERY_FOR_GRIDS]: enableProductMediaGalleryForGridsSelectorDebugging,
  [SELECTORS.PRODUCT_GROUP.GRID_SMART_INTERACTION]: enableGridIconSmartInteractionButtonDebugging,
  [SELECTORS.PRODUCT_GROUP.SUBSCRIPTION_FREQUENCY_STATIC]: enableStaticSubscriptionFrequencySelectorDebugging,
  [SELECTORS.PRODUCT_GROUP.PRICE_STATIC]: enableStaticPriceSelectorDebugging,
};

export function buildDebugSelectorRegistry() {
  const registry = {};

  // Iterate over the actual selector strings in SELECTORS.PRODUCT_GROUP
  // and dynamically build the registry using the DEBUG_FUNCTION_MAP.
  for (const key in SELECTORS.PRODUCT_GROUP) {
      if (Object.prototype.hasOwnProperty.call(SELECTORS.PRODUCT_GROUP, key)) {
          const selectorString = SELECTORS.PRODUCT_GROUP[key];
          if (DEBUG_FUNCTION_MAP[selectorString]) {
              registry[selectorString] = DEBUG_FUNCTION_MAP[selectorString];
          } else {
              console.warn(`No debug function mapped for selector: ${selectorString}`);
          }
      }
  }
  return registry;
}
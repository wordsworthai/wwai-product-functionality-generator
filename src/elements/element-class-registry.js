// 1. Import all the individual element classes
import { ProductVariantSelector } from './product-variant-selector.js';
import { ProductCustomPriceSelector } from './product-custom-price-selector.js';
import { ProductPurchaseTypeSelector } from './product-purchase-type-selector.js';
import { ProductSubscriptionFrequencySelector } from './product-subscription-frequency-selector.js';
import { ProductVariantCustomLabeledText } from './product-variant-custom-labeled-text.js';
import { ProductCustomCarouselMediaSelector } from './product-custom-carousel-media-selector.js';
import { ProductCustomAddToCartButtonSelector } from './product-custom-add-to-cart-button-selector.js';
import { ProductCustomSubmitInterceptor } from './product-custom-submit-interceptor.js';
import { ProductMediaGalleryForGrids } from './product-media-gallery-for-grids.js';
import { ProductGridSmartInteractionButtonSelector } from './product-grid-smart-interaction-button-selector.js';
import { ProductCustomCollectionOptionsOverlaySelector } from './product-custom-collection-options-overlay-selector.js';
import { ProductGridHeightEqualizerSelector } from './product-grid-height-equalizer-selector.js';
import { ProductCustomTitleSelector } from './product-custom-title-selector.js';
import { ProductVariantTrigger } from './product-variant-trigger.js';
import { ProductVariantPurchaseTypeComboSelector } from './product-variant-purchase-type-combo-selector.js';
import { ProductVariantSelectorWithSets } from './product-variant-selector-with-sets.js';
import { ProductStaticSubscriptionFrequencySelector } from './product-static-subscription-frequency-selector.js';
import { ProductStaticPriceSelector } from './product-static-price-selector.js';
import { getWWAIConfig } from '../wwai_config.js';

// 2. Import your centralized SELECTORS object
import { SELECTORS } from '../constants/selector-constants.js'; // Adjust path if necessary


// 3. Define the ELEMENT_CLASS_REGISTRY, mapping selectors to their classes
export const ELEMENT_CLASS_REGISTRY = {
  // Product Group Selectors (as you defined them in SELECTORS.PRODUCT_GROUP)
  [SELECTORS.PRODUCT_GROUP.VARIANT]: ProductVariantSelector,
  [SELECTORS.PRODUCT_GROUP.PRICE]: ProductCustomPriceSelector,
  [SELECTORS.PRODUCT_GROUP.PURCHASE_TYPE]: ProductPurchaseTypeSelector,
  [SELECTORS.PRODUCT_GROUP.SUBSCRIPTION_FREQUENCY]: ProductSubscriptionFrequencySelector,
  [SELECTORS.PRODUCT_GROUP.VARIANT_CUSTOM_LABEL]: ProductVariantCustomLabeledText,
  [SELECTORS.PRODUCT_GROUP.CAROUSEL]: ProductCustomCarouselMediaSelector,
  [SELECTORS.PRODUCT_GROUP.ADD_TO_CART]: ProductCustomAddToCartButtonSelector,
  [SELECTORS.PRODUCT_GROUP.SUBMIT_INTERCEPTOR]: ProductCustomSubmitInterceptor,
  [SELECTORS.PRODUCT_GROUP.PRODUCT_MEDIA_GALLERY_FOR_GRIDS]: ProductMediaGalleryForGrids,
  [SELECTORS.PRODUCT_GROUP.GRID_SMART_INTERACTION]: ProductGridSmartInteractionButtonSelector,
  [SELECTORS.PRODUCT_GROUP.COLLECTION_OPTIONS_OVERLAY]: ProductCustomCollectionOptionsOverlaySelector,
  [SELECTORS.PRODUCT_GROUP.TITLE]: ProductCustomTitleSelector,
  [SELECTORS.PRODUCT_GROUP.VARIANT_TRIGGER]: ProductVariantTrigger, 
  [SELECTORS.PRODUCT_GROUP.VARIANT_PURCHASE_TYPE_COMBO]: ProductVariantPurchaseTypeComboSelector,
  [SELECTORS.PRODUCT_GROUP.VARIANT_SELECTOR_WITH_SETS]: ProductVariantSelectorWithSets,
  [SELECTORS.PRODUCT_GROUP.SUBSCRIPTION_FREQUENCY_STATIC]: ProductStaticSubscriptionFrequencySelector,
  [SELECTORS.PRODUCT_GROUP.PRICE_STATIC]: ProductStaticPriceSelector,
  // Other Selectors (as you defined them in SELECTORS.OTHER)
  [SELECTORS.OTHER.PRODUCT_GRID_HEIGHT_EQUALIZER]: ProductGridHeightEqualizerSelector,
};

export function validateElementRegistry() {
  const allDefinedSelectors = [];

  // Iterate over each group (e.g., PRODUCT_GROUP, OTHER) within the SELECTORS object
  for (const groupKey in SELECTORS) {
    if (Object.prototype.hasOwnProperty.call(SELECTORS, groupKey)) {
      const selectorGroup = SELECTORS[groupKey];
      // Get all selector strings (values) from the current group and add them to the array
      allDefinedSelectors.push(...Object.values(selectorGroup));
    }
  }

  let validationPassed = true;
  const missingSelectors = [];

  for (const selector of allDefinedSelectors) {
    if (!(selector in ELEMENT_CLASS_REGISTRY)) {
      missingSelectors.push(selector);
      validationPassed = false;
    }
  }

  if (!validationPassed) {
    console.error(
      'WWAI-ERROR ELEMENT_CLASS_REGISTRY Validation Failed: The following selectors from `constants/selector-constants.js` are NOT registered:',
      missingSelectors
    );
    // throw new Error('ELEMENT_CLASS_REGISTRY validation failed.');
  } else {
    console.log('ELEMENT_CLASS_REGISTRY Validation Passed: All defined selectors are registered.');
  }

  return validationPassed;
}

// Conditional execution (as discussed)
if (getWWAIConfig().MODE !== 'prod') {
  validateElementRegistry();
}
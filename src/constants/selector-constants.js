const PRODUCT_GROUP_SELECTORS = {
    ADD_TO_CART: 'product-custom-add-to-cart-button-selector',
    CAROUSEL: 'product-custom-carousel-media-selector',
    COLLECTION_OPTIONS_OVERLAY: 'product-custom-collection-options-overlay-selector',
    PRICE: 'product-custom-price-selector',
    SUBMIT_INTERCEPTOR: 'product-custom-submit-interceptor',
    TITLE: 'product-custom-title-selector',
    GRID_SMART_INTERACTION: 'product-grid-smart-interaction-button-selector',
    PRODUCT_MEDIA_GALLERY_FOR_GRIDS: 'product-media-gallery-for-grids',
    PURCHASE_TYPE: 'product-purchase-type-selector',
    SUBSCRIPTION_FREQUENCY: 'product-subscription-frequency-selector',
    VARIANT_CUSTOM_LABEL: 'product-variant-custom-labeled-text-selector',
    VARIANT: 'product-variant-selector',
    VARIANT_TRIGGER: 'product-variant-trigger',
    VARIANT_PURCHASE_TYPE_COMBO: 'product-variant-purchase-type-combo-selector',
    VARIANT_SELECTOR_WITH_SETS: 'product-variant-selector-with-sets',
    SUBSCRIPTION_FREQUENCY_STATIC: 'product-static-subscription-frequency-selector',
    PRICE_STATIC: 'product-static-price-selector',
};

const OTHER_SELECTORS = {
PRODUCT_GRID_HEIGHT_EQUALIZER: 'product-grid-height-equalizer-selector',
// Add any other general utility/global selectors here if they emerge
};
  
// Combine them into a single export object for convenience
export const SELECTORS = {
    PRODUCT_GROUP: PRODUCT_GROUP_SELECTORS,
    OTHER: OTHER_SELECTORS,
};
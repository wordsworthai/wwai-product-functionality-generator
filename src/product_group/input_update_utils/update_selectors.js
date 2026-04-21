import { SELECTORS } from '../../constants/selector-constants.js';
import {
    PURCHASE_TYPE_VALUES
} from '../../constants/elements/purchase-type-selector-constants.js';

import { getElementsForSelectorInGroup, getUniqueElementForSelectorInGroup } from '../registry-utils.js';
import { hasPurchaseTypeSelectorFn, callUpdatePrices } from './update_selectors_utils.js';
import { VARIANT_LABEL_TEXT_SLOT } from '../../constants/elements/variant-selector-constants.js';

export function updatePricesForGroup({
    sectionId,
    productGroup,
    oneTimePrice,
    subscriptionPrice,
    purchaseType
}) {
    const priceSelectors = getElementsForSelectorInGroup(sectionId, productGroup, SELECTORS.PRODUCT_GROUP.PRICE);
    let hasPurchaseTypeSelector = hasPurchaseTypeSelectorFn(sectionId, productGroup);

    if (!priceSelectors.length) {
        console.warn(`⚠️ No price selectors found for section="${sectionId}", productGroup="${productGroup}"`);
        return;
    }

    priceSelectors.forEach((el) => {
        if (typeof el.updatePrices !== 'function') {
            console.warn(`⚠️ Skipping price selector: missing updatePrices method`, el);
            return;
        }

        callUpdatePrices(el, oneTimePrice, 'one_time');
        callUpdatePrices(el, subscriptionPrice, 'subscription');

        if (hasPurchaseTypeSelector) {
            if (purchaseType == PURCHASE_TYPE_VALUES.ONETIME) {
                callUpdatePrices(el, oneTimePrice, 'onetime_or_subscription');
            } else {
                callUpdatePrices(el, subscriptionPrice, 'onetime_or_subscription');
            }
        }
    });
}

/**
 * Sets the default selected product and variant options for a product group.
 */
export function setVariantSelectionForGroup({ sectionId, productGroup, productLabel, variantOptions }) {
    const variantSelector = getUniqueElementForSelectorInGroup(sectionId, productGroup, SELECTORS.PRODUCT_GROUP.VARIANT);

    if (!variantSelector) {
        // getUniqueElementForSelectorInGroup already logs the warning/error
        return;
    }

    if (typeof variantSelector.setSelectedProductAndOptions !== 'function') {
        console.error(`WWAI-ERROR ❌ <product-variant-selector> is missing setSelectedProductAndOptions()`);
        return;
    }

    const result = variantSelector.setSelectedProductAndOptions(productLabel, variantOptions);

    if (!result) {
        console.warn(`⚠️ Failed to set default product/options for section="${sectionId}", group="${productGroup}"`);
    } else {
        console.log(`✅ Default variant set for [${sectionId} / ${productGroup}] → ${productLabel}`, variantOptions);
    }
}

export function setPurchaseTypeForGroup({
    sectionId,
    productGroup,
    oneTimePrice,
    subscriptionPrice,
    purchaseType,
    onlySetPurchaseType = false
}) {
    const purchaseTypeSelector = getUniqueElementForSelectorInGroup(sectionId, productGroup, SELECTORS.PRODUCT_GROUP.PURCHASE_TYPE);

    if (!purchaseTypeSelector) {
        // getUniqueElementForSelectorInGroup already logs the warning/error
        return;
    }

    // Update prices if provided and onlySetPurchaseType is not true
    // The prices are needed, since if subscription type is changed, the price label onetime_or_subscription needs to be updated. 
    if (!onlySetPurchaseType) {
        if (oneTimePrice === undefined && subscriptionPrice === undefined) {
            console.error(`WWAI-ERROR ❌ setPurchaseTypeForGroup: Both oneTimePrice and subscriptionPrice are undefined for [${sectionId} / ${productGroup}]`);
        } else if (oneTimePrice !== undefined || subscriptionPrice !== undefined) {
            if (typeof purchaseTypeSelector.cachePrices === 'function') {
                purchaseTypeSelector.cachePrices({ oneTimePrice, subscriptionPrice });
            }
        }
    }

    // Set purchase type if provided
    if (purchaseType === undefined) {
        console.error(`WWAI-ERROR ❌ setPurchaseTypeForGroup: purchaseType is undefined for [${sectionId} / ${productGroup}]`);
    } else {
        if (typeof purchaseTypeSelector.setPurchaseType === 'function') {
            purchaseTypeSelector.setPurchaseType(purchaseType);
            console.log(`✅ Default purchase type set for [${sectionId} / ${productGroup}] → ${purchaseType}`);
        } else {
            console.error(`WWAI-ERROR ❌ <product-purchase-type-selector> is missing .setPurchaseType()`);
        }
    }
}

export function setCarouselMediaForGroup({
    sectionId,
    productGroup,
    config,
    media = [],
    moveToIndex = 0,
    isReinitializing = false
}) {
    const carouselSelector = getUniqueElementForSelectorInGroup(sectionId, productGroup, SELECTORS.PRODUCT_GROUP.CAROUSEL);

    if (!carouselSelector) {
        // getUniqueElementForSelectorInGroup already logs the warning/error
        return;
    }

    if (typeof carouselSelector.updateCarouselMedia !== 'function') {
        console.error(`WWAI-ERROR ❌ <product-custom-carousel-media-selector> is missing .updateCarouselMedia()`);
        return;
    }

    if (config?.uxConfig?.imageCarouselConfig?.preInjectedMedia) {
        let useCustomImages = config?.uxConfig?.imageCarouselConfig?.useCustomImages;
        if (!useCustomImages) {
            throw new Error("WWAI-ERROR ❌ Pre injected media is not allowed when useCustomImages is true");
        }
    }
    if (!isReinitializing) {
        // this is first init, if we are using pre injected variant image, we dont do anything.
        if (config?.uxConfig?.imageCarouselConfig?.preInjectedMedia) {
            console.log("using pre injected media, not updating carousel media on first init");
            return;
        }
        carouselSelector.updateCarouselMedia(media, moveToIndex);
    } else {
        carouselSelector.updateCarouselMedia(media, moveToIndex);
    }
}

export function setSubscriptionFrequencyForGroup({
    sectionId,
    productGroup,
    subscriptionOptions
  }) {
    const subscriptionFrequencySelector = getUniqueElementForSelectorInGroup(sectionId, productGroup, SELECTORS.PRODUCT_GROUP.SUBSCRIPTION_FREQUENCY);

    if (!subscriptionFrequencySelector) {
      // getUniqueElementForSelectorInGroup already logs the warning/error
      return;
    }

    if (typeof subscriptionFrequencySelector.updateSubscriptionOptions !== 'function') {
      console.error(`WWAI-ERROR ❌ <product-subscription-frequency-selector> is missing .updateSubscriptionOptions()`);
      return;
    }
    
    console.log("subscriptionOptions:", subscriptionOptions);
    // Call the method to set the subscription frequency
    subscriptionFrequencySelector.updateSubscriptionOptions(subscriptionOptions);
  
    console.log(`✅ Default subscription frequency set for [${sectionId} / ${productGroup}] → Selling Plan Length: ${subscriptionOptions.length}`);
}

export function setVariantCustomLabelForGroup({
    sectionId,
    productGroup,
    labelData = {}
  }) {
    const customLabelSelector = getUniqueElementForSelectorInGroup(sectionId, productGroup, SELECTORS.PRODUCT_GROUP.VARIANT_CUSTOM_LABEL);

    if (!customLabelSelector) {
        // getUniqueElementForSelectorInGroup already logs the warning/error
        return;
    }

    if (typeof customLabelSelector.updateCustomLabels !== 'function') {
        console.error(`WWAI-ERROR ❌ <product-variant-custom-labeled-text-selector> is missing .updateCustomLabels()`);
        return;
    }

    // ✅ Update labels
    customLabelSelector.updateCustomLabels(labelData);

    console.log(`✅ Custom labels updated for [${sectionId} / ${productGroup}] →`, labelData);
}

export function setAddToCartFormForGroup({ sectionId, productGroup, addToCartPayload }) {
    const addToCartSelector = getUniqueElementForSelectorInGroup(sectionId, productGroup, SELECTORS.PRODUCT_GROUP.ADD_TO_CART);

    if (!addToCartSelector) {
        // getUniqueElementForSelectorInGroup already logs the warning/error
        return;
    }

    if (!addToCartSelector || typeof addToCartSelector.updateAddToCartForm !== 'function') {
        console.error(`WWAI-ERROR ❌ Could not find <product-custom-add-to-cart-button-selector> or missing .updateAddToCartForm()`);
        return;
    }

    addToCartSelector.updateAddToCartForm(addToCartPayload);
}

export function setAddToCartFormForGroupMultiple({ sectionId, productGroup, addToCartPayload }) {
    const addToCartSelectors = getElementsForSelectorInGroup(sectionId, productGroup, SELECTORS.PRODUCT_GROUP.ADD_TO_CART);

    if (!addToCartSelectors || addToCartSelectors.length === 0) {
        console.warn(`WWAI ⚠️ No <product-custom-add-to-cart-button-selector> found for [${sectionId} / ${productGroup}]`);
        return;
    }

    let updatedCount = 0;
    addToCartSelectors.forEach((selector, index) => {
        if (!selector || typeof selector.updateAddToCartForm !== 'function') {
            console.error(`WWAI-ERROR ❌ AddToCart selector at index ${index} is missing .updateAddToCartForm()`);
            return;
        }
        
        selector.updateAddToCartForm(addToCartPayload);
        updatedCount++;
    });
}

export function updateGridSmartInteractionAvailability(
    sectionId, 
    productGroup, 
    addToCartPayload
) {
    const gridButtonElements = getElementsForSelectorInGroup(sectionId, productGroup, SELECTORS.PRODUCT_GROUP.GRID_SMART_INTERACTION);

    const isAvailable = addToCartPayload?.available === true;

    gridButtonElements.forEach((el, index) => {
        if (typeof el.updateAvailability === 'function') {
        el.updateAvailability(isAvailable, "Out of stock");
        console.log(`🔄 Grid Smart Interaction Button [${index}] availability set to: ${isAvailable}`);
        } else {
        console.warn(`⚠️ Grid Smart Interaction Button [${index}] is missing .updateAvailability()`);
        }
    });
}

export function setBundlePayloadAddToCartFormForGroup({
    sectionId,
    productGroup,
    bundlePayload
}) {
    const addToCartSelector = getUniqueElementForSelectorInGroup(sectionId, productGroup, SELECTORS.PRODUCT_GROUP.ADD_TO_CART);

    if (!addToCartSelector) {
        // getUniqueElementForSelectorInGroup already logs the warning/error
        return;
    }

    if (typeof addToCartSelector.updateAddToCartFormWithBundlePayload !== 'function') {
        console.error(`WWAI-ERROR ❌ <product-custom-add-to-cart-button-selector> is missing .updateAddToCartFormWithBundlePayload()`);
        return;
    }

    console.log("🛒 Bundle AddToCart Payload to be set:", bundlePayload);

    // Call the method to set the add-to-cart form
    addToCartSelector.updateAddToCartFormWithBundlePayload(bundlePayload);
}

export function setProductTitleForGroup({
    sectionId,
    productGroup,
    title
}) {
    const titleSelector = getUniqueElementForSelectorInGroup(sectionId, productGroup, SELECTORS.PRODUCT_GROUP.TITLE);

    if (!titleSelector) {
        // getUniqueElementForSelectorInGroup already logs the warning/error
        return;
    }

    if (typeof titleSelector.updateTitle !== 'function') {
        console.error(`WWAI-ERROR ❌ <product-custom-title-selector> is missing .updateTitle()`);
        return;
    }

    titleSelector.updateTitle(title);
    console.log(`✅ Title updated for [${sectionId} / ${productGroup}] → ${title}`);
}

export function setVariantAndSubscriptionSelectionForGroup({ 
    sectionId, 
    productGroup, 
    productLabel, 
    variantOptions,
    purchaseType
}) {
    const variantAndSubscriptionSelector = getUniqueElementForSelectorInGroup(sectionId, productGroup, SELECTORS.PRODUCT_GROUP.VARIANT_PURCHASE_TYPE_COMBO);

    if (!variantAndSubscriptionSelector) {
        // getUniqueElementForSelectorInGroup already logs the warning/error
        return;
    }

    if (typeof variantAndSubscriptionSelector.setSelectedCombo !== 'function') {
        console.error(`WWAI-ERROR ❌ <product-variant-purchase-type-combo-selector> is missing setSelectedCombo()`);
        return;
    }

    const result = variantAndSubscriptionSelector.setSelectedCombo({ 
        productLabel, 
        variantOptions, 
        purchaseType 
    });
    
    if (!result) {
        console.warn(`⚠️ Failed to set default product/options for section="${sectionId}", group="${productGroup}"`);
    } else {
        console.log(`✅ Default variant set for [${sectionId} / ${productGroup}] → ${productLabel}`, variantOptions);
    }
}

export function setVariantLabelTextForGroup({
    sectionId,
    productGroup,
    labelText
}) {
    const variantSelector = getUniqueElementForSelectorInGroup(
        sectionId, 
        productGroup, 
        SELECTORS.PRODUCT_GROUP.VARIANT
    );

    if (!variantSelector) {
        // getUniqueElementForSelectorInGroup already logs the warning/error
        return;
    }

    // Search for the element with the variant label text slot data attribute
    const labelTextElement = variantSelector.querySelector(`[${VARIANT_LABEL_TEXT_SLOT}]`);
    
    if (!labelTextElement) {
        console.warn(`⚠️ No element found with ${VARIANT_LABEL_TEXT_SLOT} in [${sectionId} / ${productGroup}]`);
        return;
    }

    // Replace the content with the label text
    labelTextElement.textContent = labelText;
    console.log(`✅ Variant label text updated for [${sectionId} / ${productGroup}] → ${labelText}`);
}
import { computeDerivedProductData } from "./variant_update_utils.js";
import { getAllSelectorsInGroup } from "../registry-utils.js";
import { SELECTORS } from "../../constants/selector-constants.js";
import { setVariantAndSubscriptionSelectionForGroup, setAddToCartFormForGroupMultiple, setCarouselMediaForGroup } from "./update_selectors.js";
import { COMBO_PURCHASE_TYPE_VALUES } from "../../constants/elements/variant-purchase-type-combo-selector-constants.js";
import { resolveProductDataAndConfigForLabel } from './update_utils.js';
import { getElementsForSelectorInGroup } from '../registry-utils.js';

function initSingleSubscriptionFrequencySelector(selector, sectionId, productGroup) {
  const productLabel = selector.productLabel;
  const variantOptions = selector.variantOptions;
  
  const {
    config,
    variant_config,
    product_object,
    variant_object
  } = resolveProductDataAndConfigForLabel(sectionId, productGroup, productLabel, variantOptions);

  if (variant_object == undefined) {
    throw new Error("WWAI-ERROR ❌ Variant object is undefined for " + productLabel + " " + variantOptions);
  }

  const derived = computeDerivedProductData({
    productObject: product_object,
    variantObject: variant_object,
    variantConfig: variant_config,
    productGroup: productGroup,
    productLabel: productLabel,
    config: config,
    purchaseType: COMBO_PURCHASE_TYPE_VALUES.SUBSCRIPTION
  });

  selector.updateSubscriptionOptionsForStaticUse(derived.sellingPlans);
}

function initStaticSubscriptionFrequencySelectors(sectionId, productGroup, has) {
  if (!has(SELECTORS.PRODUCT_GROUP.SUBSCRIPTION_FREQUENCY_STATIC)) {
    return;
  }

  const subscriptionFrequencySelectors = getElementsForSelectorInGroup(
    sectionId, 
    productGroup, 
    SELECTORS.PRODUCT_GROUP.SUBSCRIPTION_FREQUENCY_STATIC
  );

  subscriptionFrequencySelectors.forEach((selector) => {
    initSingleSubscriptionFrequencySelector(selector, sectionId, productGroup);
  });
}

function initSinglePriceSelector(selector, sectionId, productGroup) {
  const productLabel = selector.productLabel;
  const variantOptions = selector.variantOptions;
  const priceLabel = selector.priceLabel;

  const {
    config,
    variant_config,
    product_object,
    variant_object
  } = resolveProductDataAndConfigForLabel(
    sectionId, 
    productGroup, 
    productLabel, 
    variantOptions
  );

  if (variant_object == undefined) {
    throw new Error("WWAI-ERROR ❌ Variant object is undefined for " + productLabel + " " + variantOptions);
  }

  const derived = computeDerivedProductData({
    productObject: product_object,
    variantObject: variant_object,
    variantConfig: variant_config,
    productGroup: productGroup,
    productLabel: productLabel,
    config: config,
    purchaseType: COMBO_PURCHASE_TYPE_VALUES.SUBSCRIPTION
  });

  updatePriceBasedOnLabel(selector, derived, priceLabel, sectionId, productGroup);
}

function initStaticPriceSelectors(sectionId, productGroup, has) {
  if (!has(SELECTORS.PRODUCT_GROUP.PRICE_STATIC)) {
    return;
  }

  const priceSelectors = getElementsForSelectorInGroup(
    sectionId, 
    productGroup, 
    SELECTORS.PRODUCT_GROUP.PRICE_STATIC
  );

  priceSelectors.forEach((selector) => {
    initSinglePriceSelector(selector, sectionId, productGroup);
  });
}

function updatePriceBasedOnLabel(selector, derived, priceLabel, sectionId, productGroup) {
  const oneTimePrice = derived.oneTimePrice;
  const subscriptionPrice = derived.sellingPlanDetails.sellingPlanPriceObject;

  if (priceLabel == "onetime") {
    selector.updatePrice(oneTimePrice);
  }
  else if (priceLabel == "subscription") {
    selector.updatePrice(subscriptionPrice);
  }
  else {
    throw new Error("WWAI-ERROR ❌ Invalid price label:" + priceLabel + " for sectionId:" + sectionId + " productGroup:" + productGroup);
  }
}

export function initStaticSelectorsForGroup({
  sectionId,
  productGroup,
}) {
  const allSelectors = getAllSelectorsInGroup(sectionId, productGroup);
  const has = (selector) => allSelectors.includes(selector);

  if (!has(SELECTORS.PRODUCT_GROUP.VARIANT_PURCHASE_TYPE_COMBO)) {
    console.error("WWAI-ERROR ❌ Variant purchase type combo selector not found for sectionId:", sectionId, "productGroup:", productGroup);
    return;
  }

  initStaticSubscriptionFrequencySelectors(sectionId, productGroup, has);
  initStaticPriceSelectors(sectionId, productGroup, has);
}


export function updateProductGroupUIFlatVariantAndSubscription({
    sectionId,
    productGroup,
    productLabel,
    variantOptions,
    productObject,
    variantObject,
    variantConfig,
    config,
    purchaseType = null,
    setVariantAndSubscriptionSelection = true
  }) {
    const allSelectors = getAllSelectorsInGroup(sectionId, productGroup);
    
    validateRequiredSelectors(sectionId, productGroup, allSelectors);
    validateAllowedSelectors(sectionId, productGroup, allSelectors);
    
    const resolvedPurchaseType = resolvePurchaseType(purchaseType, config, sectionId, productGroup);
    
    if (setVariantAndSubscriptionSelection) {
      setVariantAndSubscriptionSelectionForGroup({ 
        sectionId, 
        productGroup, 
        productLabel, 
        variantOptions,
        purchaseType: resolvedPurchaseType
     });
    }
    
    const derived = computeDerivedProductData({
      productObject,
      variantObject,
      variantConfig,
      productGroup,
      productLabel,
      config,
      purchaseType: purchaseType
    });
    
    setAddToCartFormForGroupMultiple({
      sectionId,
      productGroup,
      addToCartPayload: derived.addToCartPayload
    });

    
    const has = (selector) => allSelectors.includes(selector);
    if (has(SELECTORS.PRODUCT_GROUP.CAROUSEL)) {
      setCarouselMediaForGroup({
        sectionId,
        productGroup,
        media: derived.media,
        moveToIndex: derived.mediaIndex
      });
    }
}

function validateRequiredSelectors(sectionId, productGroup, allSelectors) {
  if (!allSelectors.includes(SELECTORS.PRODUCT_GROUP.VARIANT_PURCHASE_TYPE_COMBO)) {
    console.error("WWAI-ERROR ❌ Variant purchase type combo selector not found for sectionId:", sectionId, "productGroup:", productGroup);
    throw new Error("WWAI-ERROR ❌ Variant purchase type combo selector not found");
  }
}

function validateAllowedSelectors(sectionId, productGroup, allSelectors) {
  const allowed_list = [
    SELECTORS.PRODUCT_GROUP.ADD_TO_CART_BUTTON,
    SELECTORS.PRODUCT_GROUP.SUBMIT_INTERCEPTOR,
    SELECTORS.PRODUCT_GROUP.SUBSCRIPTION_FREQUENCY_STATIC,
    SELECTORS.PRODUCT_GROUP.PRICE_STATIC,
  ];
  
  let selectors_not_in_allowed_list = allowed_list.filter(selector => !allSelectors.includes(selector));
  // Remove undefined values
  selectors_not_in_allowed_list = selectors_not_in_allowed_list.filter(selector => selector !== undefined);

  if (selectors_not_in_allowed_list.length > 0) {
    throw new Error("WWAI-ERROR ❌ Unsupported Selectors for sectionId:" +  sectionId + " productGroup:" + productGroup + " selectors_not_in_allowed_list:" + selectors_not_in_allowed_list.join(", "));
  }
}

function resolvePurchaseType(purchaseType, config, sectionId, productGroup) {
  // If purchaseType is provided, use it.
  if (purchaseType != null) {
    if (!Object.values(COMBO_PURCHASE_TYPE_VALUES).includes(purchaseType)) {
      throw new Error("WWAI-ERROR ❌ Invalid purchase type:" + purchaseType + " for sectionId:" + sectionId + " productGroup:" + productGroup);
    }
    return purchaseType;
  }
  
  // If purchaseType is not provided, use the purchase type from the config.
  if (config && config.variantDispatchConfig && config.variantDispatchConfig.purchaseType) {
    const configPurchaseType = config.variantDispatchConfig.purchaseType;
    if (!Object.values(COMBO_PURCHASE_TYPE_VALUES).includes(configPurchaseType)) {
      throw new Error("WWAI-ERROR ❌ Invalid purchase type:" + configPurchaseType + " for sectionId:" + sectionId + " productGroup:" + productGroup);
    }
    return configPurchaseType;
  }
  
  // If purchaseType is not provided and no purchase type is in the config, use one time.
  return COMBO_PURCHASE_TYPE_VALUES.ONE_TIME;
}


export function reinitializeProductGroupOnVariantChangeFlatVariantAndSubscription(
  sectionId, 
  productGroup, 
  productLabel, 
  variantOptions,
  purchaseType
) {    
    const {
        config,
        variant_config,
        product_object,
        variant_object
    } = resolveProductDataAndConfigForLabel(sectionId, productGroup, productLabel, variantOptions);

    if (!product_object || !variant_object) {
        console.error(`WWAI-ERROR ❌ Unable to reinitialize product group for ${productGroup}`);
        return;
    }

    // Re-initialize UI
    updateProductGroupUIFlatVariantAndSubscription({
        sectionId,
        productGroup,
        productLabel,
        variantOptions,
        productObject: product_object,
        variantObject: variant_object,
        variantConfig: variant_config,
        config,
        purchaseType,
        setVariantAndSubscriptionSelection: false
    });
}
import { calculateOneTimePriceWithConfig } from '../../utils/product-data/pricing.js';
import {getResolvedMediaForVariant, getMediaIndexForVariantConfig} from '../../utils/product-data/media.js'
import { getVariantSellingPlanOptionDetails, resolveDefaultSellingPlanDetails } from '../../utils/product-data/subscription.js';
import {buildAddToCartPayload} from '../../utils/product-data/add_to_cart.js';
import {
    updatePricesForGroup, 
    setVariantSelectionForGroup, 
    setPurchaseTypeForGroup, 
    setCarouselMediaForGroup, 
    setSubscriptionFrequencyForGroup, 
    setVariantCustomLabelForGroup, 
    setAddToCartFormForGroup,
    updateGridSmartInteractionAvailability,
    setProductTitleForGroup,
    setVariantLabelTextForGroup
} from './update_selectors.js';
import { resolveProductDataAndConfigForLabel } from './update_utils.js';
import { getAllSelectorsInGroup } from '../registry-utils.js';
import { SELECTORS } from '../../constants/selector-constants.js';
const {
  PRICE,
  VARIANT_CUSTOM_LABEL,
  CAROUSEL,
  PURCHASE_TYPE,
  SUBSCRIPTION_FREQUENCY,
  ADD_TO_CART,
  GRID_SMART_INTERACTION,
  TITLE
} = SELECTORS.PRODUCT_GROUP;


export function computeDerivedProductData({ 
  productObject, 
  variantObject, 
  variantConfig, 
  productGroup, 
  productLabel, 
  config,
  purchaseType = null
}) {
  const oneTimePrice = calculateOneTimePriceWithConfig(productLabel, variantObject, config.pricingConfig);
  const media = getResolvedMediaForVariant(productObject, variantConfig);
  const mediaIndex = getMediaIndexForVariantConfig(variantConfig, productObject, variantObject);

  const sellingPlans = getVariantSellingPlanOptionDetails(productGroup, productLabel, variantObject, config);
  const sellingPlanDetails = resolveDefaultSellingPlanDetails(sellingPlans, config, variantObject);

  let purchaseTypeToUse = purchaseType != null ? purchaseType : config.uxConfig.defaultPurchaseType;
  const addToCartPayload = buildAddToCartPayload({
    variantObject,
    sellingPlanId: sellingPlanDetails.sellingPlanId,
    sellingPlanName: sellingPlanDetails.sellingPlanName,
    productObject,
    defaultPurchaseType: purchaseTypeToUse
  });

  return {
    oneTimePrice,
    media,
    mediaIndex,
    sellingPlans,
    sellingPlanDetails,
    addToCartPayload
  };
}

export function updateProductGroupUI({
    sectionId,
    productGroup,
    productLabel,
    variantOptions,
    productObject,
    variantObject,
    variantConfig,
    config,
    isReinitializing = false
  }) {
    // Compute Prices and Media
    const derived = computeDerivedProductData({
      productObject,
      variantObject,
      variantConfig,
      productGroup,
      productLabel,
      config
    });

    const allSelectors = getAllSelectorsInGroup(sectionId, productGroup);
    const has = (selector) => allSelectors.includes(selector);
    
    setVariantSelectionForGroup({ sectionId, productGroup, productLabel, variantOptions });
    // Set the variant label text in the variant selector if the text slot exists.
    // like: Color: Red
    setVariantLabelTextForGroup({
      sectionId,
      productGroup,
      labelText: variantObject.title || ""
    });

    if (has(VARIANT_CUSTOM_LABEL)) {
      setVariantCustomLabelForGroup({
        sectionId,
        productGroup,
        labelData: variantConfig?.customLabelText || {}
      });
    }

    if (has(PRICE)) {
      updatePricesForGroup({
        sectionId,
        productGroup,
        oneTimePrice: derived.oneTimePrice,
        subscriptionPrice: derived.sellingPlanDetails.sellingPlanPriceObject,
        purchaseType: config.uxConfig.defaultPurchaseType
      });
    }

    if (has(CAROUSEL)) {
      setCarouselMediaForGroup({
        sectionId,
        productGroup,
        config,
        media: derived.media,
        moveToIndex: derived.mediaIndex,
        isReinitializing
      });
    }

    if (has(PURCHASE_TYPE)) {
      setPurchaseTypeForGroup({
        sectionId,
        productGroup,
        oneTimePrice: derived.oneTimePrice,
        subscriptionPrice: derived.sellingPlanDetails.sellingPlanPriceObject,
        purchaseType: config.uxConfig.defaultPurchaseType,
        onlySetPurchaseType: false
      });
    }

    if (has(SUBSCRIPTION_FREQUENCY)) {
      setSubscriptionFrequencyForGroup({
        sectionId,
        productGroup,
        subscriptionOptions: derived.sellingPlans
      });
    }

    if (has(ADD_TO_CART)) {
      setAddToCartFormForGroup({
        sectionId,
        productGroup,
        addToCartPayload: derived.addToCartPayload
      });
    }
    if (has(GRID_SMART_INTERACTION)) {
      console.log("🔄 Updating Grid Smart Interaction Availability:", sectionId, productGroup, derived.addToCartPayload);
      updateGridSmartInteractionAvailability(
        sectionId,
        productGroup,
        derived.addToCartPayload
      );
    }
    if (has(TITLE)) {
      setProductTitleForGroup({
        sectionId,
        productGroup,
        title: productObject.title
      });
    }
}

export function reinitializeProductGroupOnVariantChange(
  sectionId, 
  productGroup, 
  productLabel, 
  variantOptions
) {
    console.log(`🔄 Reinitializing Product Group on Variant Change: [${productGroup}] - ${productLabel}`);
    
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
    updateProductGroupUI({
        sectionId,
        productGroup,
        productLabel,
        variantOptions,
        productObject: product_object,
        variantObject: variant_object,
        variantConfig: variant_config,
        config,
        isReinitializing: true
    });

    console.log(`✅ Reinitialized Product Group: ${productGroup} for Variant ${productLabel}`);
}  
import { setPurchaseTypeForGroup } from './update_selectors.js';
import { PURCHASE_TYPE_VALUES } from '../../constants/elements/purchase-type-selector-constants.js';
import {
  updatePriceSelectorsForGroup,
  setSellingPlanInAddToCartFormForGroup
} from './update_selectors_utils.js';

export function updateSubscriptionPlanForGroup(selectedPlan, sectionId, productGroup) {
  if (!selectedPlan || !sectionId || !productGroup) {
    console.error("WWAI-ERROR ❌ Invalid parameters provided to updateSubscriptionPlanForGroup.");
    return;
  }

  const priceObj = {
    price: selectedPlan.after_price,
    compareAtPrice: selectedPlan.before_price,
    discount_percent: selectedPlan.discount_percent
  };

  // ✅ 1. Set purchase type to "Subscription" only (UI toggle only)
  setPurchaseTypeForGroup({
    sectionId,
    productGroup,
    oneTimePrice: undefined,
    subscriptionPrice: undefined,
    purchaseType: PURCHASE_TYPE_VALUES.SUBSCRIPTION,
    onlySetPurchaseType: true
  });

  // ✅ 2. Update prices in both 'subscription' and 'onetime_or_subscription' views
  ['subscription', 'onetime_or_subscription'].forEach(type => {
    updatePriceSelectorsForGroup({
      sectionId,
      productGroup,
      priceObj,
      type
    });
  });

  // ✅ 3. Update selling plan in the add to cart form
  setSellingPlanInAddToCartFormForGroup({
    sectionId,
    productGroup,
    sellingPlanId: selectedPlan.selling_plan_id,
    sellingPlanName: selectedPlan.option_name
  });

  console.log(`✅ Subscription plan successfully updated for [${sectionId} / ${productGroup}]`);
}
import {
  updatePriceSelectorsForGroup,
  setSellingPlanInAddToCartFormForGroup
} from './update_selectors_utils.js';
import { getUniqueElementForSelectorInGroup } from '../registry-utils.js';
import { SELECTORS } from '../../constants/selector-constants.js';
import { PURCHASE_TYPE_VALUES } from '../../constants/elements/purchase-type-selector-constants.js';

function handleOneTimePurchase({ sectionId, productGroup, pricesDict }) {
  console.log("🛒 One-Time Purchase Selected → Clearing Selling Plan ID");

  setSellingPlanInAddToCartFormForGroup({
    sectionId,
    productGroup,
    sellingPlanId: '',
    sellingPlanName: ''
  });

  updatePriceSelectorsForGroup({
    sectionId,
    productGroup,
    priceObj: pricesDict.oneTimePrice,
    type: 'onetime_or_subscription'
  });
}

function handleSubscriptionPurchase({ sectionId, productGroup }) {
  const subscriptionSelector = getUniqueElementForSelectorInGroup(
    sectionId,
    productGroup,
    SELECTORS.PRODUCT_GROUP.SUBSCRIPTION_FREQUENCY
  );

  if (!subscriptionSelector) {
    console.warn(`⚠️ No subscription frequency selector found for [${sectionId} / ${productGroup}]`);
    return;
  }

  const selectedPlan = subscriptionSelector.getCurrentSelectedPlan();
  if (!selectedPlan) {
    console.warn(`⚠️ No subscription plan selected for [${sectionId} / ${productGroup}]`);
    return;
  }

  console.log("✅ Current Subscription Plan Found:", selectedPlan);

  setSellingPlanInAddToCartFormForGroup({
    sectionId,
    productGroup,
    sellingPlanId: selectedPlan.selling_plan_id,
    sellingPlanName: selectedPlan.option_name
  });

  updatePriceSelectorsForGroup({
    sectionId,
    productGroup,
    priceObj: {
      price: selectedPlan.after_price,
      compareAtPrice: selectedPlan.before_price,
      discount_percent: selectedPlan.discount_percent
    },
    type: 'onetime_or_subscription'
  });
}

export function updateSellingPlanAndPriceBasedOnPurchaseType({ sectionId, productGroup, purchaseType, pricesDict }) {
  if (purchaseType === PURCHASE_TYPE_VALUES.ONETIME) {
    handleOneTimePurchase({ sectionId, productGroup, pricesDict });
  } else if (purchaseType === PURCHASE_TYPE_VALUES.SUBSCRIPTION) {
    handleSubscriptionPurchase({ sectionId, productGroup });
  } else {
    console.warn(`⚠️ Unsupported purchase type '${purchaseType}' for [${sectionId} / ${productGroup}]`);
  }
}
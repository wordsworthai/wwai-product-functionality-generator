import { formatShopifyPrice } from './pricing.js';
import {resolveSellingPlanInfo} from './subscription_utils.js';

export function getVariantSellingPlanOptionDetails(
    productGroup, 
    product_label, 
    variant_object, 
    config
) {
    
    const sellingPlanInfo = resolveSellingPlanInfo(
        productGroup, 
        product_label, 
        variant_object, 
        config
    );
    if (!sellingPlanInfo) {
        console.warn("Selling plan info not found. Returning.");
        return [];
    }
    const prefixToRemove = config?.variant_option_remove_prefix || "";

    let product_specific_discount_percent = null;
    if (config?.pricingConfig?.productLabelDiscountMapping != undefined) {
        product_specific_discount_percent = config?.pricingConfig?.productLabelDiscountMapping[product_label]?.subscriptionDiscountPercent ?? null;
    }
    
    const subscriptionDiscountPercent = product_specific_discount_percent != null ? 
                                    product_specific_discount_percent : 
                                    (config?.pricingConfig?.subscriptionDiscountPercent ?? 0);

                                    
    // Step 3: Build transformed selling plan options
    return sellingPlanInfo.selling_plans.map((plan) => {
        const beforePrice = plan.base_price;
        let afterPrice = plan.first_order_price;

        // Apply additional subscription discount if specified
        if (subscriptionDiscountPercent > 0) {
            afterPrice = Math.round(afterPrice * (1 - subscriptionDiscountPercent / 100));
        }

        const computedDiscountPercent = beforePrice > 0 ? ((beforePrice - afterPrice) / beforePrice) * 100 : 0;

        // Clean option name by removing prefix if needed
        let optionName = plan.delivery_option || "";
        if (prefixToRemove && optionName.startsWith(prefixToRemove)) {
            optionName = optionName.substring(prefixToRemove.length).trim();
        }
        
        let saving = beforePrice - afterPrice;
        if (saving < 0) {
            saving = 0;
        }

        return {
            option_name: optionName,
            selling_plan_id: String(plan.selling_plan_id),
            before_price: typeof formatShopifyPrice === "function" ? formatShopifyPrice(beforePrice) : `${beforePrice}`,
            after_price: typeof formatShopifyPrice === "function" ? formatShopifyPrice(afterPrice) : `${afterPrice}`,
            savings: typeof formatShopifyPrice === "function" ? formatShopifyPrice(saving) : `${saving}`,
            discount_percent: computedDiscountPercent.toFixed(2),
        };
    });
}

export function resolveDefaultSellingPlanDetails(sellingPlanInfo, config, variantObject) {
    const defaultOption = config?.pricingConfig?.defaultSubscriptionOption ?? null;
    const useVariantCompareAtPriceForSubscription = config?.pricingConfig?.useVariantCompareAtPriceForSubscription ?? true;

    if (!Array.isArray(sellingPlanInfo) || sellingPlanInfo.length === 0) {
        console.warn("⚠️ No valid selling plan info provided.");
        return { sellingPlanName: null, sellingPlanId: null, sellingPlanPriceObject: null };
    }

    const selectedPlan = defaultOption
        ? sellingPlanInfo.find(plan => plan.option_name === defaultOption) || sellingPlanInfo[0]
        : sellingPlanInfo[0];

    const sellingPlanName = selectedPlan.option_name;
    const sellingPlanId = selectedPlan.selling_plan_id;

    const basePrice = selectedPlan.after_price;
    let compareAtPrice = selectedPlan.before_price;
    if (useVariantCompareAtPriceForSubscription && variantObject.compare_at_price) {
        compareAtPrice = formatShopifyPrice(variantObject.compare_at_price);
    }
    const discount_percent = selectedPlan.discount_percent;
    
    // Compute net discount later. Net discount can be different that subscription discount if price != compare_at_price in original.

    const sellingPlanPriceObject = {
        price: basePrice,
        compareAtPrice: compareAtPrice,
        discount_percent,
        savings: selectedPlan.savings
    };

    return {
        sellingPlanName,
        sellingPlanId,
        sellingPlanPriceObject
    };
}  
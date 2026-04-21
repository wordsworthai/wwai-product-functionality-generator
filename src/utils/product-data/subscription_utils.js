import {
    resolveVariantSellingPlanFromWindowObject,
    resolveUseMockSubscriptionFromWindowObject
} from '../../utils/product-lookup/product-object-utils';


export function processVariantAndSellingPlans(variants, sellingPlanGroups, removePrefix = null) {
    let variantSubscriptionMapping = {};

    variants.forEach(variant => {
        const variantId = variant.id;
        const variantTitle = variant.title;
        const basePrice = variant.price;
        let sellingPlans = [];

        const hasSubscription = Array.isArray(variant.selling_plan_allocations) && variant.selling_plan_allocations.length > 0;

        (variant.selling_plan_allocations || []).forEach(allocation => {
        const sellingPlanId = allocation.selling_plan_id;
        const priceAdjustments = allocation.price_adjustments || [];

        let firstOrderPrice = basePrice;
        let subsequentOrderPrice = null;

        priceAdjustments.forEach(adjustment => {
            if (adjustment.position === 1) {
            firstOrderPrice = adjustment.price;
            } else if (adjustment.position === 2) {
            subsequentOrderPrice = adjustment.price;
            }
        });

        if (subsequentOrderPrice === null) {
            subsequentOrderPrice = firstOrderPrice;
        }

        sellingPlanGroups.forEach(spGroup => {
            spGroup.selling_plans.forEach(sellingPlan => {
            if (sellingPlan.id === sellingPlanId) {
                let deliveryOption = sellingPlan.name;
                if (removePrefix && deliveryOption.startsWith(removePrefix)) {
                deliveryOption = deliveryOption.substring(removePrefix.length).trim();
                }

                sellingPlans.push({
                selling_plan_id: sellingPlanId,
                delivery_option: deliveryOption,
                base_price: basePrice,
                first_order_price: firstOrderPrice,
                subsequent_order_price: subsequentOrderPrice
                });
            }
            });
        });
        });

        variantSubscriptionMapping[`${variantId}, ${variantTitle}`] = {
        variant_id: variantId,
        variant_title: variantTitle,
        has_subscription: hasSubscription,
        selling_plans: sellingPlans
        };
    });

    return variantSubscriptionMapping;
};


export function lookupVariantSellingPlan(subscriptionResponse, variantId, variantTitle, useMockSubscription = false) {
    if (!subscriptionResponse || typeof subscriptionResponse !== "object") return null;

    for (const key of Object.keys(subscriptionResponse)) {
        const [keyVariantId, keyVariantTitle] = key.split(", ").map(str => str.trim());

        const isMatch = useMockSubscription
        ? keyVariantTitle === variantTitle
        : keyVariantId === String(variantId);

        if (isMatch) {
        return subscriptionResponse[key];
        }
    }

    return null;
}  


export function buildVariantSubscriptionMappingForProduct(productGroup, productLabel, prefixToRemove = null) {
    const variantSellingPlanObject = resolveVariantSellingPlanFromWindowObject(productGroup, productLabel);

    if (!variantSellingPlanObject) {
        console.warn(`❌ Cannot build subscription mapping — selling plan data missing for ${productGroup} / ${productLabel}`);
        return null;
    }

    const { variants, selling_plan_groups } = variantSellingPlanObject;

    if (!Array.isArray(variants) || !Array.isArray(selling_plan_groups)) {
        console.warn(`❌ Invalid variants or selling_plan_groups format.`);
        return null;
    }

    return processVariantAndSellingPlans(variants, selling_plan_groups, prefixToRemove);
}

export function resolveSellingPlanInfo(productGroup, productLabel, variantObject, config) {
    if (!productGroup || !productLabel || !variantObject || !config) {
        console.warn(`❌ Invalid product group, product label, variant object, or config.`);
        return null;
    }

    const subscriptionResponse = buildVariantSubscriptionMappingForProduct(
        productGroup,
        productLabel,
        config.uxConfig.variantOptionRemovePrefix
    );

    const useMockSubscription = resolveUseMockSubscriptionFromWindowObject();

    const sellingPlanInfo = lookupVariantSellingPlan(
        subscriptionResponse,
        variantObject.id,
        variantObject.title,
        useMockSubscription
    );

    return sellingPlanInfo;
}
  
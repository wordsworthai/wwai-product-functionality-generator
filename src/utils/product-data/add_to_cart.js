import { PURCHASE_TYPE_VALUES } from '../../constants/elements/purchase-type-selector-constants';

export function buildAddToCartPayload({
    variantObject,
    sellingPlanId,
    sellingPlanName,
    productObject,
    defaultPurchaseType
  }) {
    if (!variantObject || !productObject) {
        console.warn(`❌ Invalid variant object or product object.`);
        return null;
    }

    const isSubscription = defaultPurchaseType === PURCHASE_TYPE_VALUES.SUBSCRIPTION;
    const availability = variantObject.available !== false;

    return {
        variantId: variantObject.id,
        variantName: `${productObject.title} - ${variantObject.title}`, // Useful for debugging
        productHandle: productObject.handle,
        available: availability,
        sellingPlanId: isSubscription ? sellingPlanId : null,
        sellingPlanName: isSubscription ? sellingPlanName : null
    };
}  
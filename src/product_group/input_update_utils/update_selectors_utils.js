import { getElementsForSelectorInGroup, getUniqueElementForSelectorInGroup } from '../registry-utils.js';
import { SELECTORS } from '../../constants/selector-constants.js';

export function hasPurchaseTypeSelectorFn(sectionId, productGroup) {
    const purchaseTypeSelector = getUniqueElementForSelectorInGroup(sectionId, productGroup, SELECTORS.PRODUCT_GROUP.PURCHASE_TYPE);
    if (!purchaseTypeSelector) {
        return false;
    }
    return true;
}

export function callUpdatePrices(el, priceObj, type) {
    if (priceObj) {
        el.updatePrices({
            price: priceObj.price,
            compareAtPrice: priceObj.compareAtPrice,
            discount_percent: priceObj.discount_percent
        }, type);
    }
}

export function updatePriceSelectorsForGroup({ sectionId, productGroup, priceObj, type }) {
    const priceSelectors = getElementsForSelectorInGroup(sectionId, productGroup, SELECTORS.PRODUCT_GROUP.PRICE);
    priceSelectors.forEach((el) => {
        if (typeof el.updatePrices !== 'function') {
            console.warn(`⚠️ Skipping price selector: missing updatePrices method`, el);
            return;
        }
        if (priceObj) {
            callUpdatePrices(el, priceObj, type);
        } else {
            console.warn(`⚠️ priceObj data is missing for type '${type}'.`);
        }
    });
}

export function setSellingPlanInAddToCartFormForGroup({
    sectionId,
    productGroup,
    sellingPlanId,
    sellingPlanName
}) {
    const addToCartSelector = getUniqueElementForSelectorInGroup(sectionId, productGroup, SELECTORS.PRODUCT_GROUP.ADD_TO_CART);

    if (!addToCartSelector) {
        return;
    }

    if (!addToCartSelector || typeof addToCartSelector.updateSellingPlan !== 'function') {
        console.error(`WWAI-ERROR ❌ Could not find <product-custom-add-to-cart-button-selector> or missing .updateSellingPlan()`);
        return;
    }

    // ✅ Call the method to set the selling plan
    addToCartSelector.updateSellingPlan(sellingPlanId, sellingPlanName);
}


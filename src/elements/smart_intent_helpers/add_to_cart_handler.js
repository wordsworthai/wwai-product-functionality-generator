import { resolveProductDataAndConfigForLabel } from '../../product_group/input_update_utils/update_utils.js';
import { handleCustomAddToCart } from '../journey_helpers/add_to_cart_utils.js';
import { getProductVariantSelector } from './utils.js';
import { getWWAIConfig } from "../../wwai_config.js";

function buildAddToCartItemsFromSelection(
    selectedVariant, 
    sectionId, 
    productGroup
) {
    // ✅ Resolve the variant data and config.
    const {
        config,
        variant_config,
        product_object,
        variant_object
    } = resolveProductDataAndConfigForLabel(
        sectionId,
        productGroup,
        selectedVariant.productLabel,
        selectedVariant.variantOptions
    );

    if (!variant_object || !product_object) {
        console.error("WWAI-ERROR ❌ Variant or Product Object not found during resolution.");
        return null;
    }
    
    const readableTitle = product_object.title || "Unknown Product";
    const readableOptionName = variant_object.title || "One-time purchase";
    const quantity = 1;

    
    const payload = [
            {
                id: variant_object.id,
                quantity: 1,
                _debug: {
                    source: 'manual',
                    variantId: variant_object.id,
                    quantity: quantity,
                    sellingPlan: null,
                    bundlePayload: false,
                    readableString: `${readableTitle} - ${readableOptionName} (Qty: ${quantity})`
                }              
            }
    ];
    // Add selling plan info.
    // payload.items[0].selling_plan = productData.sellingPlanId;
    return payload;
}


export function createLambdaForAddToCart(sectionId, productGroup, flowConfig) {
    if (!sectionId || !productGroup) {
        console.error("WWAI-ERROR ❌ Missing sectionId or productGroup.");
        return;
    }

    // ✅ Return a lambda function that triggers the redirect.
    return (selectedVariant) => {
        if (!selectedVariant) {
            console.error("WWAI-ERROR ❌ Selected variant is not provided.");
            return null;
        }
        const items = buildAddToCartItemsFromSelection(
            selectedVariant, 
            sectionId, 
            productGroup
        );
        console.log(`🌐 Triggering add to cart for Section ID: ${sectionId} and Product Group: ${productGroup}`);

        const deployMode = getWWAIConfig().deployMode;
        let useMock = deployMode === "local";
        handleCustomAddToCart(
            items, 
            flowConfig, 
            sectionId, 
            productGroup,
            useMock,
            null
        );
    };
}

export function addCurrentVariantToCart(sectionId, productGroup, flowConfig) {
    const product_variant_selector = getProductVariantSelector(sectionId, productGroup);
    const selectedVariant = product_variant_selector.getSelectedVariant();
    const items = buildAddToCartItemsFromSelection(
        selectedVariant, 
        sectionId, 
        productGroup
    );
    console.log(`🌐 Triggering add to cart for Section ID: ${sectionId} and Product Group: ${productGroup}`);
    const deployMode = getWWAIConfig().deployMode;
    let useMock = deployMode === "local";
    handleCustomAddToCart(
        items, 
        flowConfig, 
        sectionId, 
        productGroup,
        useMock,
        null
    );
}
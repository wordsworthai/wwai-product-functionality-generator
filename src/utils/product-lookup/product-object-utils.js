import { getVirtualBundleHandle, createVirtualBundleProduct } from './virtual-product-bundle-utils.js';
import { getWWAIConfig } from "../../wwai_config.js";

function getAllSectionData() {
    // sectionId
    if (!window.__WWAI__SECTION_PRODUCT_DATA__ || !window.__WWAI__SECTION_PRODUCT_DATA__["all_sections"]) {
        console.warn(`⚠️ No data found for section: all_sections.`);
        return null;
    }
    return window.__WWAI__SECTION_PRODUCT_DATA__["all_sections"];
  }

export function getProductFromGroup(productGroup, productLabel) {
    if (productLabel.startsWith('wwai_virtual_bundle__')) {
        return {};
    }
    
    const globalSectionData = getAllSectionData();
    if (
        !globalSectionData ||
        !globalSectionData.storeData ||
        !globalSectionData.storeData.productGroups
    ) {
        console.warn(`⚠️ Invalid globalSectionData.`);
        return null;
    }

    const groupData = globalSectionData.storeData.productGroups[productGroup];
    if (!groupData || !groupData[productLabel]) {
        console.warn(`⚠️ Product "${productLabel}" not found in product group "${productGroup}".`);
        return null;
    }

    return groupData[productLabel];
}

function normalizeOptions(...options) {
    return options
        .filter(opt => opt !== null && opt !== undefined)
        .map(opt => opt.trim());
}
  
function isExactVariantMatch(variant, matchOptions) {
    const variantOptions = normalizeOptions(variant.option1, variant.option2, variant.option3);

    return (
        matchOptions.length === variantOptions.length &&
        matchOptions.every((val, index) => val === variantOptions[index])
    );
}

function getVirtualBundleIfExists(productGroup, productLabel) {
    let virtual_bundle_handle = getVirtualBundleHandle(productGroup, productLabel);
    if (window.WWAI_VIRTUAL_BUNDLE_CONFIG && window.WWAI_VIRTUAL_BUNDLE_CONFIG.hasOwnProperty(virtual_bundle_handle)) {
      const bundleItems = window.WWAI_VIRTUAL_BUNDLE_CONFIG[virtual_bundle_handle];
      const resolvedVariants = bundleItems.map(item => getProductVariant(item.handle, item.handle, ...item.variantOptions));
      const virtualProduct = createVirtualBundleProduct(productGroup, resolvedVariants, bundleItems);
      return virtualProduct;
    } else {
        return null;
    }
}


export function getProductVariant(productGroup, productLabel, option1, option2 = null, option3 = null) {
    const product = getProductFromGroup(productGroup, productLabel);
    if (!product) return null;

    if (productLabel.startsWith('wwai_virtual_bundle__')) {
        let virual_product = getVirtualBundleIfExists(productGroup, productLabel);
        console.log("Resolved virtual bundle:", productGroup, productLabel, virual_product);
        return virual_product;
    }

    const variants = product.variants || [];
    const matchOptions = normalizeOptions(option1, option2, option3);

    // Special case: __wwai_first__ returns first variant
    if (matchOptions.length === 1 && matchOptions[0] === "__wwai_first__") {
        if (window.customProductEventLoggingEnabled) {
        console.log(`Returning first variant due to __wwai_first__ directive.`);
        }
        return variants[0];
    }

    // Look for exact match
    for (let variant of variants) {
        if (isExactVariantMatch(variant, matchOptions)) {
        return variant;
        }
    }

    // Fallback, in case there is only one variant present, we just return that.
    if (variants.length === 1) {
        return variants[0];
    }

    console.warn(`⚠️ No matching variant found for options [${matchOptions.join(', ')}] in product "${productLabel}" under group "${productGroup}".`);
    return null;
}

export function resolveVariantSellingPlanFromWindowObject(productGroup, productLabel) {
    const globalSectionData = getAllSectionData();

    if (
        !globalSectionData ||
        !globalSectionData.storeData ||
        !globalSectionData.storeData.variantSellingPlans
    ) {
        console.warn("⚠️ Invalid globalSectionData or missing variantSellingPlans.");
        return null;
    }

    const productGroupKey = `${productGroup}__${productLabel}`;
    const sellingPlanData = globalSectionData.storeData.variantSellingPlans[productGroupKey];

    if (!sellingPlanData) {
        console.warn(`⚠️ No selling plan found for productGroup="${productGroup}" and productLabel="${productLabel}"`);
        return null;
    }

    return sellingPlanData; // { variants: [...], selling_plan_groups: [...] }
}

export function resolveProductAndVariantFromWindowProductObject(productGroup, productLabel, options = {}) {
    console.group('[resolveVariantFromWindowProduct]');
    console.log('Product Group:', productGroup);
    console.log('Product Label:', productLabel);
    console.log('Variant Options:', options);
    console.groupEnd();

    const option1 = options.option1 || null;
    const option2 = options.option2 || null;
    const option3 = options.option3 || null;

    const product = getProductFromGroup(productGroup, productLabel);
    if (!product) return { product: null, variant: null };

    const variant = getProductVariant(productGroup, productLabel, option1, option2, option3);

    return { product, variant };
}

export function resolveUseMockSubscriptionFromWindowObject() {
    if (getWWAIConfig().useMockSubscription == undefined) {
        console.warn("⚠️ Missing or invalid 'useMockSubscription' in window object.");
        return null;
    }

    return getWWAIConfig().useMockSubscription;
}

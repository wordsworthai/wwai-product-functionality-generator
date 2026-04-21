export function createVirtualBundleProduct(bundleKey, resolvedVariants, bundleItems) {
    // Build title from variant titles
    const titleParts = resolvedVariants.map(v => v?.title || "Unknown");
    const title = `wwai_bundle - ${titleParts.join(" + ")}`;
  
    // Initialize computed values
    let totalPrice = 0;
    let totalCompareAtPrice = 0;
    let available = true;
  
    // Build add-to-cart payload
    const addToCartPayload = [];
  
    resolvedVariants.forEach((variant, idx) => {
      const quantity = bundleItems[idx]?.quantity || 1;
  
      // fallback compare_at_price if null
      const compareAt = variant.compare_at_price != null ? variant.compare_at_price : variant.price;
  
      totalPrice += (variant.price * quantity);
      totalCompareAtPrice += (compareAt * quantity);
  
      if (!variant.available) available = false;
  
      // Add to payload
      addToCartPayload.push({
        id: variant.id,
        quantity: quantity
      });
    });
  
    // Return full virtual bundle object
    return {
      id: `wwai_bundle_${bundleKey}`,
      title,
      available,
      price: totalPrice,
      compare_at_price: totalCompareAtPrice,
      add_to_cart_payload: addToCartPayload
    };
}
  
function getVirtualBundleHandleFromLiquidString(mappingArray, product_group, product_label) {
    for (const item of mappingArray) {
        const parts = item.split(':').map(x => x.trim());
        if (parts[0] === product_group && parts[1] === product_label) {
            return parts[2]; // ✅ Now this properly returns from the main function
        }
    }
    return null;
}

export function getVirtualBundleHandle(product_group, product_label) { 
    if (Array.isArray(window.__WWAI__LIQUID_STATIC_PRODUCT_MAPPING_ARRAY__) && window.__WWAI__LIQUID_STATIC_PRODUCT_MAPPING_ARRAY__.length > 0) {
        return getVirtualBundleHandleFromLiquidString(window.__WWAI__LIQUID_STATIC_PRODUCT_MAPPING_ARRAY__, product_group, product_label);
    }
    return null;
}
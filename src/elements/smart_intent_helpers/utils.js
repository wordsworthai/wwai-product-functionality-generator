export function getProductVariantSelector(sectionId, productGroup) {
    // Find the relevant variant selector
    const selector = document.querySelector(`product-variant-selector[section_id="${sectionId}"][product_group="${productGroup}"]`);
  
    if (!selector) {
      console.error(`WWAI-ERROR ❌ No <product-variant-selector> found for section: ${sectionId}, group: ${productGroup}`);
      return null;
    }
    return selector;
}

export function getProductOptionsOverlaySelector(sectionId, productGroup) {
    // Find the relevant variant selector
    const selector = document.querySelector(`product-custom-collection-options-overlay-selector[section_id="${sectionId}"][product_group="${productGroup}"]`);
  
    if (!selector) {
      console.error(`WWAI-ERROR ❌ No <product-custom-collection-options-overlay-selector> found for section: ${sectionId}, group: ${productGroup}`);
      return null;
    }
    return selector;
}
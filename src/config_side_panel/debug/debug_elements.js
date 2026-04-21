import { SELECTORS } from "../../constants/selector-constants.js";
import { getProductFromGroup, getProductVariant } from "../../utils/product-lookup/product-object-utils.js";

function getVariantInfoForProductGroup(productGroup) {
  // Find variant selector for this product group
  const variantSelectors = document.querySelectorAll(SELECTORS.PRODUCT_GROUP.VARIANT);
  
  for (const variantSelector of variantSelectors) {
    if (variantSelector.productGroup === productGroup) {
      try {
        let productLabel = null;
        let variantOptions = null;
        let product = null;
        let product_variant = null;
        let inputs = null;
        
        try {
            let { productLabel, variantOptions } = variantSelector.getSelectedVariant();
            product = getProductFromGroup(productGroup, productLabel);
            product_variant = getProductVariant(productGroup, productLabel, variantOptions?.option1, variantOptions?.option2, variantOptions?.option3);
        } catch (error) {
            console.log(`DEBUG_SELECTORS: Error getting variant for ${productGroup}:`, error);
        }
        inputs  = variantSelector.inputs;

        return {
          productLabel,
          variantOptions,
          product,
          product_variant,
          inputs,
          hasVariantData: true
        };
      } catch (error) {
        console.log(`DEBUG_SELECTORS: Error getting variant for ${productGroup}:`, error);
        return {
          productLabel: null,
          variantOptions: null,
          product: null,
          product_variant: null,
          inputs: null,
          hasVariantData: false,
          error: error.message
        };
      }
    }
  }
  
  return {
    productLabel: null,
    variantOptions: null,
    hasVariantData: false,
    error: "No variant selector found for this product group"
  };
}

export function printAllSelectorsWithSectionIdsAndProductGroups() {
    console.log("🔄 Printing all selectors grouped by section ID and product group...");
    
    // Get all selectors from both PRODUCT_GROUP and OTHER
    const allSelectors = {
      ...SELECTORS.PRODUCT_GROUP,
      ...SELECTORS.OTHER
    };
    
    console.log("📋 All available selectors:", allSelectors);
    
    // Group data structure: { sectionId: { productGroup: { selectors: [], count: number } } }
    const groupedData = {};
    
    // Loop through each selector
    Object.entries(allSelectors).forEach(([selectorName, selectorValue]) => {      
      // Find all custom elements with this selector name on the page
      const elements = document.querySelectorAll(selectorValue);
      
      if (elements.length === 0) {
        ;
      } else {        
        // Loop through each found element
        elements.forEach((element, index) => {
          const sectionId = element.sectionId;
          const productGroup = element.productGroup;
                  
          // Group the data
          if (sectionId && productGroup) {
            if (!groupedData[sectionId]) {
              groupedData[sectionId] = {};
            }
            if (!groupedData[sectionId][productGroup]) {
              groupedData[sectionId][productGroup] = {
                selectors: [],
                count: 0
              };
            }
            
            // Add selector if not already present
            if (!groupedData[sectionId][productGroup].selectors.includes(selectorName)) {
              groupedData[sectionId][productGroup].selectors.push(selectorName);
              groupedData[sectionId][productGroup].count++;
            }
          }
        });
      }
    });
    
    // Print grouped results
    console.log("\nDEBUG_SELECTORS: GROUPED RESULTS BY SECTION ID AND PRODUCT GROUP:");
    console.log("=".repeat(80));
    
    if (Object.keys(groupedData).length === 0) {
      console.log("DEBUG_SELECTORS: No elements found with section_id and product_group");
    } else {
      Object.entries(groupedData).forEach(([sectionId, productGroups]) => {
        console.group(`DEBUG_SELECTORS: SECTION ID: ${sectionId}`);
        
        Object.entries(productGroups).forEach(([productGroup, data]) => {
          console.group(`DEBUG_SELECTORS: PRODUCT GROUP: ${productGroup} | Total Selectors: ${data.count}`);
          console.log(`DEBUG_SELECTORS: Selector Names: ${data.selectors.join(', ')}`);
          
          // Get variant information for this product group
          const variantInfo = getVariantInfoForProductGroup(productGroup);
          console.log(`DEBUG_SELECTORS: Variant Info:`, variantInfo);
          
          console.groupEnd();
        });
        
        console.groupEnd();
      });
    }
}
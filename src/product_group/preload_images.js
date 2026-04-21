import {buildProductHierarchyFromSelector} from '../utils/element-selector-utils/product-variant-selector-utils.js';
import {getResolvedMediaForVariant, getMediaIndexForVariantConfig} from '../utils/product-data/media.js'
import { resolveProductDataAndConfigForLabel } from './input_update_utils/update_utils.js';

/**
 * Extracts the variant options for each product label directly from the productHierarchy,
 * and generates a cross-product of option1, option2, and option3.
 * 
 * @param {object} productHierarchy - The hierarchy object containing product labels and variants.
 * @returns {Array} - A list of tuples where each tuple contains:
 *                    - The product label
 *                    - An object with variant options in `{ option1, option2, option3 }` format
 */
export function extractVariantOptionsFromHierarchy(productHierarchy) {
    const variantOptionsList = [];
  
    // Helper to generate the cross-product
    const crossProduct = (arr1, arr2, arr3) => {
      const result = [];
      arr1.forEach(v1 => {
        arr2.forEach(v2 => {
          arr3.forEach(v3 => {
            result.push({
              option1: v1,
              option2: v2 || null,
              option3: v3 || null
            });
          });
        });
      });
      return result;
    };
  
    // Iterate over each product label
    for (const productLabel of productHierarchy.productLabels) {
      // Directly extract variant options from the hierarchy
      const optionTree = productHierarchy.variants[productLabel];
  
      if (!optionTree || Object.keys(optionTree).length === 0) {
        console.warn(`⚠️ Product "${productLabel}" has no variant options defined in the HTML hierarchy.`);
        continue;
      }
  
      // Read and trim options
      const option1Values = (optionTree.option1 || []).map(opt => opt.trim());
      const option2Values = (optionTree.option2 || [null]);
      const option3Values = (optionTree.option3 || [null]);
  
      // Generate the cross product of all options
      const allCombinations = crossProduct(option1Values, option2Values, option3Values);
  
      // Push each combination as a tuple to the list
      allCombinations.forEach(combo => {
        const variantOptions = {
          ...(combo.option1 ? { option1: combo.option1 } : {}),
          ...(combo.option2 ? { option2: combo.option2 } : {}),
          ...(combo.option3 ? { option3: combo.option3 } : {})
        };
  
        variantOptionsList.push([productLabel, variantOptions]);
      });
    }
  
    return variantOptionsList;
  }
  
  function preloadImages(imageUrls) {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      console.warn("⚠️ No images to preload.");
      return;
    }
  
    console.log(`🚀 Starting to preload ${imageUrls.length} images...`);
  
    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
  
      // Optional: Listen for load and error events
      img.onload = () => console.log(`✅ Image preloaded: ${url}`);
      img.onerror = () => console.error(`WWAI-ERROR ❌ Failed to preload image: ${url}`);
    });
  }
  
  
export function preloadImagesForProductGroup(sectionId, productGroup) {
    const selector = document.querySelector('product-variant-selector');
    const hierarchy = buildProductHierarchyFromSelector(selector);
    const mapping = extractVariantOptionsFromHierarchy(hierarchy);

    // ✅ Array to hold the image URLs to preload
    const imagesToPreload = [];

    mapping.forEach(([productLabel, variantOptions], index) => {
        const {
        config,
        variant_config,
        product_object,
        variant_object
    } = resolveProductDataAndConfigForLabel(sectionId, productGroup, productLabel, variantOptions);

        const variant_images = getResolvedMediaForVariant(product_object, variant_config);
        const variant_image_index = getMediaIndexForVariantConfig(variant_config);

        if (variant_images && variant_images[variant_image_index]) {
        const firstImageSource = variant_images[variant_image_index].src;
        imagesToPreload.push(firstImageSource);
        }

    });

    preloadImages(imagesToPreload);
}
  
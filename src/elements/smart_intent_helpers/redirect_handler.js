import { resolveProductDataAndConfigForLabel } from '../../product_group/input_update_utils/update_utils.js';
import { getProductVariantSelector } from './utils.js';
import {redirectWithLoader} from '../journey_helpers/redirect_utils.js';
import { getWWAIConfig } from '../../wwai_config.js';

function createOptionMapping(productObject, variantObject) {
    if (!productObject || !variantObject) {
        console.error("WWAI-ERROR ❌ Product or Variant object is missing.");
        return null;
    }
  
    // Extract options from the product object.
    const productOptions = productObject.options;
  
    // Extract variant options.
    const variantOptions = {
        option1: variantObject.option1,
        option2: variantObject.option2,
        option3: variantObject.option3
    };
  
    // Create the original mapping and the reversed mapping.
    const optionMapping = {};
    const reversedMapping = {};
  
    productOptions.forEach((optionName, index) => {
        const variantOptionKey = `option${index + 1}`;
        const variantValue = variantOptions[variantOptionKey];
  
        if (variantValue) {
            optionMapping[optionName] = variantValue;
            reversedMapping[variantValue] = optionName;
        }
    });
    
    return {
        optionMapping,
        reversedMapping
    };
}


function generateShopifyProductUrl(
    productObject, 
    variantObject, 
    reversedMapping, 
    labelKeyToKeepList
) {
    if (!productObject || !variantObject || !reversedMapping) {
      console.error("WWAI-ERROR ❌ One or more required objects are missing.");
      return null;
    }
    if (labelKeyToKeepList.length != 1) {
        console.error("WWAI-ERROR ❌ Expected labelKeyToKeepList to have length 1.");
        return null;
    }

    const productHandle = productObject.handle;
    const variantId = variantObject.id;
    const labelKeyToKeep = labelKeyToKeepList[0];

    if (!productHandle || !variantId) {
      console.error("WWAI-ERROR ❌ Product handle or variant ID is missing.");
      return null;
    }
  
    let url = `/products/${productHandle}?variant=${variantId}`;
  
    Object.entries(reversedMapping).forEach(([value, name]) => {
      const formattedName = name.replace(/\s+/g, '-').toLowerCase();
  
      if (formattedName.includes(labelKeyToKeep.toLowerCase())) {
        const formattedValue = value;
        url += `&${labelKeyToKeep.toLowerCase()}=${formattedValue}`;
      }
    });
  
    return url;
}

function buildRedirectUrlFromSelection(
    selectedVariant, 
    sectionId, 
    productGroup,
    labelKeyToKeepList
) {
    // Resolve the variant data and config.
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

    const { optionMapping, reversedMapping } = createOptionMapping(product_object, variant_object);

    if (!variant_object || !product_object) {
        console.error("WWAI-ERROR ❌ Variant or Product Object not found during resolution.");
        return null;
    }

    return generateShopifyProductUrl(
        product_object, 
        variant_object, 
        reversedMapping, 
        labelKeyToKeepList,
        sectionId, 
        productGroup
    );
}

export function createLambdaForUrlRedirect(sectionId, productGroup, flowConfig, labelKeyToKeepList) {
    if (!sectionId || !productGroup) {
      console.error("WWAI-ERROR ❌ Missing sectionId or productGroup.");
      return;
    }
  
    console.log(`🌐 Triggering redirect for Section ID: ${sectionId} and Product Group: ${productGroup}`);
    
    // ✅ Return a lambda function that triggers the redirect
    return (selectedVariant) => {
        if (!selectedVariant) {
        console.error("WWAI-ERROR ❌ Selected variant is not provided.");
        return null;
        }
        const redirect_url = buildRedirectUrlFromSelection(
            selectedVariant, 
            sectionId, 
            productGroup, 
            labelKeyToKeepList
        );
        console.log("🛠️ Redirecting to url:", redirect_url);
        const deployMode = getWWAIConfig().deployMode;
        let useMock = deployMode === "local";

        redirectWithLoader(
            redirect_url, 
            flowConfig, 
            sectionId, 
            productGroup,
            useMock
        );
    };
}

export function redirectToProductPage(sectionId, productGroup, flowConfig) {
    const product_variant_selector = getProductVariantSelector(sectionId, productGroup);
    const selectedVariant = product_variant_selector.getSelectedVariant();

    // Extract the product label
    const productLabel = selectedVariant.productLabel;

    // ✅ Build the URL path
    const redirect_url = `/products/${productLabel}`;
    console.log("🛠️ Redirecting to url:", redirect_url);

    const deployMode = getWWAIConfig().deployMode;
    let useMock = deployMode === "local";

    redirectWithLoader(
        redirect_url, 
        flowConfig, 
        sectionId, 
        productGroup,
        useMock
    );
}

export function redirectToCustomUrl(sectionId, productGroup, flowConfig, customUrl) {
    // ✅ Build the URL path
    const redirect_url = customUrl;
    console.log("🛠️ Redirecting to url:", redirect_url);

    const deployMode = getWWAIConfig().deployMode;
    let useMock = deployMode === "local";

    redirectWithLoader(
        redirect_url, 
        flowConfig, 
        sectionId, 
        productGroup,
        useMock
    );
}
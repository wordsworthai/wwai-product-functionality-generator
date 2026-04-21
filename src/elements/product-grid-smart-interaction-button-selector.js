import { WWAIBaseProductElement } from './base-product-element.js';
import { SELECTORS } from '../constants/selector-constants.js';
import { handleDirectAdd, handleRedirect, handleOverlay, handleCustomRedirect } from './smart_intent_helpers/action_utils.js';
import {
  injectAvailabilityStyles,
  applyAvailabilityState
} from './smart_intent_helpers/availability_utils.js';
import { getProductFromGroup } from '../utils/product-lookup/product-object-utils.js';
import { getUniqueElementForSelectorInGroup } from '../product_group/registry-utils.js';

export class ProductGridSmartInteractionButtonSelector extends WWAIBaseProductElement {
  constructor() {
    super();
    this.button = null;
    this.flowConfig = null;
    this.uxConfig = null;
    this.isAvailable = true; // default to available
  }

  handleSmartIntentClick() {
    if (!this.uxConfig || !this.uxConfig.preAddToCartFlowConfig) {
      console.warn("❌ Missing preAddToCartFlowConfig in uxConfig inside ProductGridSmartInteractionButtonSelector");
      return;
    }

    if (!this.flowConfig) {
      console.warn("❌ Missing flowConfig inside ProductGridSmartInteractionButtonSelector");
      return;
    }

    const preAddToCartFlowConfig = this.uxConfig.preAddToCartFlowConfig;
    const journeyType = preAddToCartFlowConfig.journeyType;
    const postSelectionAction = preAddToCartFlowConfig.postSelectionAction;
    const postSelectionActionParams = preAddToCartFlowConfig?.postSelectionActionParams || {};

    // In case variant exists inside overlay and length of variant = 1 for this product 
    // We can directly add the product to cart. We only do this if variant is inside overlay
    // If subscription is inside overlay, this should not be the case.


    if (journeyType !== "custom-redirect") {
      if (this.handleSingleVariantDirectAdd()) {
        // Direct add for single variant products
        handleDirectAdd(this.sectionId, this.productGroup, this.flowConfig);
        console.log("✅ Single variant product detected, proceeding with direct add for [${this.sectionId} / ${this.productGroup}]");
        return;
      }
    }

    switch (journeyType) {
      case "direct-add":
        handleDirectAdd(this.sectionId, this.productGroup, this.flowConfig);
        break;
  
      case "redirect":
        handleRedirect(this.sectionId, this.productGroup, this.flowConfig);
        break;
  
      case "overlay":
        handleOverlay(this.sectionId, this.productGroup, this.flowConfig, postSelectionAction, postSelectionActionParams);
        break;

      case "custom-redirect":
        handleCustomRedirect(this.sectionId, this.productGroup, this.flowConfig, postSelectionActionParams);
        break;
  
      default:
        console.warn(`❌ Unknown journeyType "${journeyType}" for product group ${this.productGroup}`);
    }
  }

  handleSingleVariantDirectAdd() {
    const variantSelector = getUniqueElementForSelectorInGroup(this.sectionId, this.productGroup, SELECTORS.PRODUCT_GROUP.VARIANT);
    
    if (!variantSelector) {
      console.warn(`❌ No variant selector found for [${this.sectionId} / ${this.productGroup}]`);
      return;
    }

    const { productLabel, variantOptions } = variantSelector.getSelectedVariant();

    // Get product and variant data from the variant selector's scope
    let product = null;
    try {
      product = getProductFromGroup(this.productGroup, productLabel);
    } catch (error) {
      console.warn(`❌ Error getting product from group for [${this.sectionId} / ${this.productGroup}]:`, productLabel, error);
      return false;
    }
    
    
    const variantOverlaySelector = getUniqueElementForSelectorInGroup(
      this.sectionId, 
      this.productGroup, 
      SELECTORS.PRODUCT_GROUP.COLLECTION_OPTIONS_OVERLAY
    );
    
    if (variantOverlaySelector) {
      // Check if a variant selector is present inside this selector
      const variantSelectorInside = variantOverlaySelector.querySelector(
        SELECTORS.PRODUCT_GROUP.VARIANT
      );
      const subscriptionSelectorInside = variantOverlaySelector.querySelector(
        SELECTORS.PRODUCT_GROUP.SUBSCRIPTION_FREQUENCY
      );

      if (variantSelectorInside && !subscriptionSelectorInside) {
        console.log(`✅ Found variant selector inside smart interaction button for [${this.sectionId} / ${this.productGroup}]`);
              
        if (product && product.variants && product.variants.length === 1) {
          console.log(`✅ Single variant product detected, proceeding with direct add for [${this.sectionId} / ${this.productGroup}]`);
          return true;
        }
      }
    } 
    return false;
  }
  
  connectedCallback() {
    injectAvailabilityStyles(); // Inject scoped styles for out of stock.

    // Step 1: Find the button element inside
  
    this.button = this.querySelector('button');

    if (!this.button) {
      console.error("WWAI-ERROR ❌ No button found inside <product-grid-icon-smart-add-to-cart-button-selector>");
      return;
    }

    this.button.addEventListener('click', (e) => {
      console.log("product-grid-smart-interaction-button-selector clicked.");
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      // handle the smart intent click.
      this.handleSmartIntentClick();
    });
  }


  /* Public Method to Initialize UI Config from Product Group Init */
  initUXConfig(config) {
    super.initUXConfig(config);
    this.updateAvailabilityView(); // Retry applying availability once config is known
  }
    
  // Called to set availability (but only shows if journeyType supports it)
  updateAvailability(isAvailable, tooltipText = "Out of stock") {
    this.isAvailable = isAvailable;
    this.tooltipText = tooltipText;
    this.updateAvailabilityView();
  }

  // Called to apply availability UI once all configs are known
  updateAvailabilityView() {
    const journeyType = this.uxConfig?.preAddToCartFlowConfig?.journeyType;
    let disableBtn = journeyType === 'direct-add';
    // If journeyType is not custom-redirect, we need to check if the product is a single variant product.
    // If it is, we need to disable the button. We dont call the function in case of redirect, since 
    // variants etc might not be correctly set.
    if (journeyType != "custom-redirect") {
      disableBtn = disableBtn || this.handleSingleVariantDirectAdd();
    }
    applyAvailabilityState(this.button, this.isAvailable, this.tooltipText, disableBtn);
  }
}

customElements.define(SELECTORS.PRODUCT_GROUP.GRID_SMART_INTERACTION, ProductGridSmartInteractionButtonSelector);
import { WWAIBaseProductElement } from './base-product-element.js';
import { SELECTORS } from '../constants/selector-constants.js';

import {
  ADD_TO_CART_HIDDEN_INPUTS,
  ADD_TO_CART_BUTTON_DATA_ATTRS
} from '../constants/elements/add-to-cart-constants.js';

export class ProductCustomAddToCartButtonSelector extends WWAIBaseProductElement {
  constructor() {
    super();
    // Initialize with null
    this.button = null;
    this.addToCartText = null;
    this.soldOutText = null;
    this.variantIdInput = null;
    this.sellingPlanInput = null;
    this.quantityInput = null;
    this.bundleInput = null;
  }

  connectedCallback() {
    // Step 1: Find the form element inside
    this.form = this.querySelector('form');

    if (!this.form) {
      console.error("WWAI-ERROR ❌ No form found inside <product-custom-add-to-cart-button>");
      return;
    }

    // Step 2: Ensure hidden inputs exist
    ADD_TO_CART_HIDDEN_INPUTS.forEach(({ name }) => {
      let input = this.form.querySelector(`input[name="${name}"]`);
      if (!input) {
        // console.warn(`➕ Adding missing hidden input: ${name}`);
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = name === 'quantity' ? '1' : ''; // Default quantity is 1
        this.form.appendChild(input);
      }

      // Cache references for easy access
      if (name === 'id') this.variantIdInput = input;
      if (name === 'selling_plan') this.sellingPlanInput = input;
      if (name === 'quantity') this.quantityInput = input;
      if (name === 'bundle_payload') this.bundleInput = input;
    });

    // Step 3: Locate button and spans
    this.button = this.form.querySelector('button[type="submit"]') || null;
    this.addToCartText = this.button?.querySelector(`[${ADD_TO_CART_BUTTON_DATA_ATTRS.ADD_TO_CART_TEXT}]`) || null;
    this.soldOutText = this.button?.querySelector(`[${ADD_TO_CART_BUTTON_DATA_ATTRS.SOLD_OUT_TEXT}]`) || null;

    if (!this.button) {
      console.error("WWAI-ERROR ❌ No submit button found inside the form.");
      return;
    }
  }

  /**
   * Updates the form with the provided payload
   * @param {Object} payload - Object with keys: variantId, sellingPlanId, available, variantName, sellingPlanName
   */
  updateAddToCartForm(payload) {
    if (!payload) {
      console.error("WWAI-ERROR ❌ No payload provided to updateAddToCartForm");
      return;
    }

    // Update hidden inputs
    if (payload.variantId && this.variantIdInput) {
      this.variantIdInput.value = payload.variantId;
      this.variantIdInput.dataset.title = payload.variantName;
    }

    if (payload.sellingPlanId && this.sellingPlanInput) {
      this.sellingPlanInput.value = payload.sellingPlanId;
      this.sellingPlanInput.dataset.option_name = payload.sellingPlanName;
    } else {
      this.sellingPlanInput.value = "";
      this.sellingPlanInput.dataset.option_name = "";
    }

    if (payload.available !== undefined) {
      if (this.flowConfig.destination === "redirect") {
        console.log("Flow config is destination redirect, so not updating availablity.");
        return;
      }

      this.button.disabled = !payload.available;
      this.button.style.opacity = payload.available ? "1" : "0.5";

      if (this.addToCartText && this.soldOutText) {
        this.addToCartText.style.display = payload.available ? "" : "none";
        this.soldOutText.style.display = payload.available ? "none" : "";
      }
    }
  }

  updateAddToCartFormWithBundlePayload(payload) {
    // Update hidden inputs
    if (payload.add_to_cart_payload && this.bundleInput) {
      this.bundleInput.value = JSON.stringify(payload.add_to_cart_payload);
      this.bundleInput.dataset.title = payload.title;
    }
  }

  updateSellingPlan(sellingPlanId, sellingPlanName = '') {
    if (this.sellingPlanInput) {
      console.log(`🔄 Updating Selling Plan: ${sellingPlanId} (${sellingPlanName})`);
      this.sellingPlanInput.value = sellingPlanId;
      this.sellingPlanInput.dataset.option_name = sellingPlanName;

    } else {
      console.warn("⚠️ Selling Plan input not found. Update aborted.");
    }
  }
}

customElements.define(SELECTORS.PRODUCT_GROUP.ADD_TO_CART, ProductCustomAddToCartButtonSelector);
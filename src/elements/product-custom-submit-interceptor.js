import { WWAIBaseProductElement } from './base-product-element.js';
import { showPopup } from './journey_helpers/show_popup.js';
import { handleCustomAddToCart } from './journey_helpers/add_to_cart_utils.js';
import { SELECTORS } from '../constants/selector-constants.js';
import { getWWAIConfig } from '../wwai_config.js';

export class ProductCustomSubmitInterceptor extends WWAIBaseProductElement {
  constructor() {
    super();
    this.formElement = null;
    this.submitButton = null;
    this.variantInput = null;
    this.sellingPlanInput = null;
    this.quantityInput = null;
    this.deployMode = null;
    this.flowConfig = null;
    this.handlers = {};
  }

  connectedCallback() {
    const deployMode = getWWAIConfig().deployMode;
    this.deployMode = deployMode;

    // Initialize form and inputs
    this.formElement = this.querySelector("form");
    this.submitButton = this.formElement?.querySelector('button[type="submit"]');
    this.variantInput = this.formElement?.querySelector('input[name="id"]');
    this.sellingPlanInput = this.formElement?.querySelector('input[name="selling_plan"]');
    this.bundleInput = this.formElement?.querySelector('input[name="bundle_payload"]');
    this.quantityInput = this.formElement?.querySelector('input[name="quantity"]');

    // Validate presence
    if (!this.formElement || !this.submitButton) {
      console.error("WWAI-ERROR ❌ Missing form or submit button inside <product-custom-submit-interceptor>");
      return;
    }

    // Attach event listener
    this.formElement.addEventListener("submit", (event) => this.handleSubmit(event));
  }

  registerHandler(type, callback) {
    console.log("registerHandler with type: ", type);
      if (!this.handlers[type]) this.handlers[type] = [];
      this.handlers[type].push(callback);
  }

  triggerHandler(type) {
    if (this.handlers && this.handlers[type]){
      (this.handlers[type] || []).forEach(cb => cb());
    }
  }

  itemsToAdd() {
    const variantId = this.variantInput?.value;
    const quantity = Number(this.quantityInput?.value) || 1;
    const sellingPlan = this.sellingPlanInput?.value || null;
    const bundlePayload = this.bundleInput?.value || null;

    const readableTitle = this.variantInput?.dataset.title || "Unknown Product";
    const readableOptionName = this.sellingPlanInput?.dataset.option_name || "One-time purchase";
    const readableQuantity = this.quantityInput?.value || "1"; // Default to 1 if missing

    if (bundlePayload) {
      const parsed = JSON.parse(bundlePayload);
      // Add debug info to each item in the bundle
      return parsed.map(item => ({
        ...item,
        _debug: {
          source: 'bundle',
          variantId: item.id,
          quantity: item.quantity,
          sellingPlan: item.selling_plan || null,
          bundlePayload: true,
          readableString: null
        }
      }));
    }

    if (!variantId) {
        console.error("WWAI-ERROR ❌ No variant selected. Cannot proceed.");
        return [];
    }
    // Normal product case
    const item = {
        id: variantId,
        quantity: quantity
    };

    if (sellingPlan) {
        item.selling_plan = sellingPlan;
    }

    // Add debug info
    item._debug = {
      source: 'single',
      variantId,
      quantity,
      sellingPlan,
      bundlePayload: false,
      readableString: `${readableTitle} - ${readableOptionName} (Qty: ${readableQuantity})`
    };

    return [item];
  }

  validateFlowReady() {
    if (!this.deployMode) {
      showPopup("⚠️ Error: `deploy_mode` is not set!", "error", true);
      return false;
    }
    if (!this.flowConfig) {
      showPopup("⚠️ Error: Flow Config is not initialized!", "error", true);
      return false;
    }
    return true;
  }  

  /* Centralized Form Submission Handler */
  handleSubmit(event) {
    if (!this.validateFlowReady()) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    const items = this.itemsToAdd();

    if (items.length === 0) {
      showPopup("⚠️ No items found for submission.", "warning", true);
      return;
    }

    // ✅ Handle according to mode:
    if (this.deployMode === "local") {
      console.log("Running in Local Mode");
      this.handleLocalMode(items);
    } else if (this.deployMode === "sandbox") {
      console.log("Running in Sandbox Mode");
      this.handleSandboxMode(event);
    } else {
      this.proceedWithSubmission(event, this.flowConfig, items);
    }
  }
  
  /* Local Mode Handler */
  handleLocalMode(items) {
    console.info(`[LOCAL] Simulated add-to-cart for items:`, items);
    const title = this.variantInput?.dataset.title || "Unknown Product";
    const optionName = this.sellingPlanInput?.dataset.option_name || "One-time purchase";
    const quantity = this.quantityInput?.value || "1"; // Default to 1 if missing
    showPopup(`🛍️ Simulated add-to-cart for ${items.length} items. ${title} - ${optionName} (Qty: ${quantity})`);
    setTimeout(() => {
      // The submission will not really happen since we set useMock = true in this case inside proceedWithSubmission for handleAddToCart.
      this.proceedWithSubmission(event, this.flowConfig, this.itemsToAdd());
    }, 2000);
  }

  /* Sandbox Mode Handler */
  handleSandboxMode(event) {
    event.preventDefault();
    if (this.sellingPlanInput?.value) {
      const removedPlan = this.sellingPlanInput.value;
      console.warn(`[SANDBOX] Clearing selling_plan_id: ${removedPlan}`);
      showPopup(`Removing Selling Plan: ${removedPlan}`, "warning", true);

      setTimeout(() => {
        this.sellingPlanInput.value = "";
        console.log(`Selling plan removed: ${removedPlan}`);
        this.proceedWithSubmission(event, this.flowConfig, this.itemsToAdd());
      }, 2000);
    }
    else {
      this.proceedWithSubmission(event, this.flowConfig, this.itemsToAdd());
    }
  }

  /* Proceed with Submission */
  async proceedWithSubmission(originalEvent, flowConfig, items) {
    if (originalEvent) {
      originalEvent.preventDefault();
    }

    // Instead of this.triggerHandler, use  (type) => this.triggerHandler(type), so `this` context can be correctly resolved 
    // inside this.triggerHandler function. 
    // Arrow functions don't create their own this, so they use the enclosing scope's this correctly.
    let triggerHandlerFnToPass = (type) => this.triggerHandler(type);
    let useMock = this.deployMode === "local";

    await handleCustomAddToCart(
      items,
      flowConfig, 
      this.sectionId, 
      this.productGroup, 
      useMock,
      triggerHandlerFnToPass
    );
  }
}

customElements.define(SELECTORS.PRODUCT_GROUP.SUBMIT_INTERCEPTOR, ProductCustomSubmitInterceptor);
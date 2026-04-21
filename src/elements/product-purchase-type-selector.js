import { WWAIBaseProductElement } from './base-product-element.js';
import {
  PURCHASE_TYPE_ATTR,
  PURCHASE_TYPE_VALUES
} from '../constants/elements/purchase-type-selector-constants.js';
import { updateSellingPlanAndPriceBasedOnPurchaseType } from '../product_group/input_update_utils/purchase_type_update_utils.js';
import { SELECTORS } from '../constants/selector-constants.js';

export class ProductPurchaseTypeSelector extends WWAIBaseProductElement {
  constructor() {
    super();
    this.subscriptionInput = null;
    this.onetimeInput = null;
    this.pricesDict = null;
  }

  connectedCallback() {
    if (!this.sectionId || !this.productGroup) {
      console.warn(`⚠️ <product-purchase-type-selector> missing attributes — sectionId: ${this.sectionId}, productGroup: ${this.productGroup}`);
      return;
    }

    const allInputs = this.querySelectorAll(`input[type="radio"][${PURCHASE_TYPE_ATTR}]`);
    allInputs.forEach(input => {
      const value = input.getAttribute(PURCHASE_TYPE_ATTR);
      if (value === PURCHASE_TYPE_VALUES.SUBSCRIPTION) this.subscriptionInput = input;
      else if (value === PURCHASE_TYPE_VALUES.ONETIME) this.onetimeInput = input;
    });

    if (!this.subscriptionInput || !this.onetimeInput) {
      console.error("WWAI-ERROR ❌ Missing both purchase type radio inputs");
      return;
    }

    if (this.subscriptionInput.name !== this.onetimeInput.name) {
      console.error("WWAI-ERROR ❌ Purchase type radios must have the same name");
      return;
    }

    this.ensureAutocompleteOff();

    this.subscriptionInput.addEventListener('change', () => {
      if (this.subscriptionInput.checked) {
        this.onetimeInput.checked = false;
        this.handlePurchaseTypeChange(PURCHASE_TYPE_VALUES.SUBSCRIPTION);
      }
    });

    this.onetimeInput.addEventListener('change', () => {
      if (this.onetimeInput.checked) {
        this.subscriptionInput.checked = false;
        this.handlePurchaseTypeChange(PURCHASE_TYPE_VALUES.ONETIME);
      }
    });
  }

  cachePrices(pricesDict) {
    this.pricesDict = pricesDict;
  }

  getSelectedPurchaseType() {
    if (this.subscriptionInput?.checked) {
      return { purchaseType: PURCHASE_TYPE_VALUES.SUBSCRIPTION };
    } else if (this.onetimeInput?.checked) {
      return { purchaseType: PURCHASE_TYPE_VALUES.ONETIME };
    } else {
      return { purchaseType: PURCHASE_TYPE_VALUES.ONETIME }; // fallback
    }
  }

  /**
   * Programmatically sets the purchase type
   * @param {'onetime'|'subscription'} type
   */
  setPurchaseType(type) {
    if (type === PURCHASE_TYPE_VALUES.SUBSCRIPTION) {
      this.subscriptionInput.checked = true;
      this.onetimeInput.checked = false;
    } else {
      this.subscriptionInput.checked = false;
      this.onetimeInput.checked = true;
    }
  }

  handlePurchaseTypeChange(type) {
    console.log(`🔄 Purchase type changed to: ${type}`);
    updateSellingPlanAndPriceBasedOnPurchaseType({
      sectionId: this.sectionId,
      productGroup: this.productGroup,
      purchaseType: type,
      pricesDict: this.pricesDict
    });
  }

  ensureAutocompleteOff() {
    [this.subscriptionInput, this.onetimeInput].forEach(input => {
      if (!input.hasAttribute("autocomplete")) {
        input.setAttribute("autocomplete", "off");
      }
    });
  }
}

customElements.define(SELECTORS.PRODUCT_GROUP.PURCHASE_TYPE, ProductPurchaseTypeSelector);
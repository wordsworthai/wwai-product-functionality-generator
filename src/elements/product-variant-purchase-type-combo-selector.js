import {
  COMBO_ATTR_PRODUCT_LABEL,
  COMBO_ATTR_VARIANT_LABEL,
  COMBO_ATTR_VARIANT_OPTION_TYPE,
  COMBO_ATTR_VARIANT_LABEL_LEVEL,
  COMBO_ATTR_PURCHASE_TYPE,
  COMBO_EVENT_TYPES,
  COMBO_VARIANT_OPTION_TYPE_VALUES,
  COMBO_PURCHASE_TYPE_VALUES
} from '../constants/elements/variant-purchase-type-combo-selector-constants.js';
import { WWAIBaseProductElement } from './base-product-element.js';
import { reinitializeProductGroupOnVariantChangeFlatVariantAndSubscription } from '../product_group/input_update_utils/variant_subscription_combo_update_utils.js';
import { disableAutocompleteOnInputs } from '../utils/element-selector-utils/element-utils.js';
import { SELECTORS } from '../constants/selector-constants.js';

import {
  selectProductRadio,
  buildVariantMapForProduct,
  validateRequiredVariantLevels,
  applyVariantSelections
} from '../utils/element-selector-utils/product-variant-selector-utils';


export class ProductVariantPurchaseTypeComboSelector extends WWAIBaseProductElement {
  constructor() {
    super();
    this.inputs = [];
    this.handlers = {};
    this.scope = this.getAttribute('wwai-scope') || null;
    this.product_helper_handle = this.getAttribute('product-helper-handle') || null;
    this.debounceTimer = null;
  }

  connectedCallback() {
    this.initInputs();
    this.bindEvents();
    this.ensureAutocompleteOff();
  }

  initInputs() {
    this.inputs = this.querySelectorAll('input[type="radio"]');
  }

  bindEvents() {
    const handleChange = this.debouncedComboSelection.bind(this);
    this.inputs.forEach(input => {
      input.addEventListener('change', handleChange);
      input.addEventListener('click', handleChange); // support re-selects
    });
  }

  ensureAutocompleteOff() {
    disableAutocompleteOnInputs(this.inputs);
  }

  debouncedComboSelection() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.handleComboSelection();
    }, 10); // Small delay to prevent double triggers
  }

  handleComboSelection() {
    console.log('🔍 Combo Selection Triggered');
    const selectedCombo = this.getSelectedCombo();
    // Calling set selected combo will also unselect other purchase type radios, even the hidden ones.
    this.setSelectedCombo(selectedCombo);
    
    // Reinitialize the product group on variant change, this correctly updates the add to cart buttons.
    reinitializeProductGroupOnVariantChangeFlatVariantAndSubscription(
      this.sectionId, 
      this.productGroup, 
      selectedCombo.productLabel, 
      selectedCombo.variantOptions,
      selectedCombo.purchaseType
    );
    this.triggerHandler(COMBO_EVENT_TYPES.COMBO_CHANGE, selectedCombo);
    return;
  }

  registerHandler(type, callback) {
    if (!type || typeof callback !== 'function') return;
    this.handlers[type] = this.handlers[type] || [];
    this.handlers[type].push(callback);
  }

  triggerHandler(type, payload) {
    const callbacks = this.handlers?.[type] || [];
    callbacks.forEach(cb => {
      try {
        cb(payload);
      } catch (err) {
        console.error(`WWAI ❌ Error in handler for type "${type}":`, err);
      }
    });
  }

  getProductRadiosForPurchaseType(purchaseType) {
    const productInputs = [...this.inputs].filter(input =>
      input.getAttribute(COMBO_ATTR_VARIANT_OPTION_TYPE) === COMBO_VARIANT_OPTION_TYPE_VALUES.PRODUCT &&
      input.getAttribute(COMBO_ATTR_PURCHASE_TYPE) === purchaseType
    );
    return productInputs;
  }
  
  getVariantRadiosForPurchaseType(purchaseType) {
    const variantInputs = [...this.inputs].filter(input =>
      input.getAttribute(COMBO_ATTR_VARIANT_OPTION_TYPE) === COMBO_VARIANT_OPTION_TYPE_VALUES.PRODUCT_VARIANT &&
      input.getAttribute(COMBO_ATTR_PURCHASE_TYPE) === purchaseType
    );
    return variantInputs;
  }


  getSelectedCombo() {
    const productInput = [...this.inputs].find(input =>
      input.checked &&
      input.getAttribute(COMBO_ATTR_VARIANT_OPTION_TYPE) === COMBO_VARIANT_OPTION_TYPE_VALUES.PRODUCT
    );
  
    if (!productInput) return null;
  
    const productLabel = productInput.getAttribute(COMBO_ATTR_PRODUCT_LABEL);
    const purchaseType = productInput.getAttribute(COMBO_ATTR_PURCHASE_TYPE);
  
    const matchingVariantInputs = [...this.inputs].filter(input =>
      input.getAttribute(COMBO_ATTR_VARIANT_OPTION_TYPE) === COMBO_VARIANT_OPTION_TYPE_VALUES.PRODUCT_VARIANT &&
      input.getAttribute(COMBO_ATTR_PRODUCT_LABEL) === productLabel &&
      input.getAttribute(COMBO_ATTR_PURCHASE_TYPE) === purchaseType
    );
    
    // Generate options dictionary from all matching inputs
    const options = {};
    matchingVariantInputs.forEach(input => {
      const optionKey = input.getAttribute(COMBO_ATTR_VARIANT_LABEL_LEVEL);
      const optionValue = input.getAttribute(COMBO_ATTR_VARIANT_LABEL);
      if (optionKey && optionValue) {
        options[optionKey] = optionValue;
      }
    });
  
    return {
      productLabel,
      variantOptions: options,
      purchaseType: purchaseType
    };
  }

  setSelectedCombo({ productLabel, variantOptions, purchaseType }) {
    const productRadios = this.getProductRadiosForPurchaseType(purchaseType);
    const variantRadios = this.getVariantRadiosForPurchaseType(purchaseType);

    if (!productRadios.length) {
      console.warn(`⚠️ No product radio inputs found in <product-variant-purchase-type-combo-selector> [${this.sectionId}].`);
      return false;
    }

    const productFound = selectProductRadio(productRadios, productLabel, this.sectionId);
    if (!productFound) {
      console.warn(`⚠️ Required product not found in <product-variant-purchase-type-combo-selector> [${this.sectionId}].`);
      return false;
    };

    const variantMap = buildVariantMapForProduct(variantRadios, productLabel);
    const requiredLevelsPresent = validateRequiredVariantLevels(
      productLabel, 
      variantMap, 
      variantOptions
    );
    
    if (!requiredLevelsPresent) {
      console.warn(`⚠️ Required variant levels not present in <product-variant-purchase-type-combo-selector> [${this.sectionId}].`);
      return false;
    }

    const foundAll = applyVariantSelections(variantRadios, productLabel, variantOptions);
    
    // Uncheck radios for other purchase types.
    const otherPurchaseType = purchaseType == COMBO_PURCHASE_TYPE_VALUES.SUBSCRIPTION ? COMBO_PURCHASE_TYPE_VALUES.ONE_TIME : COMBO_PURCHASE_TYPE_VALUES.SUBSCRIPTION;
    const otherProductRadios = this.getProductRadiosForPurchaseType(otherPurchaseType);
    const otherVariantRadios = this.getVariantRadiosForPurchaseType(otherPurchaseType);
    otherProductRadios.forEach(radio => {
      radio.checked = false;
    });
    otherVariantRadios.forEach(radio => {
      radio.checked = false;
    });

    return requiredLevelsPresent && foundAll;
  }
}

customElements.define(SELECTORS.PRODUCT_GROUP.VARIANT_PURCHASE_TYPE_COMBO, ProductVariantPurchaseTypeComboSelector);
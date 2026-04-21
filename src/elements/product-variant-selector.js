import { disableAutocompleteOnInputs } from '../utils/element-selector-utils/element-utils.js';
import { WWAIBaseProductElement } from './base-product-element.js';

import {
  getCheckedInputs,
  getProductLabelFromInputs,
  buildVariantOptionsFromInputs,
  selectProductRadio,
  buildVariantMapForProduct,
  validateRequiredVariantLevels,
  applyVariantSelections
} from '../utils/element-selector-utils/product-variant-selector-utils';

import { handleVariantUXConfig} from './variant_helpers/utils.js';
import {reinitializeProductGroupOnVariantChange} from '../product_group/input_update_utils/variant_update_utils.js';
import {
  VARIANT_ATTR_OPTION_TYPE, 
  VARIANT_OPTION_TYPE_VALUES, 
  VARIANT_ATTR_PRODUCT_LABEL,
  VARIANT_ATTR_VARIANT_LABEL
} from '../constants/elements/variant-selector-constants.js';
import { SELECTORS } from '../constants/selector-constants.js';

export class ProductVariantSelector extends WWAIBaseProductElement {
    constructor() {
      super();
      this.scope = this.getAttribute('wwai-scope') || null;
      this.product_helper_handle = this.getAttribute('product-helper-handle') || null;
      this.handlers = {};
      this.uxConfig = null;
      this.inputs = null;
    }

    connectedCallback() {
      this.initInputs();
      this.bindEvents();
      this.ensureAutocompleteOff();
    }
    
    getProductRadios() {
      return this.querySelectorAll(
        `input[type="radio"][${VARIANT_ATTR_OPTION_TYPE}="${VARIANT_OPTION_TYPE_VALUES.PRODUCT}"]`
      );
    }
    
    getVariantRadios() {
      return this.querySelectorAll(
        `input[type="radio"][${VARIANT_ATTR_OPTION_TYPE}="${VARIANT_OPTION_TYPE_VALUES.PRODUCT_VARIANT}"]`
      );
    }

    initInputs() {
      this.inputs = this.querySelectorAll('input[type="radio"]');
    }

    ensureAutocompleteOff() {
      /** ✅ Prevent browser autocomplete from affecting radio inputs */
      disableAutocompleteOnInputs(this.inputs);
    }

    applyVariantUXConfig() {
      if (!this.uxConfig || !this.uxConfig.variantUXConfig) return;
    
      handleVariantUXConfig({
        rootElement: this,
        variantRadios: this.getVariantRadios(),
        inputs: this.inputs,
        sectionId: this.sectionId,
        productGroup: this.productGroup,
        uxConfig: this.uxConfig.variantUXConfig
      });
    }

    selectFirstVariantForProduct(productLabel) {
      // The product option was changed, and for the product, we dont have a selected variant.
      for (let input of this.inputs) {
        if (input.getAttribute(VARIANT_ATTR_PRODUCT_LABEL) === productLabel && 
            input.getAttribute(VARIANT_ATTR_OPTION_TYPE) === VARIANT_OPTION_TYPE_VALUES.PRODUCT_VARIANT) {
          console.log("🔄 Pre selected variant not found, setting first variant as selected.", input);
          input.checked = true;
          break; // Exit the loop after checking one input
        }
      }
    }

    /* Public Method to Initialize UI Config from Product Group Init */
    initUXConfig(config) {
      super.initUXConfig(config);
      this.applyVariantUXConfig();
    }
    
    handleVariantUpdate() {
      // ✅ Debounce to prevent duplicate execution on rapid "change" + "click"
      // This ensures the variant update logic runs only once per interaction frame.
      clearTimeout(this._debounceTimeout);
      this._debounceTimeout = setTimeout(() => {
        const { productLabel, variantOptions } = this.getSelectedVariant();
        if (!productLabel || !variantOptions) return;
    
        const variant = { productLabel, variantOptions };
    
        console.group(`[WWAI] 🔄 Variant Change Detected`);
        console.log("🛒 Product Label:", productLabel);
        console.log("🎯 Variant Options:", variantOptions);
        console.groupEnd();
    
        console.log("🔁 Trigger handler on change or re-click");
        this.triggerHandler('variantChange', variant);
    
        if (
          this.uxConfig &&
          this.uxConfig.variantUXConfig &&
          this.uxConfig.variantUXConfig.refreshUxOnVariantChange === false
        ) {
          console.log("🔄 Refresh UX on variant change is disabled. Skipping reinitialization.");
          return;
        }
    
        reinitializeProductGroupOnVariantChange(this.sectionId, this.productGroup, productLabel, variantOptions);
      }, 0);
    }
    
    bindEvents() {
      const handleVariantUpdate = this.handleVariantUpdate.bind(this);
      this.inputs.forEach(input => {
        input.addEventListener('change', handleVariantUpdate);
        input.addEventListener('click', handleVariantUpdate); // ✅ Handle re-clicks
      });
    }
    
    registerHandler(type, callback) {
      if (!type || typeof callback !== 'function') {
        console.warn('⚠️ Invalid handler registration:', { type, callback });
        return;
      }
    
      this.handlers[type] = this.handlers[type] || [];
      this.handlers[type].push(callback);
      console.log(`✅ Handler registered for type: ${type}`, callback);
    }
    
    triggerHandler(type, payload) {
      const callbacks = this.handlers?.[type] || [];
      if (!callbacks.length) return;
    
      console.log(`▶️ Running ${callbacks.length} handler(s) for type: ${type}`, callbacks);
      callbacks.forEach(cb => {
        try {
          cb(payload);
        } catch (err) {
          console.error(`WWAI-ERROR ❌ Error in handler for type "${type}":`, err);
        }
      });
    }

    getSelectedVariant() {
      let selectedInputs = getCheckedInputs(this.inputs);
      const productLabel = getProductLabelFromInputs(selectedInputs);      

      if (!productLabel) {
        console.warn(`⚠️ No selected product label found in <product-variant-selector> [${this.sectionId}].`);
        return null;
      }

      // Filter inputs, where the product label is the same as the selected product label.  
      let filteredInputsWithSelectedProduct = selectedInputs.filter(input => 
        input.getAttribute(VARIANT_ATTR_PRODUCT_LABEL) === productLabel
      );
        
      let hasPreSelectedVariant = false;
      filteredInputsWithSelectedProduct.forEach(input => {
        if (input.getAttribute(VARIANT_ATTR_VARIANT_LABEL)) {
          hasPreSelectedVariant = true;
        }
      });

      if (!hasPreSelectedVariant) {
        this.selectFirstVariantForProduct(productLabel);
        selectedInputs = getCheckedInputs(this.inputs);
        filteredInputsWithSelectedProduct = selectedInputs.filter(input => 
          input.getAttribute(VARIANT_ATTR_PRODUCT_LABEL) === productLabel
        );
      }

      const variantOptions = buildVariantOptionsFromInputs(
        filteredInputsWithSelectedProduct, 
        productLabel
      );
      return {
        productLabel,
        variantOptions
      };  
    }

    setSelectedProductAndOptions(productLabel, optionsObject = {}) {
      const productRadios = this.getProductRadios();

      if (!productRadios.length) {
        console.warn(`⚠️ No product radio inputs found in <product-variant-selector> [${this.sectionId}].`);
        return false;
      }

      const productFound = selectProductRadio(productRadios, productLabel, this.sectionId);
      if (!productFound) return false;

      const variantRadios = this.getVariantRadios();

      const variantMap = buildVariantMapForProduct(variantRadios, productLabel);
      const requiredLevelsPresent = validateRequiredVariantLevels(productLabel, variantMap, optionsObject);

      // 🧼 Apply UX config logic separately
      this.applyVariantUXConfig();

      const foundAll = applyVariantSelections(variantRadios, productLabel, optionsObject);

      if (window.customProductEventLoggingEnabled) {
        console.log(`✅ Set product: "${productLabel}", selected options:`, optionsObject);
      }

      return requiredLevelsPresent && foundAll;
    }
}

customElements.define(SELECTORS.PRODUCT_GROUP.VARIANT, ProductVariantSelector);
import {
    SETS_ATTR_SET,
    SETS_ATTR_SET_TAB,
    SETS_ATTR_PRODUCT_LABEL,
    SETS_ATTR_VARIANT_LABEL,
    SETS_ATTR_VARIANT_LABEL_LEVEL,
    SETS_ATTR_VARIANT_OPTION_TYPE,
    SETS_VARIANT_OPTION_TYPE_VALUES,
    SETS_EVENT_TYPES
  } from '../constants/elements/variant-selector-with-sets-constants.js';

import { SELECTORS } from '../constants/selector-constants.js';
import { WWAIBaseProductElement } from './base-product-element.js';

export class ProductVariantSelectorWithSets extends WWAIBaseProductElement {
    constructor() {
      super();
      this.allInputs = [];
      this.setTabs = [];
      this.activeSet = null;
      this.handlers = {};
      this.debounceTimer = null;
    }
  
    connectedCallback() {
      this.init();
    }
  
    init() {
      this.allInputs = [...this.querySelectorAll(`input[type="radio"]:not([${SETS_ATTR_SET_TAB}])`)];
      this.setTabs = [...this.querySelectorAll(`[${SETS_ATTR_SET_TAB}]`)];
      this.bindSetTabs();
      this.activateSet(this.setTabs[1]?.getAttribute(SETS_ATTR_SET_TAB)); // default to first
    }
  
    bindSetTabs() {
      this.setTabs.forEach(tab => {
        const setName = tab.getAttribute(SETS_ATTR_SET_TAB);
        tab.addEventListener('click', () => {
          this.activateSet(setName);
        });
      });
    }
  
    activateSet(setName) {
      this.activeSet = setName;
  
      // Set checked property on tabs
      this.setTabs.forEach(tab => {
        tab.checked = tab.getAttribute(SETS_ATTR_SET_TAB) === setName;
      });
      
      console.log('🔍 Activating Set:', setName);
      console.log('🔍 Active Set:', this.activeSet);
      console.log('🔍 Set Tabs:', this.setTabs);
      console.log('🔍 Set Tabs Checked:', this.setTabs.map(tab => tab.checked));
      // Show/hide variant inputs based on set
      this.bindInputEvents();
    }
  
    bindInputEvents() {
      console.log('🔍 Binding Input Events');
      console.log('🔍 All Inputs:', this.allInputs);
      this.allInputs.forEach(input => {
        input.removeEventListener('change', this.handleVariantChangeBound);
        input.removeEventListener('click', this.handleVariantChangeBound);
      });
  
      this.handleVariantChangeBound = this.handleVariantChange.bind(this);
      const visibleInputs = this.getActiveInputs();
      visibleInputs.forEach(input => {
        input.addEventListener('change', this.handleVariantChangeBound);
        input.addEventListener('click', this.handleVariantChangeBound);
      });
    }
  
    getActiveInputs() {
      return this.allInputs.filter(input => input.getAttribute(SETS_ATTR_SET) === this.activeSet);
    }
  
    handleVariantChange() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
        const productInput = [...this.getActiveInputs()].find(input =>
            input.checked &&
            input.getAttribute(SETS_ATTR_VARIANT_OPTION_TYPE) === SETS_VARIANT_OPTION_TYPE_VALUES.PRODUCT
        );
        console.log('🔍 Product Input:', productInput);
        
        if (!productInput) return null;
        
        const productLabel = productInput.getAttribute(SETS_ATTR_PRODUCT_LABEL);
        
        const matchingVariantInput = [...this.getActiveInputs()].find(input =>
          input.getAttribute(SETS_ATTR_VARIANT_OPTION_TYPE) === SETS_VARIANT_OPTION_TYPE_VALUES.PRODUCT_VARIANT &&
          input.getAttribute(SETS_ATTR_PRODUCT_LABEL) === productLabel &&
          input.checked
        );
        const variantLabel = matchingVariantInput?.getAttribute(SETS_ATTR_VARIANT_LABEL) || null;
        const variantLevel = matchingVariantInput?.getAttribute(SETS_ATTR_VARIANT_LABEL_LEVEL) || null;

        const payload = {
            productLabel: productLabel,
            variantLabel: variantLabel,
            variantLabelLevel: variantLevel,
            setName: this.activeSet,
        };
        console.group('[WWAI] 🧠 Variant Change Triggered');
        console.log('🔍 Product Label:', payload.productLabel);
        console.log('🏷️ Variant Label:', payload.variantLabel);
        console.log('🔢 Variant Level:', payload.variantLabelLevel);
        console.log('🔢 Set Name:', payload.setName);
        console.groupEnd();   
        this.triggerHandler(SETS_EVENT_TYPES.VARIANT_CHANGE, payload);
        }, 10); // Small delay to prevent double triggers
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
          console.error(`WWAI ❌ Handler error for type "${type}"`, err);
        }
      });
    }
  }
  
  customElements.define(SELECTORS.PRODUCT_GROUP.VARIANT_SELECTOR_WITH_SETS, ProductVariantSelectorWithSets);
  
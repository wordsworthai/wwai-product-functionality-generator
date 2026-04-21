import { WWAIBaseProductElement } from './base-product-element.js';
import {
  PRICE_LABEL_ATTR,
  PRICE_DATA_ATTRS,
  PRICE_WRAPPER_ATTRS
} from '../constants/elements/price-selector-constants.js';
import { SELECTORS } from '../constants/selector-constants.js';

export class ProductCustomPriceSelector extends WWAIBaseProductElement {
  connectedCallback() {
    this.pricingConfig = null;
    // Register all present price labels
    this.availableLabels = new Set();
    this.querySelectorAll('[data-wwai-product-price-label]').forEach(el => {
      this.availableLabels.add(el.getAttribute('data-wwai-product-price-label'));
    });
  }

  findWrapper(element, attribute, max_depth = 3) {
    let currentNode = element.parentElement;
    for (let i = 0; i < max_depth; i++) {
      if (!currentNode) break;
      if (currentNode.hasAttribute(attribute)) {
        return currentNode;
      }
      currentNode = currentNode.parentElement;
    }
    return null;
  }

  updatePrices({ price, compareAtPrice, discount_percent, savings = null }, label) {
    let roundDiscount = true;
    let showOffSuffix = true;

    if (this.pricingConfig && this.pricingConfig.roundDiscount != undefined) {
      roundDiscount = this.pricingConfig.roundDiscount;
    }
    if (this.pricingConfig && this.pricingConfig.addOffSuffixToDiscount != undefined) {
      showOffSuffix = this.pricingConfig.addOffSuffixToDiscount;
    }

    const elements = this.querySelectorAll(`[${PRICE_LABEL_ATTR}="${label}"]`);
    
    // if (!elements.length) {
    //   console.error(
    //     `WWAI-ERROR ❌ No elements found with ${PRICE_LABEL_ATTR}="${label}" inside <product-custom-price-selector> ` +
    //     `(section: ${this.sectionId}, group: ${this.productGroup}).\n` +
    //     `Found labels: ${Array.from(this.availableLabels).join(', ')}`
    //   );
    //   return;
    // }
  
    const showDiscount = price != compareAtPrice;
    const discountPercentNumber = Number(discount_percent);
  
    elements.forEach((el) => {
      if (el.hasAttribute(PRICE_DATA_ATTRS.BEFORE)) {
        el.textContent = showDiscount ? compareAtPrice : '';
        el.setAttribute('data-wwai-slash-pricing-before-tag', showDiscount ? 'true' : 'false');
      }
  
      if (el.hasAttribute(PRICE_DATA_ATTRS.AFTER)) {
        el.textContent = price;
        el.setAttribute('data-wwai-slash-pricing-after-tag', showDiscount ? 'true' : 'false');
      }
  
      const beforeWrapper = this.findWrapper(el, PRICE_WRAPPER_ATTRS.BEFORE);
      if (beforeWrapper) {
        beforeWrapper.style.display = showDiscount ? '' : 'none';
      }
  
      const discountWrapper = this.findWrapper(el, PRICE_WRAPPER_ATTRS.DISCOUNT);
      if (discountWrapper) {
        discountWrapper.style.display = showDiscount ? '' : 'none';
      }

      if (savings) { 
        if (el.hasAttribute(PRICE_DATA_ATTRS.SAVINGS)) {
          el.textContent = savings;
        }
        const savingsWrapper = this.findWrapper(el, PRICE_WRAPPER_ATTRS.SAVINGS);
        if (savingsWrapper) {
          savingsWrapper.style.display = showDiscount ? '' : 'none';
        }
      }
      
      if (el.hasAttribute(PRICE_DATA_ATTRS.DISCOUNT)) {
        if (isNaN(discountPercentNumber)) {
          console.error("WWAI-ERROR ❌ Invalid discount_percent received:", discount_percent);
          return;
        }
  
        let displayDiscount = roundDiscount
          ? Math.round(discountPercentNumber)
          : discountPercentNumber;
  
        let formattedDiscount = `${displayDiscount}%${showOffSuffix ? ' OFF' : ''}`;
        const originalText = el.textContent.trim();
  
        if (showDiscount) {
          if (originalText.includes("(")) {
            el.textContent = originalText.replace(/\(\d+(\.\d+)?%\)/, `(${formattedDiscount})`);
          } else {
            el.textContent = formattedDiscount;
          }
        } else {
          el.textContent = '';
        }
      }
    });
  }
}

customElements.define(SELECTORS.PRODUCT_GROUP.PRICE, ProductCustomPriceSelector);
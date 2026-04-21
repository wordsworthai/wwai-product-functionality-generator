import { WWAIBaseProductElement } from './base-product-element.js';
import { SELECTORS } from '../constants/selector-constants.js';
import { VARIANT_TITLE_ATTR } from '../constants/elements/variant-title-constants.js';

export class ProductCustomTitleSelector extends WWAIBaseProductElement {
  constructor() {
    super();
  }
  
  connectedCallback() {
  }

  updateTitle(title) {
    this.querySelectorAll(`[${VARIANT_TITLE_ATTR}]`).forEach(el => {
      el.textContent = title;
    });
  }
}

customElements.define(SELECTORS.PRODUCT_GROUP.TITLE, ProductCustomTitleSelector);
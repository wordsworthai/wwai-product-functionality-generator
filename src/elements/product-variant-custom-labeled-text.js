import { WWAIBaseProductElement } from './base-product-element.js';
import {
  VARIANT_CUSTOM_LABEL_TEXT_ATTR,
  VARIANT_CUSTOM_LABEL_VALUE_ATTR,
} from '../constants/elements/variant-custom-label-constants.js';
import { SELECTORS } from '../constants/selector-constants.js';

export class ProductVariantCustomLabeledText extends WWAIBaseProductElement {
  connectedCallback() {
  }

  /* Updates the custom label text for variant options. */
  updateCustomLabels(labelData) {
    if (typeof labelData !== 'object' || !labelData) {
      console.error('WWAI-ERROR ❌ Invalid label data received:', labelData);
      return;
    }

    // Query all elements with the variant custom label selector
    const elements = this.querySelectorAll(`[${VARIANT_CUSTOM_LABEL_TEXT_ATTR}]`);

    if (!elements.length) {
      console.warn(`⚠️ No elements found with ${VARIANT_CUSTOM_LABEL_TEXT_ATTR} inside <product-variant-custom-labeled-text> (section: ${this.sectionId}, group: ${this.productGroup})`);
      return;
    }

    // Loop through elements and update their text content
    elements.forEach((el) => {
      const labelType = el.getAttribute(VARIANT_CUSTOM_LABEL_VALUE_ATTR);
      const newText = labelData[labelType];

      if (newText) {
        el.textContent = newText;
        console.log(`✅ Updated label for ${labelType}:`, newText);
      } else {
        console.warn(`⚠️ No label found for type: ${labelType} in labelData`);
      }
    });
  }
}

customElements.define(SELECTORS.PRODUCT_GROUP.VARIANT_CUSTOM_LABEL, ProductVariantCustomLabeledText);
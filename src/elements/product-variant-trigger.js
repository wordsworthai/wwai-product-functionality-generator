import { SELECTORS } from '../constants/selector-constants.js';
import { getUniqueElementForSelectorInGroup } from "../product_group/registry-utils.js";

import { 
    VARIANT_TRIGGER_PRODUCT_LABEL_ATTR, 
    VARIANT_TRIGGER_VARIANT_OPTION1_LABEL_ATTR, 
    VARIANT_TRIGGER_VARIANT_OPTION2_LABEL_ATTR, 
    VARIANT_TRIGGER_VARIANT_OPTION3_LABEL_ATTR 
} from '../constants/elements/variant-trigger.js';

export class ProductVariantTrigger extends HTMLElement {
  constructor() {
    super();
    this.sectionId = this.getAttribute('section_id');
    this.productGroup = this.getAttribute('product_group');
  }

  connectedCallback() {
    this.attachLinkListeners();
  }

  triggerVariantChange(productLabel, options) {
    const variantSelector = getUniqueElementForSelectorInGroup(
      this.sectionId,
      this.productGroup,
      SELECTORS.PRODUCT_GROUP.VARIANT
    );
    if (variantSelector) {
      variantSelector.setSelectedProductAndOptions(productLabel, options);
      variantSelector.handleVariantUpdate();
    } else {
      console.warn('⚠️ No variant selector found for section/group:', this.sectionId, this.productGroup);
    }
  }

  attachLinkListeners() {
    const links = Array.from(this.querySelectorAll('a'));
    const filteredLinks = links.filter(link => {
      const hasProductLabel = link.hasAttribute(VARIANT_TRIGGER_PRODUCT_LABEL_ATTR);
      const hasOption1 = link.hasAttribute(VARIANT_TRIGGER_VARIANT_OPTION1_LABEL_ATTR);
      const hasOption2 = link.hasAttribute(VARIANT_TRIGGER_VARIANT_OPTION2_LABEL_ATTR);
      const hasOption3 = link.hasAttribute(VARIANT_TRIGGER_VARIANT_OPTION3_LABEL_ATTR);
      // Must have product label and at least one option label
      return hasProductLabel && (hasOption1 || hasOption2 || hasOption3);
    });

    filteredLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();

        const productLabel = link.getAttribute(VARIANT_TRIGGER_PRODUCT_LABEL_ATTR);
        const option1 = link.getAttribute(VARIANT_TRIGGER_VARIANT_OPTION1_LABEL_ATTR);
        const option2 = link.getAttribute(VARIANT_TRIGGER_VARIANT_OPTION2_LABEL_ATTR);
        const option3 = link.getAttribute(VARIANT_TRIGGER_VARIANT_OPTION3_LABEL_ATTR);

        // Build options dict
        const options = {};
        if (option1 !== null) options.option1 = option1;
        if (option2 !== null) options.option2 = option2;
        if (option3 !== null) options.option3 = option3;

        console.log("🔁 Triggering variant change:", { productLabel, options });

        this.triggerVariantChange(productLabel, options);
      });
    });
  }
}

customElements.define(SELECTORS.PRODUCT_GROUP.VARIANT_TRIGGER, ProductVariantTrigger);
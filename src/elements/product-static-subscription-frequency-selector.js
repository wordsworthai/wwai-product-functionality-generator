import { ProductSubscriptionFrequencySelector } from './product-subscription-frequency-selector.js';
import { SELECTORS } from '../constants/selector-constants.js';
import { 
  VARIANT_TRIGGER_PRODUCT_LABEL_ATTR, 
  VARIANT_TRIGGER_VARIANT_OPTION1_LABEL_ATTR, 
  VARIANT_TRIGGER_VARIANT_OPTION2_LABEL_ATTR, 
  VARIANT_TRIGGER_VARIANT_OPTION3_LABEL_ATTR 
} from '../constants/elements/variant-trigger.js';

export class ProductStaticSubscriptionFrequencySelector extends ProductSubscriptionFrequencySelector {
  constructor() {
    super();
    this.productLabel = null;
    this.variantOptions = null;
  }

  getElementName() {
    return "static subscription frequency selector"
  }

  connectedCallback() {
    super.connectedCallback();
    this.init();
  }

  init() {
    this.productLabel = this.getAttribute(`${VARIANT_TRIGGER_PRODUCT_LABEL_ATTR}`);
    this.variantOptions = this.getDefinedVariantOptions();

    if (!this.productLabel || !this.variantOptions || Object.keys(this.variantOptions).length === 0) {
      console.warn(`WWAI ⚠️ Missing productLabel or variantOptions on <product-static-subscription-frequency-selector>.`);
      return;
    }

    console.log('🔍 Static Subscription Frequency Selector Initialized:', {
      productLabel: this.productLabel,
      variantOptions: this.variantOptions
    });
  }

  getDefinedVariantOptions() {
    const option1 = this.getAttribute(VARIANT_TRIGGER_VARIANT_OPTION1_LABEL_ATTR);
    const option2 = this.getAttribute(VARIANT_TRIGGER_VARIANT_OPTION2_LABEL_ATTR);
    const option3 = this.getAttribute(VARIANT_TRIGGER_VARIANT_OPTION3_LABEL_ATTR);

    const options = {};

    if (option1) {
      options.option1 = option1;
    }

    if (option2) {
      options.option2 = option2;
    }

    if (option3) {
      options.option3 = option3;
    }

    console.log('🔍 Defined Variant Options:', {
      option1: option1 || 'undefined',
      option2: option2 || 'undefined', 
      option3: option3 || 'undefined',
      result: options
    });

    return options;
  }

  handleSubscriptionPlanChange(plan) {
    console.log('🔍 To be Implemented: Static Subscription Frequency Selector Plan Changed:', plan);
  }

  updateSubscriptionOptionsForStaticUse(subscriptionOptions) {
    if (!subscriptionOptions || !Array.isArray(subscriptionOptions)) {
      console.warn(`WWAI ⚠️ No valid subscription options provided for ${this.productLabel} / ${this.variantOptions}`);
      return;
    }

    this.updateSubscriptionOptions(subscriptionOptions);
  }
}

customElements.define(
  SELECTORS.PRODUCT_GROUP.SUBSCRIPTION_FREQUENCY_STATIC,
  ProductStaticSubscriptionFrequencySelector
);

import { ProductCustomPriceSelector } from './product-custom-price-selector.js';
import { SELECTORS } from '../constants/selector-constants.js';
import { 
  VARIANT_TRIGGER_PRODUCT_LABEL_ATTR,
  VARIANT_TRIGGER_VARIANT_OPTION1_LABEL_ATTR,
  VARIANT_TRIGGER_VARIANT_OPTION2_LABEL_ATTR,
  VARIANT_TRIGGER_VARIANT_OPTION3_LABEL_ATTR
} from '../constants/elements/variant-trigger.js';

export class ProductStaticPriceSelector extends ProductCustomPriceSelector {
  constructor() {
    super();
    this.priceLabel = null;
    this.productLabel = null;
    this.variantOptions = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.init();
  }

  init() {
    this.productLabel = this.getAttribute(`${VARIANT_TRIGGER_PRODUCT_LABEL_ATTR}`);
    this.priceLabel = this.getAttribute('data-wwai-product-price-label');

    if (!this.productLabel || !this.priceLabel) {
      console.warn(`WWAI ⚠️ Missing productLabel or variantLabel or priceLabel on <product-static-price-selector>.`);
      return;
    }

    // Check which options are defined and convert to dictionary
    this.variantOptions = this.getDefinedVariantOptions();
    // Check this is non empty and not null.
    if (Object.keys(this.variantOptions).length === 0) {
      console.warn(`WWAI ⚠️ Missing variantOptions on <product-static-price-selector>.`);
      return;
    }

    console.log('🔍 Static Price Selector Initialized:', {
      productLabel: this.productLabel,
      priceLabel: this.priceLabel,
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

  updatePrice(pricingData) {
    if (!pricingData) {
      console.warn(`WWAI ⚠️ No pricing data provided for ${this.productLabel}`);
      return;
    }

    this.updatePrices(pricingData, this.priceLabel);
  }
}

customElements.define(SELECTORS.PRODUCT_GROUP.PRICE_STATIC, ProductStaticPriceSelector);

import { injectFloatingDebugLayer, removeFloatingDebugLayer } from '../product-variant-selector/element-highlighter';
import { highlightStaticPriceSelector, clearStaticPriceHighlighting } from './price-highlighter';

export class ProductStaticPriceSelectorHighlighter {
  constructor(selectorElement) {
    if (!selectorElement) throw new Error("Selector element is required");
    this.selector = selectorElement;
  }

  enableDebugging() {
    if (window.FUNCTIONALITY_DEBUG_MODE) {
      injectFloatingDebugLayer(this.selector);
      highlightStaticPriceSelector(this.selector);
    }
  }

  disableDebugging() {
    removeFloatingDebugLayer(this.selector);
    clearStaticPriceHighlighting(this.selector);
  }
}
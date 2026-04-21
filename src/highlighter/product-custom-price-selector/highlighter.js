import { injectFloatingDebugLayer, removeFloatingDebugLayer  } from '../product-variant-selector/element-highlighter';
import { highlightTaggedPriceElements, clearPriceHighlighting } from './price-highlighter';

export class ProductCustomPriceSelectorHighlighter {
    constructor(selectorElement) {
      if (!selectorElement) {
        throw new Error("Selector element is required");
      }
      this.selector = selectorElement;
    }
  
    enableDebugging() {
      if (window.FUNCTIONALITY_DEBUG_MODE) {
        injectFloatingDebugLayer(this.selector);
        highlightTaggedPriceElements(this.selector)
      }
    }
  
    disableDebugging() {
      removeFloatingDebugLayer(this.selector);
      clearPriceHighlighting(this.selector);
    }
}
import { injectFloatingDebugLayer, removeFloatingDebugLayer  } from '../product-variant-selector/element-highlighter';

export class ProductGridIconSmartSubscriptionButtonHighlighter {
    constructor(selectorElement) {
      if (!selectorElement) {
        throw new Error("Selector element is required");
      }
      this.selector = selectorElement;
    }
  
    enableDebugging() {
      if (window.FUNCTIONALITY_DEBUG_MODE) {
        injectFloatingDebugLayer(this.selector);
      }
    }
  
    disableDebugging() {
      removeFloatingDebugLayer(this.selector);
    }
}
import { highlightTaggedVariantInputs, clearHighlighting } from './input-highlighter.js';
import { injectFloatingDebugLayer, removeFloatingDebugLayer  } from './element-highlighter.js';

export class ProductVariantSelectorHighlighter {
    constructor(selectorElement) {
      if (!selectorElement) {
        throw new Error("Selector element is required");
      }
      this.selector = selectorElement;
    }
  
    enableDebugging() {
      if (window.FUNCTIONALITY_DEBUG_MODE) {
        highlightTaggedVariantInputs(this.selector);
        injectFloatingDebugLayer(this.selector);
      }
    }
  
    disableDebugging() {
      clearHighlighting(this.selector);
      removeFloatingDebugLayer(this.selector);
    }
  }
  
import { injectFloatingDebugLayer, removeFloatingDebugLayer } from '../product-variant-selector/element-highlighter';
import { highlightCustomAddToCartButton, clearAddToCartHighlight } from './add-to-cart-highlighter';

export class ProductCustomAddToCartButtonHighlighter {
  constructor(selectorElement) {
    if (!selectorElement) {
      throw new Error("Selector element is required");
    }
    this.selector = selectorElement;
  }

  enableDebugging() {
    if (window.FUNCTIONALITY_DEBUG_MODE) {
      injectFloatingDebugLayer(this.selector);
      highlightCustomAddToCartButton(this.selector);
    }
  }

  disableDebugging() {
    removeFloatingDebugLayer(this.selector);
    clearAddToCartHighlight(this.selector);
  }
}
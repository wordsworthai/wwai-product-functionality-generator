import { injectFloatingDebugLayer, removeFloatingDebugLayer } from '../product-variant-selector/element-highlighter';
import { highlightPurchaseTypeRadios, clearPurchaseTypeHighlights } from './input-highlighter';

export class ProductPurchaseTypeSelectorHighlighter {
  constructor(selectorElement) {
    if (!selectorElement) {
      throw new Error("Selector element is required");
    }
    this.selector = selectorElement;
  }

  enableDebugging() {
    if (window.FUNCTIONALITY_DEBUG_MODE) {
      injectFloatingDebugLayer(this.selector);
      highlightPurchaseTypeRadios(this.selector);
    }
  }

  disableDebugging() {
    removeFloatingDebugLayer(this.selector);
    clearPurchaseTypeHighlights(this.selector);
  }
}

import { highlightCustomVariantLabelTexts, clearCustomVariantLabelHighlights } from './text-highlighter.js';
import { injectFloatingDebugLayer, removeFloatingDebugLayer } from '../product-variant-selector/element-highlighter.js';

export class ProductCustomVariantLabelTextHighlighter {
  constructor(selectorElement) {
    if (!selectorElement) {
      throw new Error("Selector element is required");
    }
    this.selector = selectorElement;
  }

  enableDebugging() {
    if (window.FUNCTIONALITY_DEBUG_MODE) {
      highlightCustomVariantLabelTexts(this.selector);
      injectFloatingDebugLayer(this.selector);
    }
  }

  disableDebugging() {
    clearCustomVariantLabelHighlights(this.selector);
    removeFloatingDebugLayer(this.selector);
  }
}

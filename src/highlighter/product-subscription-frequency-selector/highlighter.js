import { injectFloatingDebugLayer, removeFloatingDebugLayer } from '../product-variant-selector/element-highlighter';
import { highlightSubscriptionFrequencySelect, clearSubscriptionFrequencyHighlight } from './select-highlighter';

export class ProductSubscriptionFrequencySelectorHighlighter {
  constructor(selectorElement) {
    if (!selectorElement) throw new Error("Selector element is required");
    this.selector = selectorElement;
  }

  enableDebugging() {
    if (window.FUNCTIONALITY_DEBUG_MODE) {
      injectFloatingDebugLayer(this.selector);
      highlightSubscriptionFrequencySelect(this.selector);
    }
  }

  disableDebugging() {
    removeFloatingDebugLayer(this.selector);
    clearSubscriptionFrequencyHighlight(this.selector);
  }
}
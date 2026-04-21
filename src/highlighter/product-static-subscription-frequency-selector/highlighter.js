import { injectFloatingDebugLayer, removeFloatingDebugLayer } from '../product-variant-selector/element-highlighter';
import { highlightStaticSubscriptionFrequencySelect, clearStaticSubscriptionFrequencyHighlight } from './select-highlighter';

export class ProductStaticSubscriptionFrequencySelectorHighlighter {
  constructor(selectorElement) {
    if (!selectorElement) throw new Error("Selector element is required");
    this.selector = selectorElement;
  }

  enableDebugging() {
    if (window.FUNCTIONALITY_DEBUG_MODE) {
      injectFloatingDebugLayer(this.selector);
      highlightStaticSubscriptionFrequencySelect(this.selector);
    }
  }

  disableDebugging() {
    removeFloatingDebugLayer(this.selector);
    clearStaticSubscriptionFrequencyHighlight(this.selector);
  }
}
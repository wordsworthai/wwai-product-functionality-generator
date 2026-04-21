import { injectFloatingDebugLayer, removeFloatingDebugLayer } from '../product-variant-selector/element-highlighter';
import { highlightCustomSubmitInterceptor, clearSubmitInterceptorHighlight } from './submit-interceptor-highlighter';

export class ProductCustomSubmitInterceptorHighlighter {
  constructor(selectorElement) {
    if (!selectorElement) {
      throw new Error("Selector element is required");
    }
    this.selector = selectorElement;
  }

  enableDebugging() {
    if (window.FUNCTIONALITY_DEBUG_MODE) {
      injectFloatingDebugLayer(this.selector);
      highlightCustomSubmitInterceptor(this.selector);
    }
  }

  disableDebugging() {
    removeFloatingDebugLayer(this.selector);
    clearSubmitInterceptorHighlight(this.selector);
  }
}
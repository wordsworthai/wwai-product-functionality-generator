import { injectFloatingDebugLayer, removeFloatingDebugLayer } from '../product-variant-selector/element-highlighter';
import { highlightCustomCarouselMediaSelector, clearCustomCarouselMediaSelectorHighlights } from './carousel-media-highlighter';

export class ProductCustomCarouselMediaSelectorHighlighter {
  constructor(selectorElement) {
    if (!selectorElement) {
      throw new Error("Selector element is required");
    }
    this.selector = selectorElement;
  }

  enableDebugging() {
    if (window.FUNCTIONALITY_DEBUG_MODE) {
      injectFloatingDebugLayer(this.selector);
      highlightCustomCarouselMediaSelector(this.selector);
    }
  }

  disableDebugging() {
    removeFloatingDebugLayer(this.selector);
    clearCustomCarouselMediaSelectorHighlights(this.selector);
  }
}

import { injectFloatingDebugLayer, removeFloatingDebugLayer  } from '../product-variant-selector/element-highlighter';
import { highlightTaggedMediaElements, clearMediaHighlighting } from './image-grid-highlighter';

export class ProductMediaGalleryForGridsHighlighter {
    constructor(selectorElement) {
      if (!selectorElement) {
        throw new Error("Selector element is required");
      }
      this.selector = selectorElement;
    }
  
    enableDebugging() {
      if (window.FUNCTIONALITY_DEBUG_MODE) {
        injectFloatingDebugLayer(this.selector);
        highlightTaggedMediaElements(this.selector)
      }
    }
  
    disableDebugging() {
      removeFloatingDebugLayer(this.selector);
      clearMediaHighlighting(this.selector);
    }
}
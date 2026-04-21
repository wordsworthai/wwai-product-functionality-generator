import { injectFloatingDebugLayer, removeFloatingDebugLayer  } from '../product-variant-selector/element-highlighter';
import { initializeFlowConfigHoverPanel, removeFlowConfigHoverPanel } from './flow_config_panel';
export class ProductGridIconSmartInteractionButtonHighlighter {
    constructor(selectorElement) {
      if (!selectorElement) {
        throw new Error("Selector element is required");
      }
      this.selector = selectorElement;
    }
  
    enableDebugging() {
      if (window.FUNCTIONALITY_DEBUG_MODE) {
        injectFloatingDebugLayer(this.selector);
        initializeFlowConfigHoverPanel(this.selector)
      }
    }
  
    disableDebugging() {
      removeFloatingDebugLayer(this.selector);
      removeFlowConfigHoverPanel(this.selector);
    }
}
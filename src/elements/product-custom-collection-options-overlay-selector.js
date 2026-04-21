import { WWAIBaseProductElement } from './base-product-element.js';
import { SELECTORS } from '../constants/selector-constants.js';

export class ProductCustomCollectionOptionsOverlaySelector extends WWAIBaseProductElement {
  constructor() {
    super();
    this.overlayBody = null;
    this.closeButton = null;
  }

  connectedCallback() {
    // Parse the overlay body
    this.overlayBody = this.querySelector('[data-wwai-collection-options-overlay-visible]');
    if (!this.overlayBody) {
      console.error("WWAI-ERROR ❌ No overlay body found with [data-wwai-collection-options-overlay-visible]");
      return;
    }

    // Bind close button if present
    this.closeButton = this.querySelector('[data-wwai-collection-options-overlay-close-btn]');
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => {
        this.closeOverlay();
      });
    }
  }

  openOverlay() {
    this.setContainerVisibility(true);
  }

  closeOverlay() {
    this.setContainerVisibility(false);
  }

  setContainerVisibility(visible = true) {
    if (!this.overlayBody) return;

    // Toggle visibility of current overlay
    if (visible) {
      this.overlayBody.classList.add('active');
    } else {
      this.overlayBody.classList.remove('active');
    }
    
    // Deactivate all other overlays
    const allOverlays = document.querySelectorAll('product-custom-collection-options-overlay-selector');
    allOverlays.forEach((overlay) => {
      if (overlay !== this) {
        const otherBody = overlay.querySelector('[data-wwai-collection-options-overlay-visible]');
        if (otherBody) {
          otherBody.classList.remove('active');
        }
      }
    }); 
  }
}

customElements.define(SELECTORS.PRODUCT_GROUP.COLLECTION_OPTIONS_OVERLAY, ProductCustomCollectionOptionsOverlaySelector);
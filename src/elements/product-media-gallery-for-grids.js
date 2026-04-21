import { WWAIBaseProductElement } from './base-product-element.js';
import { SELECTORS } from '../constants/selector-constants.js';

// Note: We are deprecating this element. This is for backwards compatibility and is used
// to show loaders for grid gallery. For all carousel based functionality, we are using
// the carousel media selector.
export class ProductMediaGalleryForGrids extends WWAIBaseProductElement {
    constructor() {
      super();
    }
  
    // Lifecycle hook - called when the element is added to the DOM
    connectedCallback() {
    }
}

customElements.define(SELECTORS.PRODUCT_GROUP.PRODUCT_MEDIA_GALLERY_FOR_GRIDS, ProductMediaGalleryForGrids);
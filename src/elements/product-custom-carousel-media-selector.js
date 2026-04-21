import { WWAIBaseProductElement } from './base-product-element.js';
import {
  CAROUSEL_COMPONENT_TAG
} from '../constants/elements/carousel-constants.js';
import { SELECTORS } from '../constants/selector-constants.js';

export class ProductCustomCarouselMediaSelector extends WWAIBaseProductElement {
  constructor() {
    super();
    this.currentMedia = null; // Track current media
    this.carouselElement = null;
    this.use_custom_uploaded_images = this.getAttribute("data-wwai-use-custom-uploaded-images") === "true";
  }

  shouldUseCustomImagesAndNotOverwrite() {
    return (this.use_custom_uploaded_images 
      || this.uxConfig?.imageCarouselConfig?.useCustomImages);
  }

  connectedCallback() {
    // ✅ Find the carousel element
    this.carouselElement = this.querySelector(CAROUSEL_COMPONENT_TAG);

    if (!this.carouselElement) {
      console.error(`WWAI-ERROR ❌ Missing <${CAROUSEL_COMPONENT_TAG}> inside <product-custom-carousel-media-selector>.`);
      return;
    }
  }

  /* Update the carousel media and index. */
  updateCarouselMedia(media, moveToIndex = 0) {
    if (this.shouldUseCustomImagesAndNotOverwrite()) {
      // in this case, we only move to index, we dont let the media be overwritten.
      // Media is typically set by product data or functionality generator.
      // In this case, we custom uploaded the images from shopify template json.
      this.carouselElement.gotoSlide(moveToIndex);
      return;
    }

    if (!Array.isArray(media) || media.length === 0) {
      console.warn("⚠️ No media provided to update the carousel.");
      return;
    }

    // ✅ Skip update if media is the same
    if (this.isSameMedia(media)) {
      console.log("🔄 Media is unchanged, skipping update.");
      this.carouselElement.gotoSlide(moveToIndex);
      return;
    }

    this.currentMedia = media;

    // ✅ Clear existing slides
    this.carouselElement.clearSlides();

    // ✅ Populate main and thumbnail sliders
    const mainSlider = this.carouselElement.querySelector("main-slider");
    const thumbSlider = this.carouselElement.querySelector("thumb-slider");

    media.forEach((mediaItem, index) => {
      if (mediaItem.media_type === "image") {
        if (mainSlider) {
          const mainSlide = this.carouselElement.createCustomCarouselSlide(mediaItem, false);
          mainSlider.appendChild(mainSlide);
        }
        if (thumbSlider) {
          const thumbSlide = this.carouselElement.createCustomCarouselSlide(mediaItem, true);
          thumbSlider.appendChild(thumbSlide);
        }
      }
    });

    // ✅ Call refresh to re-cache elements and bind events
    this.carouselElement.refresh(moveToIndex);

    // ✅ Finally, move to the specified index
    this.carouselElement.gotoSlide(moveToIndex);
}
  /* Compare new media with current media. */
  isSameMedia(newMedia) {
    if (!this.currentMedia) return false;
    if (this.currentMedia.length !== newMedia.length) return false;

    return this.currentMedia.every((item, idx) => item.id === newMedia[idx].id);
  }
}

customElements.define(SELECTORS.PRODUCT_GROUP.CAROUSEL, ProductCustomCarouselMediaSelector);
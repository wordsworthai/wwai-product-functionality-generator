import { WWAIBaseProductElement } from './base-product-element.js';
import { SELECTORS } from '../constants/selector-constants.js';

export class ProductMediaGalleryForGrids extends WWAIBaseProductElement {
    constructor() {
      super();
      this.hydrationDone = false;
    }
  
    // Lifecycle hook - called when the element is added to the DOM
    connectedCallback() {
      if (!this.validateAttributes()) return;
      this.initializeContainer();
      this.initializeFirstSlide();
    }
   
    // Validates required attributes
    validateAttributes() {
      if (!this.sectionId || !this.productGroup) {
        console.warn(`⚠️ Missing required attributes: section_id="${this.sectionId}", product_group="${this.productGroup}".`);
        return false;
      }
      return true;
    }
  
    // Initializes the main container
    initializeContainer() {
      const container = this.querySelector('[data-wwai-media-container]');
      if (!container) {
        console.error(`WWAI-ERROR ["${this.sectionId}"]["${this.productGroup}"]: Missing media container`);
        return false;
      }
      this.container = container;
      return true;
    }
  
    // Initializes the first slide
    initializeFirstSlide() {
      const existingSlide = this.container.querySelector('.product-section-media');
      if (!existingSlide) {
        console.error(`WWAI-ERROR ["${this.sectionId}"]["${this.productGroup}"]: At least one slide should be present`);
        return false;
      }
      this.firstSlide = existingSlide;
      return true;
    }
  
    // Hydrates the gallery with additional media
    hydrateRemainingMedia(productMedia = []) {
      if (!this.isValidMediaArray(productMedia)) return;
  
      const imageMedia = this.filterImageMedia(productMedia);
      const imgEl = this.firstSlide.querySelector('img');
  
      if (!imgEl) {
        console.warn(`[${this.sectionId}] ⚠️ No <img> found inside the first slide.`);
        return;
      }
  
      const matchedMedia = this.matchFirstSlideMedia(imgEl, imageMedia);
      this.attachMediaIdToFirstSlide(matchedMedia);
  
      const remainingMedia = matchedMedia
        ? imageMedia.filter(media => media.id !== matchedMedia.id)
        : imageMedia;
  
      this.appendNewSlides(remainingMedia);
      this.hydrationDone = true;
    }
  
    // Validate media array
    isValidMediaArray(productMedia) {
      if (!Array.isArray(productMedia) || productMedia.length === 0) {
        console.warn(`[${this.sectionId}] ⚠️ Invalid or empty media array passed to hydrateRemainingMedia()`);
        return false;
      }
      return true;
    }
  
    // Filter image-type media only
    filterImageMedia(productMedia) {
      return productMedia.filter(media => media.media_type === 'image');
    }
  
    // Match the first slide with the media array
    matchFirstSlideMedia(imgEl, imageMedia) {
      const firstSlideSrc = normalizeUrl(imgEl.getAttribute('src') || '');
      return imageMedia.find(media => {
        const mediaSrc = normalizeUrl(media.preview_image?.src);
        return firstSlideSrc.includes(mediaSrc);
      });
    }
  
    // Attach media ID to the first slide if a match is found
    attachMediaIdToFirstSlide(matchedMedia) {
      if (matchedMedia && !this.firstSlide.hasAttribute('data-wwai-carousel-media-id')) {
        this.firstSlide.setAttribute('data-wwai-carousel-media-id', matchedMedia.id);
        console.log(`[${this.sectionId}] 🟢 Attached data-wwai-carousel-media-id="${matchedMedia.id}" to first slide.`);
      } else {
        console.warn(`[${this.sectionId}] ❌ No matching media found for first slide`);
      }
    }
  
    // Append remaining slides to the container
    appendNewSlides(remainingMedia) {
      remainingMedia.forEach(media => {
        const newSlide = this.createSlide(media);
        this.firstSlide.parentElement.appendChild(newSlide);
      });
    }
  
    // Creates a cloned slide for a given media object
    createSlide(media) {
      const newSlide = this.firstSlide.cloneNode(true);
      newSlide.removeAttribute('id');
      this.cleanAttributes(newSlide);
      this.updateImageAttributes(newSlide, media);
      return newSlide;
    }
  
    // Cleans up attributes except the media ID
    cleanAttributes(element) {
      Array.from(element.attributes).forEach(attr => {
        if (attr.name.startsWith('data-') && attr.name !== 'data-wwai-carousel-media-id') {
          element.removeAttribute(attr.name);
        }
      });
    }
  
    // Updates the image attributes and srcset
    updateImageAttributes(newSlide, media) {
      const img = newSlide.querySelector('img');
      if (!img) return;
  
      this.cleanAttributes(img);
  
      img.src = media.preview_image?.src || '';
      img.setAttribute('loading', 'lazy');
  
      const originalSrcset = img.getAttribute('srcset') || '';
      const widths = Array.from(originalSrcset.matchAll(/(\d+)w/g)).map(match => parseInt(match[1]));
      const baseSrc = media.preview_image?.src?.split('?')[0];
  
      if (baseSrc && widths.length > 0) {
        const newSrcset = widths.map(w => `${baseSrc}?width=${w} ${w}w`).join(', ');
        img.setAttribute('srcset', newSrcset);
      }
    }
  
    // Scroll to a specific media ID
    scrollToMediaById(mediaId) {
      if (!this.container) {
        console.warn(`[${this.sectionId}] ⚠️ Media container not found`);
        return;
      }
  
      const targetSlide = this.container.querySelector(`[data-wwai-carousel-media-id="${mediaId}"]`);
      if (!targetSlide) {
        console.warn(`[${this.sectionId}] ⚠️ Slide with mediaId=${mediaId} not found`);
        return;
      }
  
      const targetLeft = targetSlide.getBoundingClientRect().left 
                       - this.container.getBoundingClientRect().left 
                       + this.container.scrollLeft;
  
      this.container.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }
  
    // Conditionally hydrate or scroll to media ID
    maybeHydrateOrScroll(productMedia = [], mediaId) {
      if (!this.hydrationDone) {
        console.log(`[${this.sectionId}] 💧 Hydrating (scroll will be skipped)...`);
        this.hydrateRemainingMedia(productMedia);
        return;
      }
      if (mediaId) {
        this.scrollToMediaById(mediaId);
      } else {
        console.log(`[${this.sectionId}] ⚠️ No media ID provided for scroll`);
      }
    }
}

customElements.define(SELECTORS.PRODUCT_GROUP.PRODUCT_MEDIA_GALLERY_FOR_GRIDS, ProductMediaGalleryForGrids);
import {
    MEDIA_CONTAINER_SELECTOR,
    PRODUCT_SECTION_MEDIA_SELECTOR,
    MEDIA_ID_ATTR
} from '../constants/elements/product-media-gallery-constants.js';
  
export function validateProductMediaGalleryForGrids(
    galleryElement, 
    printToLogs = false
) {
    const messages = [];
    let hasError = false;

    // ✅ Validate sectionId and productGroup
    const sectionId = galleryElement.getAttribute('section_id');
    const productGroup = galleryElement.getAttribute('product_group');

    if (!sectionId) {
        hasError = true;
        messages.push(`⚠️ Missing attribute [section_id]`);
    }

    if (!productGroup) {
        hasError = true;
        messages.push(`⚠️ Missing attribute [product_group]`);
    }

    // ✅ Validate main container
    const container = galleryElement.querySelector(MEDIA_CONTAINER_SELECTOR);
    if (!container) {
        hasError = true;
        messages.push(`⚠️ Missing main media container [${MEDIA_CONTAINER_SELECTOR}]`);
    }

    // ✅ Validate initial slide with new data attribute
    const firstSlide = container ? container.querySelector(PRODUCT_SECTION_MEDIA_SELECTOR) : null;
    if (!firstSlide) {
        hasError = true;
        messages.push(`⚠️ Missing initial slide [${PRODUCT_SECTION_MEDIA_SELECTOR}] in container`);
    } else {
        // ✅ Validate the image inside the slide
        const imgEl = firstSlide.querySelector('img');
        if (!imgEl) {
        hasError = true;
        messages.push(`⚠️ Missing <img> element inside the first slide`);
        }

        // ✅ Validate new data attribute (data-wwai-carousel-media-id)
        if (!firstSlide.hasAttribute(MEDIA_ID_ATTR)) {
        hasError = true;
        messages.push(`⚠️ First slide is missing required attribute [${MEDIA_ID_ATTR}]`);
        }
    }

    // ✅ Set debug attributes
    const status = hasError ? 'error' : 'valid';
    galleryElement.setAttribute('debug_status', status);
    galleryElement.setAttribute('debug_message', JSON.stringify(messages));

    if (printToLogs) {
        console.group(`[ProductMediaGalleryForGrids] Validation Output`);
        console.log('Status:', status);
        console.log('Messages:', messages);
        console.groupEnd();
    }

    return { status, messages };
}

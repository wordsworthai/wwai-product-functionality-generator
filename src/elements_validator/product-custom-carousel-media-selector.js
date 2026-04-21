import {
    CAROUSEL_COMPONENT_TAG,
    REQUIRED_CAROUSEL_METHODS
  } from '../constants/elements/carousel-constants.js';
  
export function validateCustomCarouselMediaSelector(selectorElement, printToLogs = false) {
    const messages = [];
    let hasError = false;
    let hasWarning = false;

    const carousels = selectorElement.querySelectorAll(CAROUSEL_COMPONENT_TAG);

    // Rule 1: Must contain exactly one carousel-slider
    if (carousels.length === 0) {
        hasError = true;
        messages.push(`Missing <${CAROUSEL_COMPONENT_TAG}> inside <product-custom-carousel-media-selector>.`);
    } else if (carousels.length > 1) {
        hasError = true;
        messages.push(`Multiple <${CAROUSEL_COMPONENT_TAG}> elements found (${carousels.length}). Only one is allowed.`);
    }

    // Rule 2: Must expose required methods
    if (carousels.length === 1) {
        const carousel = carousels[0];

        REQUIRED_CAROUSEL_METHODS.forEach(method => {
        if (typeof carousel[method] !== 'function') {
            hasError = true;
            messages.push(`Missing required method: "${method}" on <${CAROUSEL_COMPONENT_TAG}>.`);
        }
        });
    }

    const status = hasError ? 'error' : hasWarning ? 'warning' : 'valid';

    selectorElement.setAttribute('debug_status', status);
    selectorElement.setAttribute('debug_message', JSON.stringify(messages));

    if (printToLogs) {
        console.group(`[CustomCarouselMediaSelector] Validation Output`);
        console.log('Status:', status);
        console.log('Messages:', messages);
        console.groupEnd();
    }

    return { status, messages };
}
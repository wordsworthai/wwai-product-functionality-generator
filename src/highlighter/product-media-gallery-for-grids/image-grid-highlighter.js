import {
    MEDIA_CONTAINER_SELECTOR,
    PRODUCT_SECTION_MEDIA_SELECTOR,
    MEDIA_ID_ATTR
} from '../../constants/elements/product-media-gallery-constants.js';

export function highlightTaggedMediaElements(containerEl) {
    const mediaElements = containerEl.querySelectorAll(PRODUCT_SECTION_MEDIA_SELECTOR);

    // Create the tooltip element if it doesn't exist
    let tooltipEl = document.querySelector('#wwai-debug-tooltip-media');
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'wwai-debug-tooltip-media';
        Object.assign(tooltipEl.style, {
        position: 'absolute',
        zIndex: '9999',
        background: '#333',
        color: '#fff',
        padding: '6px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        whiteSpace: 'pre-line',
        display: 'none'
        });
        document.body.appendChild(tooltipEl);
    }

    // Iterate over each media element and add highlighting + tooltip
    mediaElements.forEach(el => {
        const mediaId = el.getAttribute(MEDIA_ID_ATTR) || '(missing)';
        const outlineColor = mediaId !== '(missing)' ? '2px solid limegreen' : '2px solid red';
        
        // 🔍 Check if there's an <img> inside the element
        const imageElement = el.querySelector('img');

        if (imageElement) {
            // ✅ Outline the image directly
            imageElement.style.outline = outlineColor;
        } else {
            // ✅ Fallback to outline the entire element if no image is found
            el.style.outline = outlineColor;
        }

        // el.style.outline = outlineColor;

        const tooltipText = `Media ID: ${mediaId}`;

        // Event listeners for tooltip handling
        el.addEventListener('mouseover', e => {
        tooltipEl.textContent = tooltipText;
        tooltipEl.style.display = 'block';
        tooltipEl.style.left = `${e.pageX + 10}px`;
        tooltipEl.style.top = `${e.pageY + 10}px`;
        });

        el.addEventListener('mousemove', e => {
        tooltipEl.style.left = `${e.pageX + 10}px`;
        tooltipEl.style.top = `${e.pageY + 10}px`;
        });

        el.addEventListener('mouseout', () => {
        tooltipEl.style.display = 'none';
        });
    });
}

export function clearMediaHighlighting(containerEl) {
    console.log("clearMediaHighlighting called");

    // Select all media elements
    const mediaElements = containerEl.querySelectorAll(PRODUCT_SECTION_MEDIA_SELECTOR);

    // Clear outlines and remove event listeners
    mediaElements.forEach(el => {
        el.style.outline = '';

        // Create a clean clone of the element to remove event listeners
        const clone = el.cloneNode(true);
        el.replaceWith(clone);
    });

    // Hide the tooltip if it exists
    const tooltip = document.getElementById('wwai-debug-tooltip-media');
    if (tooltip) tooltip.style.display = 'none';
}
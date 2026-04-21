import {
    CAROUSEL_COMPONENT_TAG,
    REQUIRED_CAROUSEL_METHODS
  } from '../../constants/elements/carousel-constants.js';
  
export function highlightCustomCarouselMediaSelector(selectorElement) {
    const carousel = selectorElement.querySelector(CAROUSEL_COMPONENT_TAG);
    if (!carousel) return;

    // 🧰 Create/reuse tooltip
    let tooltipEl = document.getElementById('wwai-carousel-tooltip');
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'wwai-carousel-tooltip';
        Object.assign(tooltipEl.style, {
        position: 'fixed',
        zIndex: '9999',
        background: '#333',
        color: '#fff',
        padding: '6px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        whiteSpace: 'pre-line',
        display: 'none',
        pointerEvents: 'none'
        });
        document.body.appendChild(tooltipEl);
    }

    // 🟢 Highlight
    carousel.style.outline = '2px solid limegreen';

    const methodStatuses = REQUIRED_CAROUSEL_METHODS.map(
        method => `${method}: ${typeof carousel[method] === 'function' ? 'yes' : 'no'}`
    ).join('\n');

    const tooltipText = `<${CAROUSEL_COMPONENT_TAG}> found\nMethods:\n${methodStatuses}`;

    // 🖱 Tooltip handlers
    const onMouseOver = e => {
        tooltipEl.textContent = tooltipText;
        tooltipEl.style.display = 'block';
        tooltipEl.style.transform = `translate(${e.clientX + 10}px, ${e.clientY + 10}px)`;
    };

    const onMouseMove = e => {
        tooltipEl.style.transform = `translate(${e.clientX + 10}px, ${e.clientY + 10}px)`;
    };

    const onMouseOut = () => {
        tooltipEl.style.display = 'none';
    };

    // Store handlers for removal
    carousel._tooltipHandlers = { onMouseOver, onMouseMove, onMouseOut };

    carousel.addEventListener('mouseover', onMouseOver);
    carousel.addEventListener('mousemove', onMouseMove);
    carousel.addEventListener('mouseout', onMouseOut);
}

export function clearCustomCarouselMediaSelectorHighlights(selectorElement) {
    const carousel = selectorElement.querySelector(CAROUSEL_COMPONENT_TAG);
    if (!carousel) return;

    carousel.style.outline = '';

    const handlers = carousel._tooltipHandlers;
    if (handlers) {
        carousel.removeEventListener('mouseover', handlers.onMouseOver);
        carousel.removeEventListener('mousemove', handlers.onMouseMove);
        carousel.removeEventListener('mouseout', handlers.onMouseOut);
        delete carousel._tooltipHandlers;
    }

    const tooltip = document.getElementById('wwai-carousel-tooltip');
    if (tooltip) tooltip.style.display = 'none';
}
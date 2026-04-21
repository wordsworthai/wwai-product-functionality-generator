import {
    VARIANT_CUSTOM_LABEL_SELECTOR,
    VARIANT_CUSTOM_LABEL_VALUE_ATTR
} from '../../constants/elements/variant-custom-label-constants.js';
  
export function highlightCustomVariantLabelTexts(selectorElement) {
    const elements = selectorElement.querySelectorAll(VARIANT_CUSTOM_LABEL_SELECTOR);
    if (!elements.length) return;

    let tooltipEl = document.getElementById('wwai-variant-custom-label-tooltip');
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'wwai-variant-custom-label-tooltip';
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

    elements.forEach(el => {
        const label = el.getAttribute(VARIANT_CUSTOM_LABEL_VALUE_ATTR) || '[missing label]';
        const textContent = el.textContent?.trim() || '[empty text]';
        const tooltip = `Custom Variant Label Text\nLabel: ${label}\nText: ${textContent}`;

        el.style.outline = '2px solid limegreen';

        const onMouseOver = e => {
        tooltipEl.textContent = tooltip;
        tooltipEl.style.display = 'block';
        tooltipEl.style.left = `${e.clientX + 10}px`;
        tooltipEl.style.top = `${e.clientY + 10}px`;
        };

        const onMouseMove = e => {
        tooltipEl.style.left = `${e.clientX + 10}px`;
        tooltipEl.style.top = `${e.clientY + 10}px`;
        };

        const onMouseOut = () => {
        tooltipEl.style.display = 'none';
        };

        el._tooltipHandlers = { onMouseOver, onMouseMove, onMouseOut };
        el.addEventListener('mouseover', onMouseOver);
        el.addEventListener('mousemove', onMouseMove);
        el.addEventListener('mouseout', onMouseOut);
    });
}
  
export function clearCustomVariantLabelHighlights(selectorElement) {
    const elements = selectorElement.querySelectorAll(VARIANT_CUSTOM_LABEL_SELECTOR);
    if (!elements.length) return;

    elements.forEach(el => {
        el.style.outline = '';
        const handlers = el._tooltipHandlers;
        if (handlers) {
        el.removeEventListener('mouseover', handlers.onMouseOver);
        el.removeEventListener('mousemove', handlers.onMouseMove);
        el.removeEventListener('mouseout', handlers.onMouseOut);
        delete el._tooltipHandlers;
        }
    });

    const tooltip = document.getElementById('wwai-variant-custom-label-tooltip');
    if (tooltip) tooltip.style.display = 'none';
}
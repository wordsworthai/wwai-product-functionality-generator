import {
    PRICE_LABEL_ATTR,
    PRICE_DATA_ATTRS
} from '../../constants/elements/price-selector-constants.js';
  
export function highlightTaggedPriceElements(containerEl) {
    const selectorString = Object.values(PRICE_DATA_ATTRS)
        .map(attr => `[${attr}]`)
        .join(', ');

    const priceElements = containerEl.querySelectorAll(selectorString);

    // Create tooltip element once
    let tooltipEl = document.querySelector('#wwai-debug-tooltip-price');
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'wwai-debug-tooltip-price';
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

    priceElements.forEach(el => {
        const label = el.getAttribute(PRICE_LABEL_ATTR) || '(missing)';
        let type = '';

        if (el.hasAttribute(PRICE_DATA_ATTRS.BEFORE)) type = 'beforePrice';
        else if (el.hasAttribute(PRICE_DATA_ATTRS.AFTER)) type = 'afterPrice';
        else if (el.hasAttribute(PRICE_DATA_ATTRS.DISCOUNT)) type = 'discountPercentage';
        else if (el.hasAttribute(PRICE_DATA_ATTRS.SAVINGS)) type = 'savings';

        const hasLabel = label !== '(missing)';
        const outlineColor = hasLabel ? '2px solid limegreen' : '2px solid red';
        el.style.outline = outlineColor;

        const tooltipText = `Label: ${label}\nType: ${type}`;

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

export function clearPriceHighlighting(containerEl) {
    console.log("clearPriceHighlighting called");

    const selectorString = Object.values(PRICE_DATA_ATTRS)
        .map(attr => `[${attr}]`)
        .join(', ');

    const priceElements = containerEl.querySelectorAll(selectorString);

    priceElements.forEach(el => {
        el.style.outline = '';
        const clone = el.cloneNode(true);
        el.replaceWith(clone);
    });

    const tooltip = document.getElementById('wwai-debug-tooltip-price');
    if (tooltip) tooltip.style.display = 'none';
}
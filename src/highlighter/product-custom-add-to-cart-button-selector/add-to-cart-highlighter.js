import {
    ADD_TO_CART_BUTTON_DATA_ATTRS
  } from '../../constants/elements/add-to-cart-constants.js';
  
export function highlightCustomAddToCartButton(selectorElement) {
    const form = selectorElement.querySelector("form");
    if (!form) return;

    // 🧰 Create or reuse tooltip
    let tooltipEl = document.getElementById('wwai-addtocart-tooltip');
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'wwai-addtocart-tooltip';
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

    // 🟢 Apply outline
    selectorElement.style.outline = '2px solid limegreen';

    const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
    const hiddenNames = Array.from(hiddenInputs).map(i => i.name).join(', ') || '[none]';
    const hasSubmit = !!form.querySelector('button[type="submit"]');
    const hasAddText = !!form.querySelector(`[${ADD_TO_CART_BUTTON_DATA_ATTRS.ADD_TO_CART_TEXT_ATTR}]`);
    const hasSoldText = !!form.querySelector(`[${ADD_TO_CART_BUTTON_DATA_ATTRS.SOLD_OUT_TEXT_ATTR}]`);

    const tooltip = `Custom Add to Cart\nHidden Inputs: ${hiddenNames}\nSubmit Button: ${hasSubmit ? 'yes' : 'no'}\n[+Text]: ${hasAddText ? 'yes' : 'no'} | [Sold]: ${hasSoldText ? 'yes' : 'no'}`;

    // 🖱 Events
    const onMouseOver = e => {
        tooltipEl.textContent = tooltip;
        tooltipEl.style.display = 'block';
        tooltipEl.style.transform = `translate(${e.clientX + 12}px, ${e.clientY + 12}px)`;
    };
    const onMouseMove = e => {
        tooltipEl.style.transform = `translate(${e.clientX + 12}px, ${e.clientY + 12}px)`;
    };
    const onMouseOut = () => {
        tooltipEl.style.display = 'none';
    };

    selectorElement._tooltipHandlers = { onMouseOver, onMouseMove, onMouseOut };

    selectorElement.addEventListener('mouseover', onMouseOver);
    selectorElement.addEventListener('mousemove', onMouseMove);
    selectorElement.addEventListener('mouseout', onMouseOut);
}

export function clearAddToCartHighlight(selectorElement) {
    selectorElement.style.outline = '';

    const handlers = selectorElement._tooltipHandlers;
    if (handlers) {
        selectorElement.removeEventListener('mouseover', handlers.onMouseOver);
        selectorElement.removeEventListener('mousemove', handlers.onMouseMove);
        selectorElement.removeEventListener('mouseout', handlers.onMouseOut);
        delete selectorElement._tooltipHandlers;
    }

    const tooltip = document.getElementById('wwai-addtocart-tooltip');
    if (tooltip) tooltip.style.display = 'none';
}
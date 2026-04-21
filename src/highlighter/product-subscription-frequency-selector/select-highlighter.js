import {
    SUBSCRIPTION_FREQUENCY_ATTR,
    SUBSCRIPTION_FREQUENCY_SELECTOR
  } from '../../constants/elements/subscription-frequency-selector-constants.js';
  
export function highlightSubscriptionFrequencySelect(selectorElement) {
    const select = selectorElement.querySelector(SUBSCRIPTION_FREQUENCY_SELECTOR);
    if (!select) return;

    let tooltipEl = document.getElementById('wwai-subscription-tooltip');
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'wwai-subscription-tooltip';
        Object.assign(tooltipEl.style, {
            position: 'absolute',
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

    const name = select.getAttribute('name') || '[no name]';
    const options = select.querySelectorAll('option').length;
    const tooltipText = `Subscription Frequency Select\nname: ${name}\noptions: ${options}`;

    select.style.outline = '2px solid limegreen';

    const mouseOverHandler = () => {
        const rect = select.getBoundingClientRect();
        tooltipEl.textContent = tooltipText;
        tooltipEl.style.left = `${rect.left + window.scrollX}px`;
        tooltipEl.style.top = `${rect.bottom + window.scrollY + 6}px`;
        tooltipEl.style.display = 'block';
    };

    const mouseOutHandler = () => {
        tooltipEl.style.display = 'none';
    };

    select._tooltipHandlers = { mouseOverHandler, mouseOutHandler };

    select.addEventListener('mouseover', mouseOverHandler);
    select.addEventListener('mouseout', mouseOutHandler);
}
  
export function clearSubscriptionFrequencyHighlight(selectorElement) {
    const select = selectorElement.querySelector(SUBSCRIPTION_FREQUENCY_SELECTOR);
    if (!select) return;

    select.style.outline = '';

    const handlers = select._tooltipHandlers;
    if (handlers) {
        select.removeEventListener('mouseover', handlers.mouseOverHandler);
        select.removeEventListener('mouseout', handlers.mouseOutHandler);
        delete select._tooltipHandlers;
    }

    const tooltip = document.getElementById('wwai-subscription-tooltip');
    if (tooltip) tooltip.style.display = 'none';
}
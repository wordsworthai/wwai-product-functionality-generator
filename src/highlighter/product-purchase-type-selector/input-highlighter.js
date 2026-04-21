import {
    PURCHASE_TYPE_ATTR,
    PURCHASE_TYPE_VALUES,
    PURCHASE_TYPE_SELECTOR
  } from '../../constants/elements/purchase-type-selector-constants.js';
  
export function highlightPurchaseTypeRadios(containerEl) {
    const radios = containerEl.querySelectorAll(PURCHASE_TYPE_SELECTOR);

    // Create a tooltip element if not already present
    let tooltipEl = document.querySelector('#wwai-debug-tooltip-purchase-type');
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'wwai-debug-tooltip-purchase-type';
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

    radios.forEach((input) => {
        const type = input.getAttribute(PURCHASE_TYPE_ATTR);
        const name = input.getAttribute('name');
        const tooltipText = `Type: ${type}\nName: ${name || '(none)'}`;
        const outlineColor = [PURCHASE_TYPE_VALUES.ONETIME, PURCHASE_TYPE_VALUES.SUBSCRIPTION].includes(type)
        ? '2px solid limegreen'
        : '2px solid red';

        // Highlight input
        input.style.outline = outlineColor;

        // Hover listeners on input
        input.addEventListener('mouseover', e => {
        tooltipEl.textContent = tooltipText;
        tooltipEl.style.display = 'block';
        tooltipEl.style.left = `${e.pageX + 10}px`;
        tooltipEl.style.top = `${e.pageY + 10}px`;
        });
        input.addEventListener('mousemove', e => {
        tooltipEl.style.left = `${e.pageX + 10}px`;
        tooltipEl.style.top = `${e.pageY + 10}px`;
        });
        input.addEventListener('mouseout', () => {
        tooltipEl.style.display = 'none';
        });

        // Highlight corresponding label
        const inputId = input.id;
        if (inputId) {
        const label = containerEl.querySelector(`label[for="${inputId}"]`);
        if (label) {
            label.style.outline = outlineColor;

            label.addEventListener('mouseover', e => {
            tooltipEl.textContent = tooltipText;
            tooltipEl.style.display = 'block';
            tooltipEl.style.left = `${e.pageX + 10}px`;
            tooltipEl.style.top = `${e.pageY + 10}px`;
            });
            label.addEventListener('mousemove', e => {
            tooltipEl.style.left = `${e.pageX + 10}px`;
            tooltipEl.style.top = `${e.pageY + 10}px`;
            });
            label.addEventListener('mouseout', () => {
            tooltipEl.style.display = 'none';
            });
        }
        }
    });
}

export function clearPurchaseTypeHighlights(containerEl) {
    const radios = containerEl.querySelectorAll(PURCHASE_TYPE_SELECTOR);

    radios.forEach((input) => {
        // Remove outline from input
        input.style.outline = '';

        // Replace input to clear listeners
        const cleanInput = input.cloneNode(true);
        input.replaceWith(cleanInput);

        const inputId = input.id;
        if (inputId) {
        const label = containerEl.querySelector(`label[for="${inputId}"]`);
        if (label) {
            label.style.outline = '';

            // Replace label to remove listeners
            const cleanLabel = label.cloneNode(true);
            label.replaceWith(cleanLabel);
        }
        }
    });

    const tooltipEl = document.querySelector('#wwai-debug-tooltip-purchase-type');
    if (tooltipEl) {
        tooltipEl.style.display = 'none';
    }
}
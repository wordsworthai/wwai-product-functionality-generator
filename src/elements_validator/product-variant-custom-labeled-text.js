import {
    VARIANT_CUSTOM_LABEL_SELECTOR,
    VARIANT_CUSTOM_LABEL_VALUE_ATTR
  } from '../constants/elements/variant-custom-label-constants.js';
  
export function validateCustomVariantLabelTextSelector(selectorElement, printToLogs = false) {
    const messages = [];
    let hasError = false;
    let hasWarning = false;

    const labelElements = selectorElement.querySelectorAll(VARIANT_CUSTOM_LABEL_SELECTOR);

    if (labelElements.length === 0) {
        hasWarning = true;
        messages.push(`No element found with [${VARIANT_CUSTOM_LABEL_SELECTOR}]`);
    }

    const seenLabels = new Set();

    labelElements.forEach((el, index) => {
        const label = el.getAttribute(VARIANT_CUSTOM_LABEL_VALUE_ATTR)?.trim();
        const text = (el.textContent || '').trim();

        if (!label) {
        hasError = true;
        messages.push(`Element #${index + 1} is missing [${VARIANT_CUSTOM_LABEL_VALUE_ATTR}]`);
        } else {
        if (seenLabels.has(label)) {
            hasError = true;
            messages.push(`Duplicate label value "${label}" found`);
        } else {
            seenLabels.add(label);
        }
        }

        if (!text) {
        hasWarning = true;
        messages.push(`Element #${index + 1} has no visible text content`);
        }
    });

    const status = hasError ? 'error' : hasWarning ? 'warning' : 'valid';

    selectorElement.setAttribute('debug_status', status);
    selectorElement.setAttribute('debug_message', JSON.stringify(messages));

    if (printToLogs) {
        console.group('[VariantCustomLabelText] Validation Output');
        console.log('Status:', status);
        console.log('Messages:', messages);
        console.groupEnd();
    }

    return { status, messages };
}
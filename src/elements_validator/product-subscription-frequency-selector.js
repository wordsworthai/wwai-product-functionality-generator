import {
    SUBSCRIPTION_FREQUENCY_ATTR,
    SUBSCRIPTION_FREQUENCY_SELECTOR
  } from '../constants/elements/subscription-frequency-selector-constants.js';

  
export function validateSubscriptionFrequencySelector(selectorElement, printToLogs = false) {
    const messages = [];
    let hasError = false;

    const allSelects = selectorElement.querySelectorAll(SUBSCRIPTION_FREQUENCY_SELECTOR);

    if (allSelects.length === 0) {
        hasError = true;
        messages.push(`Missing <select> with [${SUBSCRIPTION_FREQUENCY_ATTR}]`);
    } else if (allSelects.length > 1) {
        hasError = true;
        messages.push(`Multiple <select> elements with [${SUBSCRIPTION_FREQUENCY_ATTR}] found (${allSelects.length}) — only one allowed.`);
    }

    const selectEl = allSelects[0];

    if (selectEl) {
        if (selectEl.tagName.toLowerCase() !== 'select') {
        hasError = true;
        messages.push(`Element with [${SUBSCRIPTION_FREQUENCY_ATTR}] must be a <select>, found <${selectEl.tagName.toLowerCase()}>`);
        }

        const name = selectEl.getAttribute('name');
        if (!name) {
        hasError = true;
        messages.push(`Select element must have a "name" attribute`);
        } else {
        const allNamedElements = document.querySelectorAll(`input[name="${name}"], select[name="${name}"]`);
        const conflicts = Array.from(allNamedElements).filter(el => el !== selectEl);

        if (conflicts.length > 0) {
            hasError = true;
            messages.push(`Name "${name}" is not unique — found ${conflicts.length} other input/select(s) using this name`);
        }
        }
    }

    const status = hasError ? 'error' : 'valid';

    selectorElement.setAttribute('debug_status', status);
    selectorElement.setAttribute('debug_message', JSON.stringify(messages));

    if (printToLogs) {
        console.group(`[ProductSubscriptionFrequencySelector] Validation Output`);
        console.log('Status:', status);
        console.log('Messages:', messages);
        console.groupEnd();
    }

    return { status, messages };
}
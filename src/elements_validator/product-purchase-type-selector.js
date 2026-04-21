import {
    PURCHASE_TYPE_ATTR,
    PURCHASE_TYPE_VALUES,
    PURCHASE_TYPE_SELECTOR
  } from '../constants/elements/purchase-type-selector-constants.js';

  
export function validatePurchaseTypeSelector(selectorElement, printToLogs = false) {
    const messages = [];
    let hasError = false;
    let hasWarning = false;

    const radios = selectorElement.querySelectorAll(PURCHASE_TYPE_SELECTOR);
    const nameSet = new Set();
    const typeCount = {
        [PURCHASE_TYPE_VALUES.ONETIME]: 0,
        [PURCHASE_TYPE_VALUES.SUBSCRIPTION]: 0
    };

    radios.forEach((radio) => {
        const type = radio.getAttribute(PURCHASE_TYPE_ATTR)?.trim();
        const name = radio.getAttribute('name');
        if (name) nameSet.add(name);

        if (type === PURCHASE_TYPE_VALUES.ONETIME) typeCount.onetime += 1;
        else if (type === PURCHASE_TYPE_VALUES.SUBSCRIPTION) typeCount.subscription += 1;
    });

    if (typeCount.onetime === 0 || typeCount.subscription === 0) {
        hasError = true;
        messages.push(
        `Missing purchase types: ${[
            typeCount.onetime === 0 ? PURCHASE_TYPE_VALUES.ONETIME : null,
            typeCount.subscription === 0 ? PURCHASE_TYPE_VALUES.SUBSCRIPTION : null,
        ].filter(Boolean).join(', ')}`
        );
    }

    if (typeCount.onetime > 1 || typeCount.subscription > 1) {
        hasError = true;
        messages.push(
        `Multiple radios found for: ${[
            typeCount.onetime > 1 ? `onetime (${typeCount.onetime})` : null,
            typeCount.subscription > 1 ? `subscription (${typeCount.subscription})` : null,
        ].filter(Boolean).join(', ')}`
        );
    }

    if (nameSet.size > 1) {
        hasWarning = true;
        messages.push(`Radios inside use multiple "name" attributes: [${[...nameSet].join(', ')}]`);
    }

    const currentName = [...nameSet][0];
    if (currentName) {
        const allNamedInputs = document.querySelectorAll(`input[type="radio"][name="${currentName}"]`);
        const conflicts = Array.from(allNamedInputs).filter(el => !selectorElement.contains(el));

        if (conflicts.length > 0) {
        hasError = true;
        messages.push(`Radio "name" conflict: "${currentName}" is reused elsewhere in the document`);
        }
    }

    const status = hasError ? 'error' : hasWarning ? 'warning' : 'valid';

    selectorElement.setAttribute('debug_status', status);
    selectorElement.setAttribute('debug_message', JSON.stringify(messages));

    if (printToLogs) {
        console.group(`[ProductPurchaseTypeSelector] Validation Output`);
        console.log('Status:', status);
        console.log('Messages:', messages);
        console.groupEnd();
    }

    return { status, messages };
}
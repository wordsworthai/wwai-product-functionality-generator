import { SELECTORS } from '../constants/selector-constants';

export function validateProductCustomSubmitInterceptor(selectorElement, printToLogs = false) {
    const messages = [];
    let hasError = false;

    const atcSelector = selectorElement.querySelector(SELECTORS.PRODUCT_GROUP.ADD_TO_CART);

    // Rule 1: Ensure ATC selector exists
    if (!atcSelector) {
        hasError = true;
        messages.push('❌ Missing <${ADD_TO_CART_SELECTOR}> inside submit interceptor.');
    }

    const status = hasError ? 'error' : 'valid';
    selectorElement.setAttribute('debug_status', status);
    selectorElement.setAttribute('debug_message', JSON.stringify(messages));

    if (printToLogs) {
        console.group('[ProductCustomSubmitInterceptor] Validation Output');
        console.log('Status:', status);
        console.log('Messages:', messages);
        console.groupEnd();
    }
    return { status, messages };
}
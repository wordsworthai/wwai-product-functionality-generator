export function validateProductGridIconSmartSubscriptionButton(element,  printToLogs = false) {
    const messages = [];
    let hasError = false;

    // ✅ Check if the immediate child is a <button>
    const buttonEl = element.querySelector(':scope > button');

    if (!buttonEl) {
        hasError = true;
        messages.push(`⚠️ Expected an immediate child <button> element inside <${element.tagName.toLowerCase()}>`);
    } else {
        // ✅ Check for icon representation (no inner text)
        const hasInnerText = buttonEl.textContent.trim().length > 0;
        if (hasInnerText) {
        hasError = true;
        messages.push(`⚠️ Button should not contain text, only an icon.`);
        }
    }

    // ✅ Set debug attributes
    const status = hasError ? 'error' : 'valid';
    element.setAttribute('debug_status', status);
    element.setAttribute('debug_message', JSON.stringify(messages));

    if (printToLogs) {
        console.group(`[ProductGridIconSmartSubscriptionButton] Validation Output`);
        console.log('Status:', status);
        console.log('Messages:', messages);
        console.groupEnd();
    }

    return { status, messages };
}
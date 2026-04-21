import { 
    ADD_TO_CART_HIDDEN_INPUTS, 
    ADD_TO_CART_BUTTON_DATA_ATTRS 
  } from '../constants/elements/add-to-cart-constants.js';
  
export function validateCustomAddToCartButton(selectorElement, printToLogs = false) {
    const messages = [];
    let hasError = false;
    let hasWarning = false;

    const form = selectorElement.querySelector("form");
    if (!form) {
        hasError = true;
        messages.push("❌ No <form> found inside <product-custom-add-to-cart-button>.");
    } else {
        // ✅ Step 1: Check required hidden inputs
        const foundNames = new Set();
        const hiddenInputs = Array.from(form.querySelectorAll('input'));

        hiddenInputs.forEach(input => {
        const name = input.getAttribute("name");
        if (name) {
            if (foundNames.has(name)) {
            hasError = true;
            messages.push(`❌ Duplicate hidden input name: "${name}"`);
            }
            foundNames.add(name);
        }
        });

        ADD_TO_CART_HIDDEN_INPUTS.forEach(({ name, label }) => {
        const input = form.querySelector(`input[name="${name}"]`);
        if (!input) {
            hasError = true;
            messages.push(`❌ Missing hidden input for: ${label} (name="${name}")`);
        }
        });

        // ✅ Step 2: Check for submit button
        const button = form.querySelector('button[type="submit"]');
        if (!button) {
        hasError = true;
        messages.push("❌ No <button type='submit'> found inside form.");
        } else {
        // ✅ Step 3: Check for span placeholders
        const addToCartText = button.querySelector(`[${ADD_TO_CART_BUTTON_DATA_ATTRS.ADD_TO_CART_TEXT}]`);
        const soldOutText = button.querySelector(`[${ADD_TO_CART_BUTTON_DATA_ATTRS.SOLD_OUT_TEXT}]`);

        if (!addToCartText || !soldOutText) {
            hasWarning = true;
            messages.push("⚠️ Missing span(s) inside button: " +
            `${!addToCartText ? `[${ADD_TO_CART_BUTTON_DATA_ATTRS.ADD_TO_CART_TEXT}] ` : ""}` +
            `${!soldOutText ? `[${ADD_TO_CART_BUTTON_DATA_ATTRS.SOLD_OUT_TEXT}]` : ""}`);
        }
        }
    }

    const status = hasError ? 'error' : hasWarning ? 'warning' : 'valid';
    selectorElement.setAttribute('debug_status', status);
    selectorElement.setAttribute('debug_message', JSON.stringify(messages));

    if (printToLogs) {
        console.group(`[AddToCartButton Validation]`);
        console.log('Status:', status);
        console.log('Messages:', messages);
        console.groupEnd();    
    }

    return { status, messages };
}
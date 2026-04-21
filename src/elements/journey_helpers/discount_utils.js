async function validateDiscountCode(code) {
    try {
        const shopify_features_script = document.querySelector("script[id='shopify-features']");
        const shopify_features_json = JSON.parse(shopify_features_script.innerHTML);
        const cart = await fetch(`${Shopify.routes.root}cart.js`).then(response => response.json());

        const headers = {
            Authorization: 'Basic ' + btoa(shopify_features_json.accessToken),
            Accept: '*/*',
            'Content-Type': 'application/json',
        };

        const body = {
            checkout: {
                line_items: cart.items,
                discount_code: code,
                country: Shopify.country,
                presentment_currency: cart.currency,
            },
        };

        const response = await fetch('/wallets/checkouts/', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
            referrerPolicy: 'no-referrer',
        });

        const data = await response.json();

        if (data.errors && data.errors.discount_code) {
            return { isValid: false, error: data.errors.discount_code[0].message };
        }

        return { isValid: true };
    } catch (error) {
        console.error("WWAI-ERROR Error in validateDiscountCode:", error);
        return { isValid: false, error: "Unable to validate discount code" };
    }
}

  
async function activateDiscountUsingDiscountEndpoint(code) {
    try {
        const response = await fetch(`/discount/${code}`);
        const html = await response.text();
        return { success: true, html: html };
    } catch (error) {
        console.error("WWAI-ERROR Discount activation failed (/discount):", error);
        return { success: false, error: "Unable to activate discount" };
    }
}


export async function applyDiscountCode(code, should_validate = true) {
    try {
        // Step 1: Validate the discount code if required
        if (should_validate) {
            const validationResult = await validateDiscountCode(code);
            if (!validationResult.isValid) {
                console.error(`WWAI-ERROR Failed to activate discount code "${code}" because: ${validationResult.error}`);
                return;
            }
        }

        // Step 2: Apply the discount code
        const activationResult = await activateDiscountUsingDiscountEndpoint(code);

        if (activationResult.success) {
            console.log(`Discount code "${code}" activated successfully.`);
        } else {
            console.error(`WWAI-ERROR Failed to activate discount code "${code}" because: ${activationResult.error}`);
        }

    } catch (error) {
        console.error(`WWAI-ERROR Error activating discount code "${code}":`, error);
    }
}

// Global store for applied discount codes in this session
window.__wwai_discount_codes_applied = window.__wwai_discount_codes_applied || new Set();
export async function applyDiscountCodeOnce(code, should_validate = true) {
  const trimmedCode = code.trim().toUpperCase(); // Normalize

  if (window.__wwai_discount_codes_applied.has(trimmedCode)) {
    console.warn(`Discount code "${trimmedCode}" has already been applied.`);
    return;
  }

  try {
    await applyDiscountCode(trimmedCode, should_validate);
    window.__wwai_discount_codes_applied.add(trimmedCode); // Mark as applied
  } catch (error) {
    console.error(`WWAI-ERROR ❌ Error applying discount code "${trimmedCode}":`, error.message);
  }
}

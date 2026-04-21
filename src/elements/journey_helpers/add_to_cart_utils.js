import { addLoadingOverlay, removeLoadingOverlay} from './add_to_cart_loaders.js';
import { showTemporaryNotification} from './cart_added_notification.js';
import { openSideCart } from './side_cart_utils.js';
import { showPopup } from './show_popup.js';
import { redirectWithLoader } from './redirect_utils.js';

export function validateFlowConfig(config = {}) {
    const validLoaders = ["media-gallery", "add-to-cart-submit-button", "none"];
    const validDestinations = ["cart", "checkout", "side-cart", "redirect"];
    const errors = [];

    const validatedConfig = {
        loader: config.loader ?? "none",
        showSuccessNotification: config.showSuccessNotification ?? true,
        showErrorNotification: config.showErrorNotification ?? true,
        successNotificationMessage: config.successNotificationMessage ?? "🎉 Item(s) added to cart!",
        errorNotificationMessage: config.errorNotificationMessage ?? "❌ Something went wrong.",
        destination: config.destination ?? "cart",
        sideCartLabel: config.sideCartLabel ?? null,
        redirectUrl: config.redirectUrl ?? null,
        notificationOptions: config.notificationOptions ?? {},
        clearCartBeforeAddingItems: config.clearCartBeforeAddingItems ?? false,
        additionalItemsToAdd: config.additionalItemsToAdd ?? [],
    };

    if (config.loader != null && !validLoaders.includes(config.loader)) {
        errors.push(`Invalid loader value: "${config.loader}"`);
    }

    if (config.showSuccessNotification != null && typeof config.showSuccessNotification !== "boolean") {
        errors.push(`showSuccessNotification must be a boolean`);
    }

    if (config.showErrorNotification != null && typeof config.showErrorNotification !== "boolean") {
        errors.push(`showErrorNotification must be a boolean`);
    }

    if (config.destination != null && !validDestinations.includes(config.destination)) {
        errors.push(`Invalid destination value: "${config.destination}"`);
    }

    if (validatedConfig.destination === "side-cart" && typeof validatedConfig.sideCartLabel !== "string") {
        errors.push(`sideCartLabel must be defined as a string when destination is "side-cart"`);
    }

    return {
        isValid: errors.length === 0,
        errors,
        config: validatedConfig
    };
}

function maybeShowSuccessNotification(show, message, options = {}) {
    if (show) {
        showTemporaryNotification(message, 2000, options);
    }
}

function maybeShowErrorNotification(show, message, options = {}) {
    if (show) {
        showTemporaryNotification(message, 2000, options);
    }
}

/* Add items to Shopify cart */
function addItemsToCart(items, additionalItemsToAdd) {
    const startTime = performance.now();
    console.log("🛒 Starting addItemsToCart operation...");
    
    // Add additional items to the beginning of the array, so items show up at the top of the cart.
    // The items show up in descending order.
    const allItems = [...additionalItemsToAdd, ...items];
    
    const prepTime = performance.now();
    console.log(`⏱️ Step 1 - Prepare items array: ${(prepTime - startTime).toFixed(2)}ms`);
    
    const fetchStart = performance.now();
    return fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: allItems })  // ✅ fix here
    }).then(res => {
        const responseTime = performance.now();
        console.log(`⏱️ Step 2 - Network request: ${(responseTime - fetchStart).toFixed(2)}ms`);
        
        if (!res.ok) throw new Error("Add to cart failed");
        
        const parseStart = performance.now();
        return res.json().then(data => {
            const parseTime = performance.now();
            console.log(`⏱️ Step 3 - Parse response: ${(parseTime - parseStart).toFixed(2)}ms`);
            console.log(`⏱️ Total addItemsToCart time: ${(parseTime - startTime).toFixed(2)}ms`);
            return data;
        });
    });
}


async function handlePostAddJourney(
    destination, 
    sideCartLabel, 
    redirectUrl,
    useMock, 
    addToCartResponse,
    debugString,
    flowConfig,
    sectionId,
    productGroup
) {
    const mockPopupMessage = (label) => 
        `🛒 Product added to cart (mock mode) — ${label} redirect enabled.\n\n${debugString || ""}`;

    
    if (destination === "checkout") {
        if (useMock) {
            showPopup(mockPopupMessage("checkout"), "success", true);
        }
        else {
            window.location.href = "/checkout";
        }
    } else if (destination === "cart") {
        if (useMock) {
            showPopup(mockPopupMessage("cart"), "success", true);
        } else {
            window.location.href = "/cart";
        }
    }
    else if (destination === "redirect") {
        redirectWithLoader(
            redirectUrl, 
            flowConfig, 
            sectionId, 
            productGroup,
            useMock = false
        )
    }
    else if (destination === "side-cart") {
        await openSideCart(
            sideCartLabel, 
            addToCartResponse, 
            useMock,
            debugString
        );
    } else {
        console.warn(`⚠️ Unknown destination "${destination}"`);
    }
}

export function maybeCloseOptionsOverlay(sectionId, productGroup) {
    // Find the relevant variant selector
    const selector = document.querySelector(`product-custom-collection-options-overlay-selector[section_id="${sectionId}"][product_group="${productGroup}"]`);
    if (selector) {
        selector.closeOverlay();
    }
}

async function clearCart() {
    try {
      const response = await fetch('/cart/clear.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const error = await response.json();
        console.error('WWAI-ERROR ❌ Failed to clear cart:', error);
        return;
      }
  
      console.log('🧹 Cart cleared successfully');
    } catch (err) {
      console.error('WWAI-ERROR ❌ Error while clearing cart:', err);
    }
}  

export function extractDebugInfoAndCleanItems(items) {
    let debugString = `🛒 Total Items to Add: ${items.length}\n`;
  
    const cleanedItems = items.map((item, index) => {
      const dbg = item._debug || {};
      debugString += `• ${dbg.readableString || `Item ${index + 1}`} - Variant ID: ${dbg.variantId || "N/A"} - Qty: ${dbg.quantity || "N/A"} - Selling Plan: ${dbg.sellingPlan || "None"}\n`;
  
      const { _debug, ...cleaned } = item;
      return cleaned;
    });
  
    return { debugString, cleanedItems };
}

  
export async function handleCustomAddToCart(
    items, 
    flowConfig, 
    sectionId, 
    productGroup,
    useMock = false,
    triggerHandlerFn = null
) {
    const { debugString, cleanedItems } = extractDebugInfoAndCleanItems(items);
    console.log("🔍 Cart add debug string:", debugString);

    const startTime = performance.now();
    let stepTime = startTime;

    const { isValid, errors, config: validatedConfig } = validateFlowConfig(flowConfig);
    if (!isValid) {
        console.error("WWAI-ERROR ❌ Invalid flowConfig:", errors);
        return;
    }
    console.log(`⏱️ Step 1 - Config validation: ${(performance.now() - stepTime).toFixed(2)}ms`);
    stepTime = performance.now();

    const {
        loader,
        showSuccessNotification,
        showErrorNotification,
        successNotificationMessage,
        errorNotificationMessage,
        destination,
        sideCartLabel,
        redirectUrl,
        notificationOptions,
        clearCartBeforeAddingItems,
        additionalItemsToAdd
    } = validatedConfig;

    addLoadingOverlay(sectionId, productGroup, loader);
    console.log(`⏱️ Step 2 - Loading overlay: ${(performance.now() - stepTime).toFixed(2)}ms`);
    stepTime = performance.now();
    
    try {
      let response = null;
      if (!useMock) {
        if (destination === "checkout" && clearCartBeforeAddingItems) {
            const clearStart = performance.now();
            await clearCart();
            console.log(`⏱️ Step 3a - Clear cart: ${(performance.now() - clearStart).toFixed(2)}ms`);
        }
        const addStart = performance.now();
        if (destination != "redirect") {
            response = await addItemsToCart(cleanedItems, additionalItemsToAdd);
        }
        console.log(`⏱️ Step 3b - Add items to cart: ${(performance.now() - addStart).toFixed(2)}ms`);
      } else {
        // ⏳ Simulate network delay in mock mode
        const mockStart = performance.now();
        await new Promise(resolve => setTimeout(resolve, 600));
        console.log(`⏱️ Step 3c - Mock delay: ${(performance.now() - mockStart).toFixed(2)}ms`);
      }  
      console.log(`⏱️ Step 3 - Cart operation total: ${(performance.now() - stepTime).toFixed(2)}ms`);
      stepTime = performance.now();
    
      const notificationStart = performance.now();
      maybeShowSuccessNotification(showSuccessNotification, successNotificationMessage, notificationOptions);
      console.log(`⏱️ Step 4 - Success notification: ${(performance.now() - notificationStart).toFixed(2)}ms`);
      stepTime = performance.now();

      const journeyStart = performance.now();
      await handlePostAddJourney(
        destination, 
        sideCartLabel, 
        redirectUrl,
        useMock, 
        response,
        debugString,
        flowConfig,
        sectionId,
        productGroup
    );
      console.log(`⏱️ Step 5 - Post-add journey: ${(performance.now() - journeyStart).toFixed(2)}ms`);
      stepTime = performance.now();

    } catch (err) {
      console.error("WWAI-ERROR ❌ Failed to add to cart:", err);
      maybeShowErrorNotification(showErrorNotification, errorNotificationMessage || err.message, notificationOptions);
    } finally {
        const cleanupStart = performance.now();
        removeLoadingOverlay(sectionId, productGroup, loader);
        maybeCloseOptionsOverlay(sectionId, productGroup);
        if (typeof triggerHandlerFn === 'function') {
            triggerHandlerFn("addedToCart");
        }
        console.log(`⏱️ Step 6 - Cleanup: ${(performance.now() - cleanupStart).toFixed(2)}ms`);
        console.log(`⏱️ Total add to cart time: ${(performance.now() - startTime).toFixed(2)}ms`);
    }
}
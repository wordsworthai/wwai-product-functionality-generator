import {showTemporaryNotification} from './cart_added_notification.js';
import { validateFlowConfig, maybeCloseOptionsOverlay } from './add_to_cart_utils.js';
import { addLoadingOverlay, removeLoadingOverlay} from './add_to_cart_loaders.js';

export function redirect(path, newTab = false, mock = false) {
    if (!path || typeof path !== 'string') {
        console.error("WWAI-ERROR ❌ Invalid path specified for redirect.");
        return;
    }

    // If mock is enabled, just show a toast and exit.
    if (mock === true) {
        showTemporaryNotification(`You'll be redirected to: ${path}`, 3000);
        return;
    }

    if (newTab) {
        window.open(path, '_blank');
    } else {
        window.location.href = path;
    }
}

export function redirectWithLoader(
    path, 
    flowConfig, 
    sectionId, 
    productGroup,
    useMock = false
) {
    if (!path || typeof path !== 'string') {
        console.error("WWAI-ERROR ❌ Invalid path specified for redirect.");
        return;
    }

    const { isValid, errors, config: validatedConfig } = validateFlowConfig(flowConfig);
    if (!isValid) {
        console.error("WWAI-ERROR ❌ Invalid flowConfig:", errors);
        return;
    }

    addLoadingOverlay(sectionId, productGroup, validatedConfig.loader);
    maybeCloseOptionsOverlay(sectionId, productGroup);

    redirect(path, false, useMock);

    if (useMock) {
        console.log("🔄 Removing loading overlay:", sectionId, productGroup, validatedConfig.loader);
        setTimeout(() => {
            removeLoadingOverlay(sectionId, productGroup, validatedConfig.loader);
        }, 1000); // 1 second delay
    }
}
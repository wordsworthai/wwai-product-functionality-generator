export function injectAvailabilityStyles() {
    if (document.getElementById('wwai-smart-button-styles')) return;

    const style = document.createElement('style');
    style.id = 'wwai-smart-button-styles';
    style.textContent = `
        product-grid-smart-interaction-button-selector button.wwai-out-of-stock {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
        }

        product-grid-smart-interaction-button-selector .tooltip-wrapper {
        position: relative;
        display: inline-block;
        }

        product-grid-smart-interaction-button-selector .tooltip-wrapper::after {
        content: attr(data-tooltip);
        position: absolute;
        top: -30px;
        left: 0;
        background-color: #333;
        color: #fff;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 4px;
        white-space: nowrap;
        display: none;
        z-index: 1000;
        }

        product-grid-smart-interaction-button-selector .tooltip-wrapper:hover::after {
        display: block;
        }
    `;
    document.head.appendChild(style);
}

export function wrapButtonWithTooltip(button, tooltipText = "Out of stock") {
    const parent = button.parentElement;

    if (parent && parent.classList.contains('tooltip-wrapper')) {
        parent.setAttribute('data-tooltip', tooltipText);
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.classList.add('tooltip-wrapper');
    wrapper.setAttribute('data-tooltip', tooltipText);

    parent.replaceChild(wrapper, button);
    wrapper.appendChild(button);
}

export function applyAvailabilityState(button, isAvailable, tooltipText, disableBtn) {
    if (!button) {
        console.log("No button found when setting availability state");
        return;
    }
    console.log("setting availability state", isAvailable, tooltipText);

    if (isAvailable) {
        button.disabled = false;
        button.removeAttribute('data-tooltip');
        button.classList.remove('wwai-out-of-stock');
        return;
    }

    if (disableBtn) {
        wrapButtonWithTooltip(button, tooltipText);
        button.disabled = true;
        button.classList.add('wwai-out-of-stock');
    }
}
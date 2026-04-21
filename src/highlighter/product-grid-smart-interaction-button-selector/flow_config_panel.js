export function initializeFlowConfigHoverPanel(selectorElement) {
    if (!selectorElement) {
        console.error("WWAI-ERROR ❌ Selector element not found for hover panel initialization.");
        return;
    }

    // Create the hover panel if it doesn't exist
    let panelEl = document.querySelector('#wwai-flow-config-panel');
    if (!panelEl) {
        panelEl = document.createElement('div');
        panelEl.id = 'wwai-flow-config-panel';
        Object.assign(panelEl.style, {
            position: 'absolute',
            zIndex: '9999',
            background: '#333',
            color: '#fff',
            padding: '8px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'pre-line',
            display: 'none',
            maxWidth: '400px',
            overflowWrap: 'break-word',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
        });
        document.body.appendChild(panelEl);
    }

    // Event Listeners for Hover
    selectorElement.addEventListener('mouseover', (e) => {
        const preAddToCartFlowConfig = selectorElement.uxConfig?.preAddToCartFlowConfig;

        const journeyType = preAddToCartFlowConfig?.journeyType || '-';
        const postSelectionAction = preAddToCartFlowConfig?.postSelectionAction || '-';
        const overlayContents = Array.isArray(preAddToCartFlowConfig?.overlayContents)
          ? preAddToCartFlowConfig.overlayContents.join(', ')
          : '-';
      
        const displayText = `${journeyType} - ${postSelectionAction} | ${overlayContents}`;
        panelEl.textContent = `${displayText}`;
        panelEl.style.display = 'block';
    });

    selectorElement.addEventListener('mousemove', (e) => {
        const offset = 15;
        panelEl.style.left = `${e.pageX + offset}px`;
        panelEl.style.top = `${e.pageY + offset}px`;
    });

    selectorElement.addEventListener('mouseout', () => {
        panelEl.style.display = 'none';
    });
}

export function removeFlowConfigHoverPanel(selectorElement) {
    if (!selectorElement) {
        console.warn("⚠️ No selector element provided for panel removal.");
        return;
    }

    // Remove the hover panel if it exists
    const panelEl = document.getElementById('wwai-flow-config-panel');
    if (panelEl) {
        panelEl.remove();
        console.log("✅ Hover panel successfully removed from the DOM.");
    }

    // Detach event listeners from the selector element
    selectorElement.removeEventListener('mouseover', handleMouseOver);
    selectorElement.removeEventListener('mousemove', handleMouseMove);
    selectorElement.removeEventListener('mouseout', handleMouseOut);

    console.log("✅ Event listeners successfully removed.");
}

/**
 * Handler references for proper event removal
 */
function handleMouseOver() {}
function handleMouseMove() {}
function handleMouseOut() {}
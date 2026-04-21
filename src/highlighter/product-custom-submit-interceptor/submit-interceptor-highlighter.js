import { SELECTORS } from '../../constants/selector-constants';

export function highlightCustomSubmitInterceptor(selectorElement) {
    if (!selectorElement) return;

    // ✅ Check if tooltip exists, otherwise create it
    let tooltipEl = document.getElementById('wwai-submit-interceptor-tooltip');
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'wwai-submit-interceptor-tooltip';
        Object.assign(tooltipEl.style, {
        position: 'fixed',
        zIndex: '9999',
        background: '#333',
        color: '#fff',
        padding: '6px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        whiteSpace: 'pre-line',
        display: 'none',
        pointerEvents: 'none',
        maxWidth: '300px',
        });
        document.body.appendChild(tooltipEl);
    }

    const atcExists = !!selectorElement.querySelector(SELECTORS.PRODUCT_GROUP.ADD_TO_CART);
    const tooltipText = `Submit Interceptor\nATC Exists: ${atcExists ? '✅ Yes' : '❌ No'}`;

    selectorElement.style.outline = '2px solid orange';

    const mouseOver = (e) => {
        tooltipEl.textContent = tooltipText;
        tooltipEl.style.display = 'block';
        tooltipEl.style.transform = `translate(${e.clientX + 10}px, ${e.clientY + 10}px)`;
    };

    const mouseMove = (e) => {
        tooltipEl.style.transform = `translate(${e.clientX + 10}px, ${e.clientY + 10}px)`;
    };

    const mouseOut = () => {
        tooltipEl.style.display = 'none';
    };

    selectorElement._tooltipHandlers = { mouseOver, mouseMove, mouseOut };

    selectorElement.addEventListener('mouseover', mouseOver);
    selectorElement.addEventListener('mousemove', mouseMove);
    selectorElement.addEventListener('mouseout', mouseOut);
}

export function clearSubmitInterceptorHighlight(selectorElement) {
    if (!selectorElement) return;

    selectorElement.style.outline = '';

    const handlers = selectorElement._tooltipHandlers;
    if (handlers) {
        selectorElement.removeEventListener('mouseover', handlers.mouseOver);
        selectorElement.removeEventListener('mousemove', handlers.mouseMove);
        selectorElement.removeEventListener('mouseout', handlers.mouseOut);
        delete selectorElement._tooltipHandlers;
    }

    const tooltip = document.getElementById('wwai-submit-interceptor-tooltip');
    if (tooltip) tooltip.style.display = 'none';
}
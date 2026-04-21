import {
  VARIANT_ATTR_OPTION_TYPE,
  VARIANT_ATTR_PRODUCT_LABEL,
  VARIANT_ATTR_VARIANT_LABEL,
  VARIANT_ATTR_VARIANT_LABEL_LEVEL
} from '../../constants/elements/variant-selector-constants.js';


export function highlightTaggedVariantInputs(selectorElement) {
  const inputs = selectorElement.querySelectorAll('input[type="radio"]');

  // Create tooltip once
  let tooltipEl = document.querySelector('#wwai-debug-tooltip');
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'wwai-debug-tooltip';
    Object.assign(tooltipEl.style, {
      position: 'absolute',
      zIndex: '9999',
      background: '#333',
      color: '#fff',
      padding: '6px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      whiteSpace: 'pre-line',
      display: 'none'
    });
    document.body.appendChild(tooltipEl);
  }

  inputs.forEach(input => {
    const type = input.getAttribute(VARIANT_ATTR_OPTION_TYPE);
    const productLabel = input.getAttribute(VARIANT_ATTR_PRODUCT_LABEL) || '';
    const variantLabel = input.getAttribute(VARIANT_ATTR_VARIANT_LABEL) || '';
    const level = input.getAttribute(VARIANT_ATTR_VARIANT_LABEL_LEVEL) || '';

    const isProduct = type === 'product';
    const isVariant = type === 'product_variant';
    const hasValidProduct = Boolean(productLabel);
    const hasValidVariant = isProduct || (isVariant && variantLabel);

    let tooltip = '';
    if (isProduct) {
      tooltip = `Product Selector for "${productLabel}"`;
    } else if (isVariant) {
      tooltip = `Variant Selector for "${productLabel}"\n${level}: ${variantLabel}`;
    }

    const outlineColor = hasValidProduct && hasValidVariant ? '2px solid limegreen' : '2px solid red';
    input.style.outline = outlineColor;

    const label = selectorElement.querySelector(`label[for="${input.id}"]`);
    if (label) {
      label.style.outline = outlineColor;

      // Hover listeners on label
      label.addEventListener('mouseover', e => {
        tooltipEl.textContent = tooltip;
        tooltipEl.style.display = 'block';
        tooltipEl.style.left = `${e.pageX + 10}px`;
        tooltipEl.style.top = `${e.pageY + 10}px`;
      });
      label.addEventListener('mousemove', e => {
        tooltipEl.style.left = `${e.pageX + 10}px`;
        tooltipEl.style.top = `${e.pageY + 10}px`;
      });
      label.addEventListener('mouseout', () => {
        tooltipEl.style.display = 'none';
      });
    }

    // Hover listeners on input
    input.addEventListener('mouseover', e => {
      tooltipEl.textContent = tooltip;
      tooltipEl.style.display = 'block';
      tooltipEl.style.left = `${e.pageX + 10}px`;
      tooltipEl.style.top = `${e.pageY + 10}px`;
    });
    input.addEventListener('mousemove', e => {
      tooltipEl.style.left = `${e.pageX + 10}px`;
      tooltipEl.style.top = `${e.pageY + 10}px`;
    });
    input.addEventListener('mouseout', () => {
      tooltipEl.style.display = 'none';
    });
  });
}

export function clearHighlighting(selectorElement) {
  console.log("clearHighlighting called");
  const inputs = selectorElement.querySelectorAll('input[type="radio"]');

  inputs.forEach(input => {
    // Reset outline on input
    input.style.outline = '';

    // Clone and replace input to remove event listeners
    const cleanInput = input.cloneNode(true);
    input.replaceWith(cleanInput);

    // Reset label outline and event listeners
    const label = selectorElement.querySelector(`label[for="${input.id}"]`);
    if (label) {
      label.style.outline = '';

      const cleanLabel = label.cloneNode(true);
      label.replaceWith(cleanLabel);
    }
  });

  // Hide tooltip if it exists
  const tooltip = document.getElementById('wwai-debug-tooltip');
  if (tooltip) tooltip.style.display = 'none';

  selectorElement.initInputs();
  selectorElement.bindEvents(); // <-- re-attach event listeners to replaced inputs
}
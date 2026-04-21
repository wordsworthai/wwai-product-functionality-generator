import {
    PRICE_DATA_ATTRS,
    PRICE_LABEL_ATTR
  } from '../../constants/elements/price-selector-constants.js';
  
  import {
    VARIANT_TRIGGER_PRODUCT_LABEL_ATTR,
    VARIANT_TRIGGER_VARIANT_OPTION1_LABEL_ATTR,
    VARIANT_TRIGGER_VARIANT_OPTION2_LABEL_ATTR,
    VARIANT_TRIGGER_VARIANT_OPTION3_LABEL_ATTR
  } from '../../constants/elements/variant-trigger.js';
  
export function highlightStaticPriceSelector(staticPriceSelectorEl) {
    const selectorString = Object.values(PRICE_DATA_ATTRS)
      .map(attr => `[${attr}]`)
      .join(', ');
  
    const priceElements = staticPriceSelectorEl.querySelectorAll(selectorString);
  
    if (!priceElements.length) return;
  
    // Create tooltip element once
    let tooltipEl = document.getElementById('wwai-static-price-tooltip');
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'wwai-static-price-tooltip';
      Object.assign(tooltipEl.style, {
        position: 'absolute',
        zIndex: '9999',
        background: '#333',
        color: '#fff',
        padding: '6px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        whiteSpace: 'pre-line',
        display: 'none',
        pointerEvents: 'none'
      });
      document.body.appendChild(tooltipEl);
    }
  
    // Pull productLabel and variantOptions from the element
    const productLabel = staticPriceSelectorEl.getAttribute(VARIANT_TRIGGER_PRODUCT_LABEL_ATTR) || '(missing)';
    const variantOptions = {
      option1: staticPriceSelectorEl.getAttribute(VARIANT_TRIGGER_VARIANT_OPTION1_LABEL_ATTR),
      option2: staticPriceSelectorEl.getAttribute(VARIANT_TRIGGER_VARIANT_OPTION2_LABEL_ATTR),
      option3: staticPriceSelectorEl.getAttribute(VARIANT_TRIGGER_VARIANT_OPTION3_LABEL_ATTR),
    };
  
    const variantText = Object.entries(variantOptions)
      .filter(([_, val]) => val)
      .map(([key, val]) => `${key}: ${val}`)
      .join('\n');
  
    priceElements.forEach(el => {
      const label = el.getAttribute(PRICE_LABEL_ATTR) || '(missing)';
      let type = '';
  
      if (el.hasAttribute(PRICE_DATA_ATTRS.BEFORE)) type = 'beforePrice';
      else if (el.hasAttribute(PRICE_DATA_ATTRS.AFTER)) type = 'afterPrice';
      else if (el.hasAttribute(PRICE_DATA_ATTRS.DISCOUNT)) type = 'discountPercentage';
      else if (el.hasAttribute(PRICE_DATA_ATTRS.SAVINGS)) type = 'savings';
  
      const hasLabel = label !== '(missing)';
      el.style.outline = hasLabel ? '2px solid limegreen' : '2px solid red';
  
      const tooltipText = `Static Price Selector\nLabel: ${label}\nType: ${type}\nProduct: ${productLabel}\n${variantText}`;
  
      el.addEventListener('mouseover', e => {
        tooltipEl.textContent = tooltipText;
        tooltipEl.style.display = 'block';
        tooltipEl.style.left = `${e.pageX + 10}px`;
        tooltipEl.style.top = `${e.pageY + 10}px`;
      });
  
      el.addEventListener('mousemove', e => {
        tooltipEl.style.left = `${e.pageX + 10}px`;
        tooltipEl.style.top = `${e.pageY + 10}px`;
      });
  
      el.addEventListener('mouseout', () => {
        tooltipEl.style.display = 'none';
      });
    });
}

export function clearStaticPriceHighlighting(containerEl) {
    const selectorString = Object.values(PRICE_DATA_ATTRS)
        .map(attr => `[${attr}]`)
        .join(', ');

    const priceElements = containerEl.querySelectorAll(selectorString);

    priceElements.forEach(el => {
        el.style.outline = '';
        const clone = el.cloneNode(true);
        el.replaceWith(clone); // remove event listeners
    });

    const tooltip = document.getElementById('wwai-static-price-tooltip');
    if (tooltip) tooltip.style.display = 'none';
}
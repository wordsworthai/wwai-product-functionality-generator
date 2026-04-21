import {
    SUBSCRIPTION_FREQUENCY_SELECTOR
  } from '../../constants/elements/subscription-frequency-selector-constants.js';
import {
    VARIANT_TRIGGER_PRODUCT_LABEL_ATTR,
    VARIANT_TRIGGER_VARIANT_OPTION1_LABEL_ATTR,
    VARIANT_TRIGGER_VARIANT_OPTION2_LABEL_ATTR,
    VARIANT_TRIGGER_VARIANT_OPTION3_LABEL_ATTR
  } from '../../constants/elements/variant-trigger.js';
  
  export function highlightStaticSubscriptionFrequencySelect(selectorElement) {
    const select = selectorElement.querySelector(SUBSCRIPTION_FREQUENCY_SELECTOR);
    if (!select) return;
  
    let tooltipEl = document.getElementById('wwai-static-subscription-tooltip');
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'wwai-static-subscription-tooltip';
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
  
    const productLabel = selectorElement.getAttribute(VARIANT_TRIGGER_PRODUCT_LABEL_ATTR) || '[no product label]';
  
    const variantOptions = {
      option1: selectorElement.getAttribute(VARIANT_TRIGGER_VARIANT_OPTION1_LABEL_ATTR),
      option2: selectorElement.getAttribute(VARIANT_TRIGGER_VARIANT_OPTION2_LABEL_ATTR),
      option3: selectorElement.getAttribute(VARIANT_TRIGGER_VARIANT_OPTION3_LABEL_ATTR)
    };
  
    const optionsText = Object.entries(variantOptions)
      .filter(([_, val]) => !!val)
      .map(([key, val]) => `${key}: ${val}`)
      .join('\n') || '[no variant options]';
  
    const optionCount = select.querySelectorAll('option').length;
    const tooltipText = `Static Subscription Frequency Selector\nProduct: ${productLabel}\n${optionsText}\nOptions: ${optionCount}`;
  
    select.style.outline = '2px solid orange';
  
    const mouseOverHandler = () => {
      const rect = select.getBoundingClientRect();
      tooltipEl.textContent = tooltipText;
      tooltipEl.style.left = `${rect.left + window.scrollX}px`;
      tooltipEl.style.top = `${rect.bottom + window.scrollY + 6}px`;
      tooltipEl.style.display = 'block';
    };
  
    const mouseOutHandler = () => {
      tooltipEl.style.display = 'none';
    };
  
    select._tooltipHandlers = { mouseOverHandler, mouseOutHandler };
  
    select.addEventListener('mouseover', mouseOverHandler);
    select.addEventListener('mouseout', mouseOutHandler);
  }

  export function clearStaticSubscriptionFrequencyHighlight(selectorElement) {
    const select = selectorElement.querySelector('select');
    if (!select) return;
  
    select.style.outline = '';
  
    const handlers = select._tooltipHandlers;
    if (handlers) {
      select.removeEventListener('mouseover', handlers.mouseOverHandler);
      select.removeEventListener('mouseout', handlers.mouseOutHandler);
      delete select._tooltipHandlers;
    }
  
    const tooltip = document.getElementById('wwai-static-subscription-tooltip');
    if (tooltip) tooltip.style.display = 'none';
  }  
  
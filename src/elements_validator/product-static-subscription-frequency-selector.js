import {
    VARIANT_TRIGGER_PRODUCT_LABEL_ATTR,
    VARIANT_TRIGGER_VARIANT_OPTION1_LABEL_ATTR,
    VARIANT_TRIGGER_VARIANT_OPTION2_LABEL_ATTR,
    VARIANT_TRIGGER_VARIANT_OPTION3_LABEL_ATTR
} from '../constants/elements/variant-trigger.js';``
  
export function validateStaticSubscriptionFrequencySelector(selectorElement, printToLogs = false) {
    const messages = [];
    let hasError = false;
  
    const selectEls = selectorElement.querySelectorAll('select');
  
    if (selectEls.length === 0) {
      hasError = true;
      messages.push(`Missing <select> element inside static frequency selector`);
    } else if (selectEls.length > 1) {
      hasError = true;
      messages.push(`Multiple <select> elements found (${selectEls.length}) — only one allowed.`);
    }
  
    const selectEl = selectEls[0];
  
    if (selectEl) {
      if (selectEl.tagName.toLowerCase() !== 'select') {
        hasError = true;
        messages.push(`Expected a <select> element but found <${selectEl.tagName.toLowerCase()}>`);
      }
  
      const name = selectEl.getAttribute('name');
      if (!name) {
        hasError = true;
        messages.push(`Select element must have a "name" attribute`);
      } else {
        const allNamedElements = document.querySelectorAll(`input[name="${name}"], select[name="${name}"]`);
        const conflicts = Array.from(allNamedElements).filter(el => el !== selectEl);
  
        if (conflicts.length > 0) {
          hasError = true;
          messages.push(`Name "${name}" is not unique — found ${conflicts.length} other input/select(s) using this name`);
        }
      }
    }
  
    const productLabel = selectorElement.getAttribute(VARIANT_TRIGGER_PRODUCT_LABEL_ATTR);
    if (!productLabel) {
      hasError = true;
      messages.push(`Missing required attribute [${VARIANT_TRIGGER_PRODUCT_LABEL_ATTR}]`);
    }
  
    const option1 = selectorElement.getAttribute(VARIANT_TRIGGER_VARIANT_OPTION1_LABEL_ATTR);
    const option2 = selectorElement.getAttribute(VARIANT_TRIGGER_VARIANT_OPTION2_LABEL_ATTR);
    const option3 = selectorElement.getAttribute(VARIANT_TRIGGER_VARIANT_OPTION3_LABEL_ATTR);
  
    if (!option1 && !option2 && !option3) {
      hasError = true;
      messages.push(`At least one variant option attribute must be defined ([${VARIANT_TRIGGER_VARIANT_OPTION1_LABEL_ATTR}], etc.)`);
    }
  
    const status = hasError ? 'error' : 'valid';
  
    selectorElement.setAttribute('debug_status', status);
    selectorElement.setAttribute('debug_message', JSON.stringify(messages));
  
    if (printToLogs) {
      console.group(`[ProductStaticSubscriptionFrequencySelector] Validation Output`);
      console.log('Status:', status);
      console.log('Messages:', messages);
      console.groupEnd();
    }
  
    return { status, messages };
}  
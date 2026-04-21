import { 
    PRICE_LABEL_ATTR, 
    PRICE_DATA_ATTRS, 
    PRICE_WRAPPER_ATTRS 
  } from '../constants/elements/price-selector-constants.js';
  
  function buildDetailedLabelPresenceMap(elements) {
    const map = {};
    elements.forEach(el => {
      const label = el.getAttribute(PRICE_LABEL_ATTR)?.trim();
      if (!label) return;
  
      if (!map[label]) {
        map[label] = { beforeCount: 0, afterCount: 0, discountCount: 0 };
      }
  
      if (el.hasAttribute(PRICE_DATA_ATTRS.BEFORE)) map[label].beforeCount += 1;
      if (el.hasAttribute(PRICE_DATA_ATTRS.AFTER)) map[label].afterCount += 1;
      if (el.hasAttribute(PRICE_DATA_ATTRS.DISCOUNT)) map[label].discountCount += 1;
    });
  
    return map;
  }
  
  function validateAllElementsHaveLabels(elements, context) {
    const messages = [];
    elements.forEach((el, idx) => {
      const label = el.getAttribute(PRICE_LABEL_ATTR)?.trim();
      if (!label) {
        const debugInfo = el.outerHTML.split('\n')[0].trim().slice(0, 100);
        messages.push(`Element ${idx} inside ${context} is missing required ${PRICE_LABEL_ATTR}: ${debugInfo}...`);
      }
    });
    return messages;
  }
  
  function validateWrapperPresence(label, containerEl) {
    const messages = [];
    let hasWarning = false;
  
    const rules = [
      { type: 'before', el: PRICE_DATA_ATTRS.BEFORE, wrapper: PRICE_WRAPPER_ATTRS.BEFORE },
      { type: 'after', el: PRICE_DATA_ATTRS.AFTER, wrapper: PRICE_WRAPPER_ATTRS.AFTER },
      { type: 'discount', el: PRICE_DATA_ATTRS.DISCOUNT, wrapper: PRICE_WRAPPER_ATTRS.DISCOUNT }
    ];
  
    for (const { type, el, wrapper } of rules) {
      const target = containerEl.querySelector(`[${el}][${PRICE_LABEL_ATTR}="${label}"]`);
      if (target && !target.closest(`[${wrapper}]`)) {
        hasWarning = true;
        messages.push(`Label "${label}" has ${type} element not inside [${wrapper}]`);
      }
    }
  
    return { hasWarning, messages };
  }
  
  function validateLabelEntry(label, counts, containerEl) {
    const { beforeCount, afterCount, discountCount } = counts;
    const messages = [];
    let hasError = false;
    let hasWarning = false;
  
    if (beforeCount > 1 || afterCount > 1) {
      hasError = true;
      messages.push(`Label "${label}" has multiple elements: ${[
        beforeCount > 1 ? `beforePrice (${beforeCount})` : null,
        afterCount > 1 ? `afterPrice (${afterCount})` : null
      ].filter(Boolean).join(', ')}`);
    }
  
    if (beforeCount === 0 && afterCount === 0) {
      hasError = true;
      messages.push(`Label "${label}" is missing both beforePrice and afterPrice`);
    } else if (beforeCount === 0 || afterCount === 0) {
      hasWarning = true;
      messages.push(`Label "${label}" is missing: ${[
        beforeCount === 0 ? 'beforePrice' : null,
        afterCount === 0 ? 'afterPrice' : null
      ].filter(Boolean).join(', ')}`);
    }
  
    if (discountCount > 1) {
      hasError = true;
      messages.push(`Label "${label}" has multiple discountPercentage elements (${discountCount})`);
    }
  
    const wrapperIssues = validateWrapperPresence(label, containerEl);
    messages.push(...wrapperIssues.messages);
    if (wrapperIssues.hasWarning) hasWarning = true;
  
    return { hasError, hasWarning, messages };
  }
  
  function validateLabelMap(labelMap, containerEl) {
    const messages = [];
    let hasError = false;
    let hasWarning = false;
  
    for (const [label, counts] of Object.entries(labelMap)) {
      const result = validateLabelEntry(label, counts, containerEl);
      messages.push(...result.messages);
      if (result.hasError) hasError = true;
      if (result.hasWarning) hasWarning = true;
    }
  
    const status = hasError ? 'error' : hasWarning ? 'warning' : 'valid';
    return { status, messages };
  }
  
  function getValidationStatusForStaticSelector(containerEl, context = '<product-static-price-selector>') {
    const elementsWithAnyLabelAttr = containerEl.querySelectorAll(
      `[${PRICE_LABEL_ATTR}], [${PRICE_DATA_ATTRS.BEFORE}], [${PRICE_DATA_ATTRS.AFTER}], [${PRICE_DATA_ATTRS.DISCOUNT}]`
    );
    const elementsWithLabels = containerEl.querySelectorAll(`[${PRICE_LABEL_ATTR}]`);
    const messages = [];
  
    const labelIssues = validateAllElementsHaveLabels(elementsWithAnyLabelAttr, context);
    const hasLabelErrors = labelIssues.length > 0;
    messages.push(...labelIssues);
  
    if (!elementsWithLabels.length) {
      messages.push(`No price-labeled elements found inside ${context}`);
      return { status: 'none', messages };
    }
  
    const labelMap = buildDetailedLabelPresenceMap(elementsWithLabels);
    const { messages: validationMessages, status: downstreamStatus } = validateLabelMap(labelMap, containerEl);
    messages.push(...validationMessages);
  
    const finalStatus = hasLabelErrors ? 'error' : downstreamStatus;
    return { status: finalStatus, messages };
  }
  
export function validateStaticPriceSelector(selectorElement, printToLogs = false) {
    const { status, messages } = getValidationStatusForStaticSelector(selectorElement, '<product-static-price-selector>');

    if (printToLogs) {
        console.group('[ProductStaticPriceSelector] Validation Output');
        console.log('Status:', status);
        console.log('Messages:', messages);
        console.groupEnd();
    }

    selectorElement.setAttribute('debug_status', status);
    selectorElement.setAttribute('debug_message', JSON.stringify(messages));
}
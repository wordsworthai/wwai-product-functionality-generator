function isShopifySectionUsingTimestamps() {
    const ids = Array.from(document.querySelectorAll('[id^="shopify-section-template--"]')).map(el => el.id);
    return ids.some(id => /shopify-section-template--\d+__/.test(id));
}

function normalizeWwaiActionButtons(originalConfig) {
    const stripTimestamp = (id) =>
      id.replace(/shopify-section-template--\d+__/, 'shopify-section-template--');
  
    const normalizeXPath = (xpath) =>
      xpath.replace(/\/\/div\[@id="shopify-section-template--\d+__([^"]+)"\]/g, (_, idPart) =>
        `//div[@id="shopify-section-template--${idPart}"]`
      );
  
    const normalizedConfig = {};
  
    for (const [xpath, config] of Object.entries(originalConfig)) {
      const newXPath = normalizeXPath(xpath);
      const newValue = (config.actionType === 'scroll-to' && typeof config.value === 'string')
        ? stripTimestamp(config.value)
        : config.value;
  
      normalizedConfig[newXPath] = {
        actionType: config.actionType,
        value: newValue,
      };
    }
  
    return normalizedConfig;
}

export function applyWwaiActions() {
    const original = window.__WWAI__?.WWAI_ACTION_BUTTONS || {};
    let isTimestamped = true;
    // On prod, we dont use timestamped mode. On local and sandbox testing
    // we do.
    if (window.__WWAI__.deployMode === "prod") {
      // When we push to client store, the main section will have timestamp
      // wwai sections will not have timestamp
      // So we check the occurence of atleast one section which does not have timestamp.
      isTimestamped = false;
    }
    const config = isTimestamped ? original : normalizeWwaiActionButtons(original);
    console.log("ACTION_BUTTONS: Applying actions:", config);
    const getElementByXPath = (xpath) => {
      try {
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue;
      } catch (e) {
        console.warn('ACTION_BUTTONS: Invalid XPath:', xpath);  
        return null;
      }
    };
  
    Object.entries(config).forEach(([xpath, { actionType, value }]) => {
      const el = getElementByXPath(xpath);
      if (!el) {
        console.log("ACTION_BUTTONS: No element found for xpath:", xpath);
        return;
      };
  
      const shouldSkip = () => window.wwaiIsButtonHighlightingActive?.() === true;
      if (shouldSkip()) {
        console.log("ACTION_BUTTONS: Skipping action:", actionType, value);
        return;
      }
      else {
        console.log("ACTION_BUTTONS: Applying action:", actionType, value);
      }
  
      if (actionType === 'no-action') {
        el.setAttribute('href', 'javascript:void(0)');
        el.onclick = (e) => {
          if (shouldSkip()) return;
          e.preventDefault();
        };
      } else if (actionType === 'custom-url') {
        el.setAttribute('href', value);
        el.onclick = (e) => {
          if (shouldSkip()) return;
          // Let href proceed naturally, or force window.location if needed
        };
      } else if (actionType === 'scroll-to') {
        el.setAttribute('href', 'javascript:void(0)');
        el.onclick = (e) => {
          if (shouldSkip()) return;
          e.preventDefault();
          const target = document.getElementById(value);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        };
      }
    });
}  
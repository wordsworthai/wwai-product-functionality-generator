import { SELECTORS } from '../constants/selector-constants.js';
import { getElementsForSelectorInGroup } from './registry-utils.js';

export function initFlowConfigForGroup({
    sectionId,
    productGroup,
    flowConfig = {}
  }) {

    Object.values(SELECTORS.PRODUCT_GROUP).forEach(selector => {
      const elements = getElementsForSelectorInGroup(sectionId, productGroup, selector);
      if (!elements.length) {
        // Only warn if you want to see missing selectors
        // console.warn(`⚠️ No elements found for selector="${selector}"`);
        return;
      }
      elements.forEach((el, index) => {
        if (typeof el.initFlowConfig === 'function') {
          try {
            el.initFlowConfig(flowConfig);
          } catch (err) {
            console.error(`WWAI-ERROR ❌ Error initializing flow config for [${selector} - index ${index}]`, err);
          }
        }
      });
    });
}

export function initUXConfigForGroup({
    sectionId,
    productGroup,
    uxConfig = {}
  }) {

    Object.values(SELECTORS.PRODUCT_GROUP).forEach(selector => {
      const elements = getElementsForSelectorInGroup(sectionId, productGroup, selector);
      if (!elements.length) {
        // Only warn if you want to see missing selectors
        // console.warn(`⚠️ No elements found for selector="${selector}"`);
        return;
      }
      elements.forEach((el, index) => {
        if (typeof el.initUXConfig === 'function') {
          try {
            el.initUXConfig(uxConfig);
          } catch (err) {
            console.error(`WWAI-ERROR ❌ Error initializing UX config for [${selector} - index ${index}]`, err);
          }
        }
      });
    });
}

export function initPricingConfigForGroup({
    sectionId,
    productGroup,
    pricingConfig = {}
  }) {
    Object.values(SELECTORS.PRODUCT_GROUP).forEach(selector => {
      const elements = getElementsForSelectorInGroup(sectionId, productGroup, selector);
      if (!elements.length) {
        // Only warn if you want to see missing selectors
        // console.warn(`⚠️ No elements found for selector="${selector}"`);
        return;
      }
      elements.forEach((el, index) => {
        if (typeof el.initPricingConfig === 'function') {
          try {
            el.initPricingConfig(pricingConfig);
          } catch (err) {
            console.error(`WWAI-ERROR ❌ Error initializing Pricing config for [${selector} - index ${index}]`, err);
          }
        }
      });
    });
}

export function initAllConfigsForGroup({ sectionId, productGroup, config = {} }) {
  console.log(`🔄 Initializing Config for [${sectionId} / ${productGroup}]`);
    initFlowConfigForGroup({
        sectionId,
        productGroup,
        flowConfig: config.flowConfig,
    });
    initUXConfigForGroup({
        sectionId,
        productGroup,
        uxConfig: config.uxConfig,
    });
    initPricingConfigForGroup({
        sectionId,
        productGroup,
        pricingConfig: config.pricingConfig,
    });
} 
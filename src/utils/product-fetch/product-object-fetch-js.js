import { productConnectors } from './product-connectors.js';
import { getWWAIConfig } from "../../wwai_config.js";

function getOrCreateStoreData({ createIfMissing = false } = {}) {
  if (!window.__WWAI__SECTION_PRODUCT_DATA__) {
    if (createIfMissing) {
      window.__WWAI__SECTION_PRODUCT_DATA__ = {};
    } else {
      throw new Error("window.__WWAI__SECTION_PRODUCT_DATA__ not found.");
    }
  }

  if (!window.__WWAI__SECTION_PRODUCT_DATA__["all_sections"]) {
    if (createIfMissing) {
      window.__WWAI__SECTION_PRODUCT_DATA__["all_sections"] = {};
    } else {
      throw new Error("window.__WWAI__SECTION_PRODUCT_DATA__['all_sections'] not found.");
    }
  }

  if (!window.__WWAI__SECTION_PRODUCT_DATA__["all_sections"].storeData) {
    if (createIfMissing) {
      window.__WWAI__SECTION_PRODUCT_DATA__["all_sections"].storeData = {
        productGroups: {},
        variantSellingPlans: {},
        variantSubscriptionMapping: {}
      };
    } else {
      throw new Error("SECTION_DATA.storeData not initialized. Make sure Liquid block ran before this.");
    }
  }

  return window.__WWAI__SECTION_PRODUCT_DATA__["all_sections"].storeData;
}


function summarizeStoreData(storeData) {
  let groupCount = 0;
  let totalLabels = 0;

  Object.entries(storeData.productGroups || {}).forEach(([group, labelMap]) => {
    groupCount++;
    totalLabels += Object.keys(labelMap).length;
  });

  return {
    groupCount,
    totalLabels
  };
}


function prepareFetchList(productGroupMap, storeData) {
  const toFetch = new Set();
  const grouped = {};

  Object.entries(productGroupMap).forEach(([group, labelToHandle]) => {
    storeData.productGroups[group] = storeData.productGroups[group] || {};
    grouped[group] = [];

    Object.entries(labelToHandle).forEach(([label, handle]) => {
      if (!storeData.productGroups[group][label]) {
        grouped[group].push({ label, handle });
        toFetch.add(handle);
      } else {
        console.info(`Skipping already loaded: [${group}] ${label} (${handle})`);
      }
    });
  });

  return { toFetch, grouped };
}


function fetchProductData(handles, connectorType = 'mock') {
  const connector = productConnectors[connectorType];

  if (!connector) {
    throw new Error(`❌ Unknown connector type: "${connectorType}"`);
  }

  return Promise.all(handles.map(handle => connector(handle)));
}


function buildHandleToProductMap(products) {
  const map = {};
  products.forEach(p => { if (p) map[p.handle] = p; });
  return map;
}

function hydrateStoreObjects({ grouped, handleToProduct, storeData }) {
  window.__WWAI_PRODUCT_AVAILABILITY__ = window.__WWAI_PRODUCT_AVAILABILITY__ || {};

  Object.entries(grouped).forEach(([group, entries]) => {
    entries.forEach(({ label, handle }) => {
      const product = handleToProduct[handle];
      const key = `${group}__${label}`;

      if (product) {
        storeData.productGroups[group][label] = product;
        storeData.variantSellingPlans[key] = {
          variants: product.variants || [],
          selling_plan_groups: product.selling_plan_groups || []
        };

        storeData.variantSubscriptionMapping = storeData.variantSubscriptionMapping || {};
        storeData.variantSubscriptionMapping[key] = {}; // populate later

        window.__WWAI_PRODUCT_AVAILABILITY__[handle] = true;
        console.log(`✅ Loaded: Product using connector ${getWWAIConfig().CONNECTOR_TYPE} - ${handle}`);
      } else {
        window.__WWAI_PRODUCT_AVAILABILITY__[handle] = false;
        console.warn(`⚠️ Failed to fetch: ${handle}`);
      }
    });
  });
}

export function checkJSProductMappingPresence(has_js_loaded_products) {
  if (
    typeof getWWAIConfig().JS_PRODUCT_MAPPING_OBJECT === 'object' && getWWAIConfig().JS_PRODUCT_MAPPING_OBJECT !== null &&
    Object.keys(getWWAIConfig().JS_PRODUCT_MAPPING_OBJECT
).length > 0
  ) {
    console.log('Using preloaded getWWAIConfig().JS_PRODUCT_MAPPING_OBJECT to hydrate via JS.');
    // console.log(JSON.stringify(getWWAIConfig().JS_PRODUCT_MAPPING_OBJECT , null, 2));
    return getWWAIConfig().JS_PRODUCT_MAPPING_OBJECT;
  }
  
  if (
    typeof jsObj === 'object' &&
    jsObj !== null &&
    Object.keys(jsObj).length === 0
  ) {
    if (has_js_loaded_products) {
      console.warn('⚠️ getWWAIConfig().JS_PRODUCT_MAPPING_OBJECT is defined but empty.');
      console.warn('💡 This likely means your JS assignment didn’t populate product mappings correctly.');
    }
    return {};
  }
    
  console.error('WWAI-ERROR [ERROR]: getWWAIConfig().JS_PRODUCT_MAPPING_OBJECT is undefined');
  return {};
}


export function hydrateStoreDataFromProductMap(connectorType, has_js_loaded_products) {
  const jsMapping = checkJSProductMappingPresence(has_js_loaded_products);
  if (Object.keys(jsMapping).length == 0) {
    return;
  }
   
  const storeData = getOrCreateStoreData({ createIfMissing: connectorType == 'mock' });
  const beforeSummary = summarizeStoreData(storeData);
  // console.log("Before hydration:", beforeSummary);

  const { toFetch, grouped } = prepareFetchList(jsMapping, storeData);
  const uniqueHandles = [...toFetch];
  // console.log("uniqueHandles:", uniqueHandles);

  return fetchProductData(uniqueHandles, connectorType).then(products => {
    const handleToProduct = buildHandleToProductMap(products);
    hydrateStoreObjects({ grouped, handleToProduct, storeData });

    const afterSummary = summarizeStoreData(storeData);
    // console.log("After hydration:", afterSummary);

    const hydratedLabels = afterSummary.totalLabels - beforeSummary.totalLabels;
    console.log(`Hydrated ${hydratedLabels} new product label(s) across ${afterSummary.groupCount} group(s).`);
  });
}
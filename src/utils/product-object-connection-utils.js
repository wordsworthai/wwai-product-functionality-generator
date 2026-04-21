import {
  VARIANT_ATTR_OPTION_TYPE, 
  VARIANT_OPTION_TYPE_VALUES, 
  VARIANT_ATTR_PRODUCT_LABEL
} from '../constants/elements/variant-selector-constants.js';
import { SELECTORS } from '../constants/selector-constants.js';

export function getProductMappingJSON(selectorElement) {
  const productGroup = selectorElement.getAttribute('product_group');
  const helperHandle = selectorElement.getAttribute('product-helper-handle');

  if (!productGroup || !helperHandle) {
    console.warn(`[getProductMappingJSON] Missing product_group or product-helper-handle.`);
    return null;
  }

  const productInputs = selectorElement.querySelectorAll(
    `input[type="radio"][${VARIANT_ATTR_OPTION_TYPE}="${VARIANT_OPTION_TYPE_VALUES.PRODUCT}"]`
  );
  
  const products = {};

  productInputs.forEach(input => {
    const label = input.getAttribute(VARIANT_ATTR_PRODUCT_LABEL);
    if (label) {
      products[label] = `${helperHandle}`;
    }
  });

  return {
    product_group: productGroup,
    products
  };
}

export function getAllProductMappings() {
  const selectors = [
    SELECTORS.PRODUCT_GROUP.VARIANT,
    SELECTORS.PRODUCT_GROUP.VARIANT_PURCHASE_TYPE_COMBO
  ].filter(Boolean).join(', ');

  const allSelectors = document.querySelectorAll(selectors);
  const result = {};        // section_id → product_group → label → handle
  const sectionOrder = [];  // list of unique section IDs (ordered)

  allSelectors.forEach(selector => {
    const sectionId = selector.sectionId;
    const mapping = getProductMappingJSON(selector); // { product_group, products }

    if (!sectionId || !mapping) return;

    // Only push to sectionOrder if it's the first time we see this sectionId
    if (!result[sectionId]) {
      result[sectionId] = {};
      if (!sectionOrder.includes(sectionId)) {
        sectionOrder.push(sectionId);
      }
    }

    const group = mapping.product_group;
    result[sectionId][group] = mapping.products;
  });

  return {
    mapping: result,
    sectionOrder
  };
}  
  
export function generateLiquidProductMappingStr(liquidLoadedMap) {
  const lines = Object.entries(liquidLoadedMap)
    .flatMap(([group, products]) =>
      Object.entries(products).map(
        ([label, handle]) => `  ${group}:${label}:${handle}`
      )
    );

  return `{%- assign product_mapping_str = "\n${lines.join(',\n')}\n" -%}`;
}

function serializeMapping(mapping) {
  return JSON.stringify(mapping, Object.keys(mapping).sort());
}

function hasProductGroupSeenConflictsAcrossSections(seenMap, productGroup, currentValue, sectionId) {
  if (seenMap.has(productGroup)) {
    const existing = seenMap.get(productGroup);
    if (existing !== currentValue) {
      console.warn(`⚠️ Conflict: Product group "${productGroup}" has different mappings in section "${sectionId}".`);
    }
    return true;
  }
  return false;
}

function maybeAddToLiquid({ productGroup, mapping, renderWithLiquid, totalHandles, liquid_loaded }) {
  const currentHandleCount = Object.keys(mapping).length;

  if (renderWithLiquid && totalHandles < 20) {
    if (totalHandles + currentHandleCount <= 20) {
      liquid_loaded[productGroup] = mapping;
      return { wasAddedToLiquid: true, newTotal: totalHandles + currentHandleCount };
    }
  }

  return { wasAddedToLiquid: false, newTotal: totalHandles };
}

export function getMergedProductGroupsAcrossSections(renderWithLiquid = false) {
  const { mapping: sectionedMappings, sectionOrder } = getAllProductMappings();

  const mergedGroups = {};
  const seenGroups = new Map();
  const liquid_loaded = {};
  const js_loaded = {};

  let totalHandles = 0;

  sectionOrder.forEach(sectionId => {
    const groups = sectionedMappings[sectionId];
    Object.entries(groups).forEach(([productGroup, mapping]) => {
      const valueString = serializeMapping(mapping);

      if (hasProductGroupSeenConflictsAcrossSections(seenGroups, productGroup, valueString, sectionId)) return;

      seenGroups.set(productGroup, valueString);
      mergedGroups[productGroup] = mapping;

      const { wasAddedToLiquid, newTotal } = maybeAddToLiquid({
        productGroup,
        mapping,
        renderWithLiquid,
        totalHandles,
        liquid_loaded
      });

      totalHandles = newTotal;
      if (!wasAddedToLiquid) {
        js_loaded[productGroup] = mapping;
      }
    });
  });

  return {
    merged: mergedGroups,
    liquid_loaded,
    js_loaded
  };
}

function isEmptyObject(obj) {
  return (
    obj &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    Object.keys(obj).length === 0
  );
}

export function getProductLoadFlags(renderWithLiquid) {
  const {
    merged,
    liquid_loaded,
    js_loaded
  } = getMergedProductGroupsAcrossSections(renderWithLiquid);

  return {
    has_static_loaded_liquid_products: !isEmptyObject(liquid_loaded),
    has_js_loaded_products: !isEmptyObject(js_loaded)
  };
}

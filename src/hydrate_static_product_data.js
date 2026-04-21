function safelyParseJSONScript(id) {
    const el = document.getElementById(id);
    if (!el) {
        console.warn(`⚠️ Script with ID "${id}" not found`);
        return null;
    }

    try {
        return JSON.parse(el.textContent);
    } catch (err) {
        console.error(`❌ Failed to parse JSON from script#${id}:`, err);
        return null;
    }
}

export function hydrateProductDataFromJSONScripts() {
    const sectionData = safelyParseJSONScript("wwai-static-product-section-data");
    const mappingArray = safelyParseJSONScript("wwai-static-liquid-product-mapping-array");
    window.__WWAI__SECTION_PRODUCT_DATA__ = window.__WWAI__SECTION_PRODUCT_DATA__ || {};
    if (!window.__WWAI__SECTION_PRODUCT_DATA__["all_sections"]) {
      window.__WWAI__SECTION_PRODUCT_DATA__["all_sections"] = sectionData;
    } else {
      console.warn("⚠️ SECTION_DATA.all_sections is already initialized. Skipping overwrite.");
    }

    window.__WWAI__LIQUID_STATIC_PRODUCT_MAPPING_ARRAY__ = window.__WWAI__LIQUID_STATIC_PRODUCT_MAPPING_ARRAY__ || mappingArray;
}
import { getWWAIConfig } from "../wwai_config.js";

// Get Product Group Config from window object.
function resolveWithFallback(groupCfg, defaultCfg) {
    const merged = {};
    const keys = new Set([
        ...Object.keys(defaultCfg || {}),
        ...Object.keys(groupCfg || {})
    ]);

    keys.forEach(key => {
        const groupVal = groupCfg?.[key];
        const defaultVal = defaultCfg?.[key];

        if (groupVal != null) {
        merged[key] = groupVal;
        } else if (defaultVal != null) {
        merged[key] = defaultVal;
        } else {
        ;
        // console.error(`WWAI-ERROR ❌ Missing config value for key "${key}". Both group and default configs are null.`);
        }
    });

    return merged;
}
  
export function resolveProductGroupConfig(sectionId, productGroup, configObj = null) {
    const config = configObj || getWWAIConfig().WWAI_PRODUCT_GROUP_CONFIG;

    if (!config || typeof config !== 'object') {
        console.error('WWAI-ERROR ❌ getWWAIConfig().WWAI_PRODUCT_GROUP_CONFIG is missing or invalid.');
        return null;
    }

    // Normalize sectionId (keep only part after '__')
    if (sectionId.includes('__')) {
        sectionId = sectionId.split('__')[1];
    }
    else if (sectionId.includes('--')) {
        sectionId = sectionId.split('--')[1];
    }
    

    const section = config[sectionId];
    if (!section) {
        console.warn(`❌ No config found for sectionId "${sectionId}"`);
        return null;
    }

    const groupConfig = section[productGroup];
    if (!groupConfig) {
        console.warn(`❌ No product group config found for "${productGroup}" in section "${sectionId}"`);
        return null;
    }

    const defaultConfig = section.defaults || {};

    const resolvedConfig =  {
        pricingConfig: resolveWithFallback(groupConfig.pricingConfig, defaultConfig.pricingConfig),
        uxConfig: resolveWithFallback(groupConfig.uxConfig, defaultConfig.uxConfig),
        flowConfig: resolveWithFallback(groupConfig.flowConfig, defaultConfig.flowConfig),
        variantDispatchConfig: groupConfig.variantDispatchConfig || {}
    };
    return resolvedConfig;
}

// Get Product Group Variant Config from window object.
export function resolveProductGroupVariantConfig(rawSectionId, productGroup, productLabel, options = {}) {
    if (productLabel.startsWith('wwai_virtual_bundle')) {
        return {};
    }
        
    const store = getWWAIConfig().WWAI_PRODUCT_VARIANT_OVERRIDES;

    if (!store) {
        console.error("WWAI-ERROR ❌ WWAI_PRODUCT_VARIANT_OVERRIDES not found on window.");
        return null;
    }

    // ✅ Normalize sectionId → extract part after "__"
    let sectionId = rawSectionId;
    if (sectionId.includes("__")) {
        sectionId = sectionId.split("__")[1];
    }
    else if (sectionId.includes("--")) {
        sectionId = sectionId.split("--")[1];
    }

    if (!store[sectionId] || !store[sectionId][productGroup]) {
        console.warn(`❌ Section "${sectionId}" or product group "${productGroup}" not found in overrides.`);
        return null;
    }

    const productLevelConfig = store[sectionId][productGroup][productLabel];
    if (!productLevelConfig) {
        console.warn(`❌ Product label "${productLabel}" not found in overrides under group "${productGroup}".`);
        return null;
    }
    // ✅ Generate variant key from options
    const parts = [options.option1, options.option2, options.option3]
    .filter(Boolean)  // Remove any null or undefined
    .map(part => part.trim());  // Trim whitespace from each option
    const variantKey = parts.join(" | ");

    const variantConfig = productLevelConfig[variantKey];
    if (!variantConfig) {
        console.warn(`❌ Variant key "${variantKey}" not found under product "${productLabel}".`);
        return null;
    }
    return variantConfig;
}
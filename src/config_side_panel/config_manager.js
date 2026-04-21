// Config Manager for handling all WWAI configurations
import { initializeStaticProductDataAndConfigs, runDispatchAndInitProductGroups } from "../init_helpers.js";

export function getAllConfigs() {
    const configs = {
        groupedSectionConfig: window.wwaiConfigPanelGetGroupedSectionConfig(),
        productMappingConfig: window.wwaiConfigPanelGetProductMappingConfig(),
        labeledImagesConfig: window.wwaiConfigPanelGetLabeledImagesConfig(),
        variantOverridesConfig: window.wwaiConfigPanelGetVariantOverridesConfig(),
        generalConfig: window.wwaiConfigPanelGetGeneralConfig()
    };
    return {
        JS_PRODUCT_MAPPING_OBJECT: configs.productMappingConfig,
        WWAI_PRODUCT_GROUP_CONFIG: configs.groupedSectionConfig,
        WWAI_PRODUCT_VARIANT_OVERRIDES: configs.variantOverridesConfig,
        WWAI_LABELED_IMAGES: configs.labeledImagesConfig,
        ...configs.generalConfig
    };
}

export function saveAllConfigs() {
    window.wwaiSaveGroupedSectionConfig();
    window.wwaiSaveProductMappingConfig();
    window.wwaiSaveLabeledImagesConfig();
    window.wwaiSaveVariantOverridesConfig();
    window.wwaiSaveGeneralConfig();
}

export function getConfigDiff() {
    const diffs = { 
        groupedSectionConfig: window.wwaiDiffGroupedSectionConfig(),
        productMappingConfig: window.wwaiDiffProductMappingConfig(),
        labeledImagesConfig: window.wwaiDiffLabeledImagesConfig(),
        variantOverridesConfig: window.wwaiDiffVariantOverridesConfig(),
        generalConfig: window.wwaiDiffGeneralConfig()
    };
    return diffs;
}

export function updateAndSaveCompleteConfig() {
    saveAllConfigs();
    const config = getAllConfigs();
    window.__WWAI__ = config;
    // This is needed to get the product data and config initialized after updating the WWAI config.
    initializeStaticProductDataAndConfigs(); 
    // This is needed to get the product group registry and variant config initialized after updating the WWAI config.
    runDispatchAndInitProductGroups();
    return true;
}

/**
 * Convert all configs into a string format that can be copied and used
 */
export function generateConfigString() {
    const configs = getAllConfigs();
    const generalConfig = window.wwaiConfigPanelGetGeneralConfig
      ? window.wwaiConfigPanelGetGeneralConfig()
      : {};
    
    // Groupings and comments
    const orderedConfigKeys = [
      'useMockSubscription',
      'deployMode',
      'MODE',
      'RENDER_WITH_LIQUID',
      'CONNECTOR_TYPE',
      'heightEqualizeLogging',
      'CURRENCY',
      'CURRENCY_FACTOR'
    ];
  
    const configComments = {
      useMockSubscription: 'Use metafield-based subscription in sandbox/local',
      deployMode: 'Options: "local" | "sandbox" | "prod"',
      MODE: 'Enables dev/debugger mode, values are dev, prod',
      RENDER_WITH_LIQUID: 'Controls Liquid-product rendering',
      CONNECTOR_TYPE: 'Which connector to use for hydration',
      heightEqualizeLogging: 'Enable logging for grid height debugging',
      CURRENCY: 'Active currency from Shopify',
      CURRENCY_FACTOR: 'Currency conversion factor'
    };
  
    const configLines = orderedConfigKeys.map((key) => {
      let value;
      if (key === 'CURRENCY') {
        value = 'Shopify.currency.active';
      } else {
        value = generalConfig[key] ?? configs[key];
        value = JSON.stringify(value);
      }
      return `// ${configComments[key]}
window.__WWAI__.${key} = ${value};`;
    });
  
    return `window.__WWAI__ = window.__WWAI__ || {};
    
// Environment + Mode Config
${configLines.slice(0, 6).join('\n\n')}

// Currency Config
${configLines.slice(6).join('\n\n')}

// Product mapping object
window.__WWAI__.JS_PRODUCT_MAPPING_OBJECT = ${JSON.stringify(configs.JS_PRODUCT_MAPPING_OBJECT, null, 2)};

// Product group config
window.__WWAI__.WWAI_PRODUCT_GROUP_CONFIG = ${JSON.stringify(configs.WWAI_PRODUCT_GROUP_CONFIG, null, 2)};

// Variant overrides
window.__WWAI__.WWAI_PRODUCT_VARIANT_OVERRIDES = ${JSON.stringify(configs.WWAI_PRODUCT_VARIANT_OVERRIDES, null, 2)};

// Labeled images
window.__WWAI__.WWAI_LABELED_IMAGES = ${JSON.stringify(configs.WWAI_LABELED_IMAGES, null, 2)};

// Action buttons
window.__WWAI__.WWAI_ACTION_BUTTONS = ${JSON.stringify(window.__WWAI__.WWAI_ACTION_BUTTONS, null, 2)};
`;
}

export function validateWWAIConfig(config = window.__WWAI__) {
  const errors = [];

  // ✅ 1. Top-Level Environment Config
  const envFields = {
    useMockSubscription: 'boolean',
    deployMode: ['local', 'sandbox', 'prod'],
    MODE: ['dev', 'prod'],
    RENDER_WITH_LIQUID: 'boolean',
    CONNECTOR_TYPE: ['shopify', 'wwai_product_connector_custom_static', 'wwai_product_connector_custom_dynamic'], // extend if needed
    heightEqualizeLogging: 'boolean'
  };

  for (const [key, expected] of Object.entries(envFields)) {
    const value = config[key];

    if (Array.isArray(expected)) {
      if (!expected.includes(value)) {
        errors.push(`❌ ${key} must be one of [${expected.join(', ')}], got "${value}"`);
      }
    } else if (typeof value !== expected) {
      errors.push(`❌ ${key} must be of type ${expected}, got ${typeof value}`);
    }
  }

  // ✅ 2. Currency Config
  if (typeof config.CURRENCY !== 'string') {
    errors.push(`❌ CURRENCY must be a string, got ${typeof config.CURRENCY}`);
  }

  if (typeof config.CURRENCY_FACTOR !== 'number') {
    errors.push(`❌ CURRENCY_FACTOR must be a number, got ${typeof config.CURRENCY_FACTOR}`);
  }

  // ✅ 3. JS_PRODUCT_MAPPING_OBJECT
  if (!isObject(config.JS_PRODUCT_MAPPING_OBJECT)) {
    errors.push(`❌ JS_PRODUCT_MAPPING_OBJECT must be an object`);
  }

  // ✅ 4. WWAI_PRODUCT_GROUP_CONFIG
  if (!isObject(config.WWAI_PRODUCT_GROUP_CONFIG)) {
    errors.push(`❌ WWAI_PRODUCT_GROUP_CONFIG must be an object`);
  }

  // ✅ 5. WWAI_PRODUCT_VARIANT_OVERRIDES
  if (!isObject(config.WWAI_PRODUCT_VARIANT_OVERRIDES)) {
    errors.push(`❌ WWAI_PRODUCT_VARIANT_OVERRIDES must be an object`);
  }

  // ✅ 6. WWAI_LABELED_IMAGES
  if (!isObject(config.WWAI_LABELED_IMAGES)) {
    errors.push(`❌ WWAI_LABELED_IMAGES must be an object`);
  }

  // 🔍 Optional: Warn on empty config sections
  if (Object.keys(config.WWAI_PRODUCT_VARIANT_OVERRIDES || {}).length === 0) {
    console.warn("⚠️ WWAI_PRODUCT_VARIANT_OVERRIDES is empty");
  }

  // 🧾 Output results
  if (errors.length > 0) {
    console.group("❌ WWAI Config Validation Failed:");
    errors.forEach(e => console.warn(e));
    console.groupEnd();
    throw new Error("WWAI config validation failed");
  } else {
    console.log("✅ WWAI config validated successfully.");
  }
}

// Helper
function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function getWWAIConfig() {
  return window.__WWAI__ || {};
}

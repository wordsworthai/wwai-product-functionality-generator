import { pricingConfigSchema, validateAgainstSchema, makeValidationBanner } from "./config_and_validator.js";
import {  renderSchemaObject } from "./ui_render_utils.js";

// Config-specific rendering functions
function renderPricingConfigFields(config, pathPrefix) {
  // Use generic schema renderer for all fields
  const renderedFields = renderSchemaObject(config, pricingConfigSchema, pathPrefix);
  return renderedFields.join('');
}


export function renderPricingConfigTab(config, pathPrefix) {
    const validationErrors = validateAgainstSchema(config, pricingConfigSchema);
    const validationBanner = makeValidationBanner(validationErrors, "Pricing config");
  
    const fields = renderPricingConfigFields(config, pathPrefix);
  
    return validationBanner + fields;
}
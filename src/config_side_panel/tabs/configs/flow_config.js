import { flowConfigSchema, validateAgainstSchema, makeValidationBanner } from "./config_and_validator.js";
import { renderSchemaObject } from "./ui_render_utils.js";

function renderFlowConfigFields(config, pathPrefix) {
  // Use generic schema renderer for all fields
  const renderedFields = renderSchemaObject(config, flowConfigSchema, pathPrefix);
  return renderedFields.join('');
}


export function renderFlowConfigTab(config, accessorPath) {
    const errors = validateAgainstSchema(config, flowConfigSchema);
    const validationBanner = makeValidationBanner(errors, "Flow config");
  
    const fields = renderFlowConfigFields(config, accessorPath);
  
    return validationBanner + fields;
}
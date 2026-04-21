import { uxConfigSchema, validateAgainstSchema, makeValidationBanner } from "./config_and_validator.js";
import { renderTextarea, renderSchemaObject } from "./ui_render_utils.js";

function renderUxConfigFields(config, pathPrefix) {
  const fields = [];
    
  // Use generic schema renderer for all other fields
  const renderedFields = renderSchemaObject(config, uxConfigSchema, pathPrefix);
  fields.push(...renderedFields);
  
  return fields.join('');
}

export function renderUxConfigTab(config, accessorPath) {
    const errors = validateAgainstSchema(config, uxConfigSchema);
    const validationBanner = makeValidationBanner(errors, "UX config");
  
    const fields = renderUxConfigFields(config, accessorPath);
  
    return validationBanner + fields;
}
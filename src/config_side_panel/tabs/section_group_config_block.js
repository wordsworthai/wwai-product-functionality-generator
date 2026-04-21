import { createGoToSectionButton } from "./section_scroll_utils.js";
import { renderDefaultsSection } from "./section_group_config_defaults.js";
import { renderSchemaObject } from "./configs/ui_render_utils.js";
import { validateAgainstSchema, makeValidationBanner } from "./configs/config_and_validator.js";
import { variantDispatchConfigSchema } from "./configs/config_and_validator.js";


// Global function for copying defaults to textarea
window.copyDefaultToTextarea = function(buttonEl) {
  const textarea = buttonEl.nextElementSibling;
  const defaultData = buttonEl.getAttribute('data-defaults');
  if (defaultData) {
    textarea.value = defaultData;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    buttonEl.remove(); // Remove the button after copying
  }
};

// Show collapsible text area with json content.
function renderConfigBlock(label, content, accessorPath, defaults) {
  const defaultStr = JSON.stringify(defaults ?? {}, null, 2);
  const userStr = content != null ? JSON.stringify(content, null, 2) : "";

  return `
    <div style="margin-top: 8px;">
      <span style="font-weight: bold; cursor: pointer;">${label}</span>

      ${content == null
        ? `<button onclick="window.copyDefaultToTextarea(this)" data-defaults="${defaultStr.replace(/"/g, '&quot;')}" style="margin-bottom: 8px;">Copy defaults to override</button>`
        : ""}

      <textarea
        data-config-path="${accessorPath}"
        data-is-json="true"
        oninput="window.wwaiProductGroupConfigOnChangeHandler(this)"
        style="width: 100%; min-height: 140px; font-family: monospace; font-size: 13px;"
      >${userStr}</textarea>
    </div>
  `;
}

function renderVariantDispatchConfigFields(config, pathPrefix) {
  // Use generic schema renderer for all fields
  const renderedFields = renderSchemaObject(config, variantDispatchConfigSchema, pathPrefix);
  return renderedFields.join('');
}


export function renderVariantDispatchConfigTab(config, pathPrefix) {
  const validationErrors = validateAgainstSchema(config, variantDispatchConfigSchema);
  const validationBanner = makeValidationBanner(validationErrors, "Variant Dispatch config");

  const fields = renderVariantDispatchConfigFields(config, pathPrefix);
  
  return validationBanner + fields;
}


function renderGroupBlock(productGroupTag, productGroupData, accessorPath, defaults) {
    const tabId = `group-${accessorPath.replace(/[^a-zA-Z0-9]/g, '-')}`;
    
    return `
        <div style="margin-top: 12px; padding: 8px; border: 1px dashed #ccc; border-radius: 4px;">
            <div style="font-weight: bold; margin-bottom: 12px;">Product Group: <code>${productGroupTag}</code></div>
            
            <div style="border-bottom: 1px solid #ddd; margin-bottom: 12px;">
                <button class="tab-button active" onclick="window.switchTabForProductGroupConfig('${tabId}', 'variant-dispatch')" data-tab="variant-dispatch" style="background: #0070f3; color: white; border: none; padding: 8px 16px; margin-right: 4px; border-radius: 4px 4px 0 0; cursor: pointer;">Variant Dispatch</button>
                <button class="tab-button" onclick="window.switchTabForProductGroupConfig('${tabId}', 'pricing')" data-tab="pricing" style="background: #f0f0f0; color: #333; border: none; padding: 8px 16px; margin-right: 4px; border-radius: 4px 4px 0 0; cursor: pointer;">Pricing</button>
                <button class="tab-button" onclick="window.switchTabForProductGroupConfig('${tabId}', 'ux')" data-tab="ux" style="background: #f0f0f0; color: #333; border: none; padding: 8px 16px; margin-right: 4px; border-radius: 4px 4px 0 0; cursor: pointer;">UX</button>
                <button class="tab-button" onclick="window.switchTabForProductGroupConfig('${tabId}', 'flow')" data-tab="flow" style="background: #f0f0f0; color: #333; border: none; padding: 8px 16px; margin-right: 4px; border-radius: 4px 4px 0 0; cursor: pointer;">Flow</button>
            </div>
            
            <div id="${tabId}-variant-dispatch" class="tab-content" style="display: block;">
                ${renderVariantDispatchConfigTab(productGroupData.variantDispatchConfig, accessorPath + ".variantDispatchConfig")}
            </div>

            <div id="${tabId}-pricing" class="tab-content" style="display: none;">
                ${renderConfigBlock("pricingConfig", productGroupData.pricingConfig, accessorPath + ".pricingConfig", defaults.pricingConfig)}
            </div>
            
            <div id="${tabId}-ux" class="tab-content" style="display: none;">
                ${renderConfigBlock("uxConfig", productGroupData.uxConfig, accessorPath + ".uxConfig", defaults.uxConfig)}
            </div>
            
            <div id="${tabId}-flow" class="tab-content" style="display: none;">
                ${renderConfigBlock("flowConfig", productGroupData.flowConfig, accessorPath + ".flowConfig", defaults.flowConfig)}
            </div>
        </div>
    `;
}

// Add the tab switching function to the global scope
window.switchTabForProductGroupConfig = function(groupId, tabName) {
    // Hide all tab contents for this group
    const tabContents = document.querySelectorAll(`[id^="${groupId}-"]`);
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Show the selected tab content
    const selectedContent = document.getElementById(`${groupId}-${tabName}`);
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }
    
    // Update button styles
    const buttons = document.querySelectorAll(`[onclick*="${groupId}"]`);
    buttons.forEach(button => {
        if (button.getAttribute('data-tab') === tabName) {
            button.style.background = '#0070f3';
            button.style.color = 'white';
        } else {
            button.style.background = '#f0f0f0';
            button.style.color = '#333';
        }
    });
};

// Render product groups level config, shows both product group and variant level
// config.
function renderProductGroupsSection(productGroupKeyedConfigData, sectionId, defaults) {
  const productGroupHtml = productGroupKeyedConfigData.map(([productGroupTag, config]) =>
    `
    <details style="margin-bottom: 12px; border: 1px solid #ccc; border-radius: 6px; padding: 8px;">
      <summary style="cursor: pointer; font-weight: bold;">
        Product Group: <code>${productGroupTag}</code>
      </summary>
      ${renderGroupBlock(productGroupTag, config, `${sectionId}.${productGroupTag}`, defaults)}
    </details>
    `
  ).join("");

  return `
    <div style="margin-top: 16px;">
      <strong>Product Groups</strong>
      ${productGroupHtml || '<p style="color: #888;">No product group overrides defined.</p>'}
    </div>
  `;
}

function createSectionConfigHeader(sectionId, sectionIndex) {
  return `
    <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-family: 'Inter', sans-serif;">
      <span style="background-color: #0070f3; color: white; padding: 4px 8px; border-radius: 999px; font-size: 12px; font-weight: 500;">
        #${sectionIndex}
      </span>
      <code style="background-color: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 13px; font-family: monospace;">
        ${sectionId}
      </code>
      ${createGoToSectionButton(sectionId)}
    </div>
  `;
}

export function renderSectionBlock(
    sectionId, 
    sectionGroupData, 
    sectionIndex,
    accessorPath
) {
    const defaults = sectionGroupData.defaults || {};
    const productGroupKeyedConfigData = Object.entries(sectionGroupData)
      .filter(([key]) => key !== "defaults");

    return `
      <details style="margin-bottom: 16px; border: 1px solid #eee; padding: 12px; border-radius: 6px;">
        <summary style="cursor: pointer; font-weight: bold; font-size: 15px;">
          ${createSectionConfigHeader(sectionId, sectionIndex)}
        </summary>
        ${renderDefaultsSection(sectionId, defaults, accessorPath + ".defaults")}
        ${renderProductGroupsSection(productGroupKeyedConfigData, sectionId, defaults)}
      </details>
    `;
}
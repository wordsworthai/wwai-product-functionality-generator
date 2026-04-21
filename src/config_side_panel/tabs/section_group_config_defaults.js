import { renderPricingConfigTab } from "./configs/pricing_config.js";
import { renderUxConfigTab } from "./configs/ux_config.js";
import { renderFlowConfigTab } from "./configs/flow_config.js";

export function renderConfigTabs(
    defaults, 
    sectionId, 
    productGroup, 
    accessorPath
) {
    const prefix = `${sectionId}-${productGroup}`;
    return `
    <div class="wwai-config-tabs" style="margin-top: 12px;">
    <div style="display: flex; gap: 12px; margin-bottom: 12px;">
        <button onclick="window.showConfigTab('${sectionId}', '${productGroup}', 'pricing')">Pricing</button>
        <button onclick="window.showConfigTab('${sectionId}', '${productGroup}', 'ux')">UX</button>
        <button onclick="window.showConfigTab('${sectionId}', '${productGroup}', 'flow')">Flow</button>
    </div>

    <div id="tab-${prefix}-pricing">
        ${renderPricingConfigTab(defaults.pricingConfig || {}, `${accessorPath}.pricingConfig`)}
    </div>
    <div id="tab-${prefix}-ux" style="display: none;">
        ${renderUxConfigTab(defaults.uxConfig || {}, `${accessorPath}.uxConfig`)}
    </div>
    <div id="tab-${prefix}-flow" style="display: none;">
        ${renderFlowConfigTab(defaults.flowConfig || {}, `${accessorPath}.flowConfig`)}
    </div>
    </div>
    `;
}


export function renderDefaultsSection(sectionId, defaults, accessorPath) {
    return `
        <details style="margin-top: 10px; border: 1px solid #ddd; border-radius: 4px; padding: 8px;">
            <summary style="cursor: pointer; font-weight: bold; padding: 4px 0;">
                Defaults
            </summary>
            <div style="margin-top: 8px;">
                ${renderConfigTabs(defaults, sectionId, 'default', accessorPath)}
            </div>
        </details>
    `;
}

window.showConfigTab = function (sectionId, productGroup, tab) {
    const tabIds = ['pricing', 'ux', 'flow'];
  
    tabIds.forEach(id => {
      const el = document.getElementById(`tab-${sectionId}-${productGroup}-${id}`);
      if (el) {
        el.style.display = (id === tab ? 'block' : 'none');
      }
    });
};  
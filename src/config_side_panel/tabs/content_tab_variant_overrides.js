import { renderConfigSections } from "./config_render_utils.js";

function renderProductLabelConfig(productLabel, config, accessorPath) {
    const configJson = JSON.stringify(config, null, 2);
    
    return `
        <div style="margin-top: 8px; padding: 8px; border: 1px solid #e0e0e0; border-radius: 4px; background: #fafafa;">
            <div style="font-weight: bold; margin-bottom: 8px; color: #333;">
                Configuration for: <code>${productLabel}</code>
            </div>
            <textarea 
                data-config-path="${accessorPath}"
                data-is-json="true"
                oninput="window.wwaiVariantOverridesConfigOnChangeHandler(this)"
                style="width: 100%; min-height: 120px; font-family: monospace; font-size: 12px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
                placeholder="Enter variant override configuration as JSON..."
            >${configJson}</textarea>
        </div>
    `;
}

function renderProductLabelsVariantConfig(productLabelsVariantConfig, sectionId, productGroup, productLabel) {
    const productLabelsVariantConfigList = Object.entries(productLabelsVariantConfig);
    
    const productLabelsVariantConfigHtml = productLabelsVariantConfigList.map(([variantLabel, config]) => 
        renderProductLabelConfig(variantLabel, config, `${sectionId}.${productGroup}.${productLabel}.${variantLabel}`)
    ).join("");
    
    return `
        <details style="margin-bottom: 12px; border: 1px solid #e0e0e0; border-radius: 6px; padding: 8px;">
            <summary style="cursor: pointer; font-weight: bold; color: #666;">
                Variants (${productLabelsVariantConfigList.length})
            </summary>
            <div style="margin-top: 12px;">
                ${productLabelsVariantConfigHtml || '<p style="color: #888; font-style: italic;">No product label configurations defined.</p>'}
            </div>
        </details>
    `;
}

function renderProductGroupSection(productGroup, productGroupData, sectionId) {
    const productLabels = Object.entries(productGroupData);
    
    const productLabelsHtml = productLabels.map(([productLabel, config]) => 
        renderProductLabelsVariantConfig(config, sectionId, productGroup, productLabel)
    ).join("");
    
    return `
        <details style="margin-bottom: 12px; border: 1px solid #ddd; border-radius: 6px; padding: 8px;">
            <summary style="cursor: pointer; font-weight: bold; color: #555;">
                Product Group: <code>${productGroup}</code>
            </summary>
            <div style="margin-top: 12px;">
                ${productLabelsHtml || '<p style="color: #888; font-style: italic;">No product label overrides defined.</p>'}
            </div>
        </details>
    `;
}

function renderSectionBlock(sectionId, sectionData, sectionIndex) {
    const productGroups = Object.entries(sectionData);
    
    const productGroupsHtml = productGroups.map(([productGroup, productGroupData]) => 
        renderProductGroupSection(productGroup, productGroupData, sectionId)
    ).join("");
    
    return `
        <details style="margin-bottom: 16px; border: 1px solid #eee; padding: 12px; border-radius: 6px;">
            <summary style="cursor: pointer; font-weight: bold; font-size: 15px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="background-color: #0070f3; color: white; padding: 4px 8px; border-radius: 999px; font-size: 12px; font-weight: 500;">
                        #${sectionIndex}
                    </span>
                    <code style="background-color: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 13px; font-family: monospace;">
                        ${sectionId}
                    </code>
                </div>
            </summary>
            <div style="margin-top: 12px;">
                ${productGroupsHtml || '<p style="color: #888; font-style: italic;">No product group overrides defined for this section.</p>'}
            </div>
        </details>
    `;
}

function renderVariantOverridesHierarchy(variantOverrides = {}) {
    const sections = Object.entries(variantOverrides);
    
    if (sections.length === 0) {
        return '<p style="color: #888; font-style: italic; text-align: center; padding: 20px;">No variant overrides configured.</p>';
    }
    
    return sections.map(([sectionId, sectionData], index) => 
        renderSectionBlock(sectionId, sectionData, index + 1)
    ).join("");
}

export function renderVariantOverridesTab(variantOverrides) {
    window.wwaiConfigSnapshots = window.wwaiConfigSnapshots || {};
    window.wwaiConfigSnapshots["variant-overrides"] = structuredClone(variantOverrides);

    return `
        <div id="tab-content-variant_overrides" class="wwai-tab-content" style="display: none;">
            <div style="margin-bottom: 20px; padding: 12px; background: #f8f9fa; border-radius: 6px; border: 1px solid #e9ecef;">
                <div style="font-weight: bold; margin-bottom: 12px; color: #495057;">Configuration Actions</div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button onclick="window.wwaiConfigPanelLogVariantOverridesConfig()" 
                            style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 13px;">
                        Log Config
                    </button>
                    <button onclick="window.wwaiDiffVariantOverridesConfig()" 
                            style="background: #ffc107; color: #212529; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 13px;">
                        Show Diff
                    </button>
                    <button onclick="window.wwaiSaveVariantOverridesConfig()" 
                            style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 13px;">
                        Save Changes
                    </button>
                </div>
            </div>
            <div style="margin-top: 16px;">
                ${renderVariantOverridesHierarchy(variantOverrides)}
            </div>
        </div>
    `;
}

// Global change tracking for variant overrides
window._wwaiVariantOverridesConfigChanges = {};

window.wwaiVariantOverridesConfigOnChangeHandler = function(el) {
    const path = el.getAttribute("data-config-path");
    const isJson = el.getAttribute("data-is-json") === "true";
    const rawValue = el.value;
    
    let value;
    try {
        if (isJson) {
            value = JSON.parse(rawValue);
        } else {
            value = rawValue;
        }
        window._wwaiVariantOverridesConfigChanges[path] = value;
        console.log("[VariantOverrides ChangeTracker]", path, "=>", value);
    } catch (err) {
        console.warn("Parsing failed for", path, err);
    }
};

window.wwaiConfigPanelLogVariantOverridesConfig = function () {
    const config = window.wwaiConfigPanelGetVariantOverridesConfig();
    console.log("🎛️ Updated Variant Overrides Config:", config);
};

window.wwaiDiffVariantOverridesConfig = function () {
    const snapshotId = "variant-overrides";
    const snapshot = window.wwaiConfigSnapshots?.[snapshotId];
    const changes = window._wwaiVariantOverridesConfigChanges || {};
    
    if (!snapshot) {
        console.warn("No snapshot found for", snapshotId);
        return {};
    }
    
    const diff = {};
    
    // Process each change to create before/after structure
    Object.entries(changes).forEach(([path, value]) => {
        // Get the original value from snapshot
        let originalValue = null;
        try {
            const pathParts = path.split('.');
            let current = snapshot;
            
            // Navigate to the original value
            for (let i = 0; i < pathParts.length; i++) {
                if (current && typeof current === 'object' && pathParts[i] in current) {
                    current = current[pathParts[i]];
                } else {
                    current = undefined;
                    break;
                }
            }
            originalValue = current;
        } catch (error) {
            console.warn("Could not get original value for path:", path);
        }
        
        // Only include in diff if values are different
        if (JSON.stringify(originalValue) !== JSON.stringify(value)) {
            diff[path] = {
                before: originalValue,
                after: value
            };
        }
    });
    
    if (Object.keys(diff).length > 0) {
        console.log("🪄 Variant Overrides Diff:", diff);
    } else {
        console.log("🪄 No changes in variant overrides");
    }
    return diff;
};

window.wwaiConfigPanelGetVariantOverridesConfig = function () {
    const snapshotId = "variant-overrides";
    const snapshot = window.wwaiConfigSnapshots?.[snapshotId];
    const changes = window._wwaiVariantOverridesConfigChanges || {};
    
    if (!snapshot) {
        console.warn("No snapshot found for", snapshotId);
        return {};
    }
    
    // Start with a deep clone of the snapshot
    const result = structuredClone(snapshot);
    
    // Apply all changes on top of the snapshot
    Object.entries(changes).forEach(([path, value]) => {
        try {
            // Parse the path (e.g., "sectionId.productGroup.productLabel")
            const pathParts = path.split('.');
            let current = result;
            
            // Navigate to the parent object
            for (let i = 0; i < pathParts.length - 1; i++) {
                const part = pathParts[i];
                if (!(part in current)) {
                    current[part] = {};
                }
                current = current[part];
            }
            
            // Set the value at the final path
            const finalKey = pathParts[pathParts.length - 1];
            current[finalKey] = value;
            
            console.log(`Applied variant override change: ${path} =`, value);
        } catch (error) {
            console.error(`Failed to apply change for path: ${path}`, error);
        }
    });
    
    return result;
};

window.wwaiSaveVariantOverridesConfig = function () {
    const snapshotId = "variant-overrides";
    const updatedConfig = window.wwaiConfigPanelGetVariantOverridesConfig();
    
    window.wwaiConfigSnapshots[snapshotId] = structuredClone(updatedConfig);
    window._wwaiVariantOverridesConfigChanges = {};
    
    console.log("✅ Saved variant overrides config changes to snapshot");
    console.log("📊 Updated snapshot:", window.wwaiConfigSnapshots[snapshotId]);
};
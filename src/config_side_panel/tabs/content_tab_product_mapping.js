import {
    renderConfigSections,
} from "./config_render_utils.js";
  
import {
getUpdatedConfig,
getConfigDiff,
saveUpdatedConfig
} from "./config_snapshot_utils.js";
  
export function renderProductMappingTab(mapping) {
    const snapshotId = "product-mapping";
    const content = renderConfigSections(mapping, "No product mapping data available.", snapshotId);

    return `
        <div id="tab-content-mapping" class="wwai-tab-content" style="display: none;">
        <button onclick="window.wwaiConfigPanelGetProductMappingConfig()">Log Config</button>
        <button onclick="window.wwaiDiffProductMappingConfig()">Diff</button>
        <button onclick="window.wwaiSaveProductMappingConfig()">Save Config</button>
        ${content}
        </div>
    `;
}
  
window.wwaiConfigPanelGetProductMappingConfig = function () {
    const config = getUpdatedConfig("#tab-content-mapping");
    console.log("🗺️ Updated Product Mapping Config:", config);
    return config;
};

window.wwaiDiffProductMappingConfig = function () {
    const diff = getConfigDiff("product-mapping", "#tab-content-mapping");
    console.log("🪄 Product Mapping Diff:", diff);
    return diff;
};

window.wwaiSaveProductMappingConfig = function () {
    saveUpdatedConfig("product-mapping", "#tab-content-mapping");
    console.log("✅ Saved updated config for snapshot: product-mapping");
};
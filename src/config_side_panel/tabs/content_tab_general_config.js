import {
    renderConfigSections,
  } from "./config_render_utils.js";

import {
    getUpdatedConfig,
    getConfigDiff,
    saveUpdatedConfig
} from "./config_snapshot_utils.js";

export function renderGeneralConfigTab(config) {
    const snapshotId = "general-config";
    const content = renderConfigSections(config, "No general config data available.", snapshotId);

    return `
        <div id="tab-content-general" class="wwai-tab-content" style="display: none;">
            <button onclick="window.wwaiConfigPanelGetGeneralConfig()">Log Config</button>
            <button onclick="window.wwaiDiffGeneralConfig()"> Diff</button>
            <button onclick="window.wwaiSaveGeneralConfig()">Save Config</button>
        ${content}
        </div>
    `;
}
  
  // Optional: expose utility buttons
window.wwaiConfigPanelGetGeneralConfig = function () {
    const config = getUpdatedConfig("#tab-content-general");
    console.log("🛠 Updated Config:", config);
    return config;
};

window.wwaiDiffGeneralConfig = function () {
    const diff = getConfigDiff("general-config", "#tab-content-general");
    console.log("🪄 Config Diff:", diff);
    return diff;
};

window.wwaiSaveGeneralConfig = function () {
    saveUpdatedConfig("general-config", "#tab-content-general");
    console.log("✅ Saved updated config for snapshot: general-config");
};
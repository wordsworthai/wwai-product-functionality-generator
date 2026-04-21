import { renderConfigSections } from "./config_render_utils.js";

export function renderLabeledImagesTab(images) {
  const imagesJson = JSON.stringify(images, null, 2);

  window.wwaiConfigSnapshots = window.wwaiConfigSnapshots || {};
  window.wwaiConfigSnapshots["labeled-images"] = structuredClone(images);

    return `
        <div id="tab-content-images" class="wwai-tab-content" style="display: none;">
        <button onclick="window.wwaiConfigPanelGetLabeledImagesConfig()">Log Config</button>
        <button onclick="window.wwaiDiffLabeledImagesConfig()">Diff</button>
        <button onclick="window.wwaiSaveLabeledImagesConfig()">Save Config</button>
        <div style="margin: 20px 0;">
            <label for="wwai-labeled-images-textarea" style="display: block; margin-bottom: 10px; font-weight: bold;">Labeled Images Configuration (JSON):</label>
            <textarea 
                id="wwai-labeled-images-textarea" 
                style="width: 100%; height: 400px; font-family: monospace; padding: 10px; border: 1px solid #ccc; border-radius: 4px;"
                placeholder="Enter labeled images configuration as JSON..."
            >${imagesJson}</textarea>
        </div>
        </div>
    `;
}
  
window.wwaiConfigPanelGetLabeledImagesConfig = function () {
    const textarea = document.getElementById("wwai-labeled-images-textarea");
    if (!textarea) {
        console.error("❌ Labeled images textarea not found");
        return {};
    }
    
    try {
        const config = JSON.parse(textarea.value);
        console.log("🖼️ Updated Labeled Images Config:", config);
        return config;
    } catch (error) {
        console.error("❌ Invalid JSON in labeled images textarea:", error);
    }
    return {};
};

window.wwaiDiffLabeledImagesConfig = function () {
    const textarea = document.getElementById("wwai-labeled-images-textarea");
    if (!textarea) {
        console.error("❌ Labeled images textarea not found");
        return;
    }
    
    try {
        const currentConfig = JSON.parse(textarea.value);
        const originalConfig = window.wwaiConfigSnapshots?.["labeled-images"] || {};
        
        if (JSON.stringify(originalConfig) !== JSON.stringify(currentConfig)) {
        const diff = {
            "images": {
                before: originalConfig,
                after: currentConfig
            }
        };
        console.log("🪄 Labeled Images Diff:", diff);
        return diff;
        } else {
            console.log("🪄 No changes in labeled images");
            return {};
        }
    } catch (error) {
        console.error("❌ Invalid JSON in labeled images textarea:", error);
    }
};

window.wwaiSaveLabeledImagesConfig = function () {
    const textarea = document.getElementById("wwai-labeled-images-textarea");
    if (!textarea) {
        console.error("❌ Labeled images textarea not found");
        return;
    }
    
    try {
        const config = JSON.parse(textarea.value);
        
        // Save to snapshots
        if (!window.wwaiConfigSnapshots) {
            window.wwaiConfigSnapshots = {};
        }
        window.wwaiConfigSnapshots["labeled-images"] = config;
        
        console.log("✅ Saved updated config for snapshot: labeled-images", config);
    } catch (error) {
        console.error("❌ Invalid JSON in labeled images textarea:", error);
    }
};
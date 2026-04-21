import { renderSectionBlock } from "./section_group_config_block.js";

function getAllSectionIds(groupConfig) {
    return new Set([
        ...Object.keys(groupConfig || {})
    ]);
}

function renderGroupedSectionConfigs(groupConfig = {}) {
    const allSectionIds = getAllSectionIds(groupConfig);

    return [...allSectionIds].map((sectionId, index) => {
        const sectionGroupData = groupConfig[sectionId] || {};
        return renderSectionBlock(
            sectionId, 
            sectionGroupData, 
            index + 1, 
            sectionId
        );
    }).join("\n");
}

export function renderGroupedSectionConfigsTab(groupConfig = {}) {
  
  const snapshotId = "grouped-section-config";
  window.wwaiConfigSnapshots = window.wwaiConfigSnapshots || {};
  window.wwaiConfigSnapshots[snapshotId] = structuredClone(groupConfig);

  
    return `<div id="tab-content-group" class="wwai-tab-content" style="display: none;">
      <div style="margin-bottom: 20px; padding: 12px; background: #f8f9fa; border-radius: 6px; border: 1px solid #e9ecef;">
        <div style="font-weight: bold; margin-bottom: 12px; color: #495057;">Configuration Actions</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button onclick="console.log('📊 Current Config:', window.wwaiConfigPanelGetGroupedSectionConfig())" 
                  style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 13px;">
            Log Config
          </button>
          <button onclick="window.wwaiSaveGroupedSectionConfig()" 
                  style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 13px;">
            Save Changes
          </button>
          <button onclick="console.log('🔍 Changes Diff:', window.wwaiDiffGroupedSectionConfig())" 
                  style="background: #ffc107; color: #212529; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 13px;">
            Show Diff
          </button>
        </div>
      </div>
      ${renderGroupedSectionConfigs(groupConfig)}
    </div>`;
}

window._wwaiProductGroupConfigChanges = {};
    
window.wwaiProductGroupChangeHandler = function (path, value) {
  window._wwaiProductGroupConfigChanges[path] = value;
  console.log("[ChangeTracker]", path, "=>", value);
}

window.wwaiProductGroupConfigOnChangeHandler = function (el) {
    const path = el.getAttribute("data-config-path");
    const isArray = el.getAttribute("data-is-array") === "true";
    const isJson = el.getAttribute("data-is-json") === "true";
    const allowNull = el.getAttribute("data-allow-null") === "true";
    const rawValue = el.value;
  
    if (allowNull && rawValue === "") {
      return window.wwaiProductGroupChangeHandler(path, null);
    }
  
    let value;
    try {
      if (isJson) {
        value = JSON.parse(rawValue);
      } else if (isArray) {
        value = rawValue.split(",").map(s => s.trim());
      } else {
        // Type casting: convert string numbers to integers
        if (rawValue.trim() !== "" && !isNaN(rawValue) && Number.isInteger(Number(rawValue))) {
          value = Number(rawValue);
        } else {
          value = rawValue;
        }
      }
      window.wwaiProductGroupChangeHandler(path, value);
    } catch (err) {
      console.warn("Parsing failed for", path, err);
    }
};


window.wwaiDiffGroupedSectionConfig = function () {
  const snapshotId = "grouped-section-config";
  const snapshot = window.wwaiConfigSnapshots?.[snapshotId];
  const changes = window._wwaiProductGroupConfigChanges || {};
  
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
    if (originalValue !== value) {
      diff[path] = {
        before: originalValue,
        after: value
      };
    }
  });
  return diff;
};

window.wwaiConfigPanelGetGroupedSectionConfig = function () {
  const snapshotId = "grouped-section-config";
  const snapshot = window.wwaiConfigSnapshots?.[snapshotId];
  const changes = window._wwaiProductGroupConfigChanges || {};
  
  if (!snapshot) {
    console.warn("No snapshot found for", snapshotId);
    return {};
  }
  
  // Start with a deep clone of the snapshot
  const result = structuredClone(snapshot);
  
  // Apply all changes on top of the snapshot
  Object.entries(changes).forEach(([path, value]) => {
    try {
      // Parse the path (e.g., "sectionId.productGroup.configType.fieldName")
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
      
      console.log(`Applied change: ${path} =`, value);
    } catch (error) {
      console.error(`Failed to apply change for path: ${path}`, error);
    }
  });
  
  return result;
};

window.wwaiSaveGroupedSectionConfig = function () {
  const snapshotId = "grouped-section-config";
  const updatedConfig = window.wwaiConfigPanelGetGroupedSectionConfig();
  
  window.wwaiConfigSnapshots[snapshotId] = structuredClone(updatedConfig);
  
  window._wwaiProductGroupConfigChanges = {};
  
  console.log("✅ Saved grouped section config changes to snapshot");
  console.log("📊 Updated snapshot:", window.wwaiConfigSnapshots[snapshotId]);
};